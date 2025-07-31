import { createApp } from 'vue'
import MusicPlayer from '@/components/MusicPlayer.vue'

// 用 Meting API 获取网易云音乐元数据和歌词
async function fetchNeteaseInfo(songId) {
  try {
    const res = await fetch(
      `https://api.i-meto.com/meting/api?server=netease&type=song&id=${songId}&r=${Math.random()}`,
    )
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      let lyrics = []
      let lrcRaw = data[0].lrc
      // 如果 lrc 是 URL，再请求一次
      if (/^https?:/.test(lrcRaw)) {
        const lrcRes = await fetch(lrcRaw)
        lrcRaw = await lrcRes.text()
      }
      // 解析歌词为 [{ time: 秒, text: '...' }]
      if (lrcRaw) {
        lyrics = lrcRaw
          .split('\n')
          .map((line) => {
            const match = line.match(/^\[(\d+):(\d+)(?:\.(\d+))?](.*)$/)
            if (match) {
              const min = parseInt(match[1])
              const sec = parseInt(match[2])
              const ms = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0
              const time = min * 60 + sec + ms / 1000
              return { time, text: match[4].trim() }
            }
            return null
          })
          .filter((item) => item && item.text)
      }
      return {
        title: data[0].title,
        artist: data[0].author,
        cover: data[0].pic,
        lyrics,
      }
    }
  } catch {
    // 忽略错误
  }
  return { title: '未知歌曲', artist: '未知歌手', cover: '', lyrics: [] }
}

function getAudioUrl(url) {
  const match = url.match(/id=(\d+)/)
  if (url.includes('music.163.com') && match) {
    return `https://music.163.com/song/media/outer/url?id=${match[1]}.mp3`
  }
  return url
}

export default {
  async mounted(el) {
    // 第一步：处理正常的media标签（开始和结束都在同一个p标签中）
    const normalMediaBlocks = el.querySelectorAll('p')
    for (const block of normalMediaBlocks) {
      const text = block.textContent || ''
      if (text.includes('{% media audio %}') && text.includes('{% endmedia %}')) {
        // 提取URL
        let url = ''

        // 首先尝试从a标签中提取URL
        const linkElement = block.querySelector('a[href*="music.163.com"]')
        if (linkElement) {
          url = linkElement.href
        } else {
          // 如果没有找到a标签，再从文本中提取
          const lines = text.split('\n')
          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.match(/^https?:\/\/[^\s]+$/)) {
              url = trimmed
              break
            }
          }
        }

        if (!url) continue

        let title = '未知歌曲'
        let artist = '未知歌手'
        let cover = ''
        let lyrics = []
        let audioUrl = getAudioUrl(url)
        // 如果是网易云，获取歌名、歌手、歌词
        const match = url.match(/id=(\d+)/)
        if (url.includes('music.163.com') && match) {
          const info = await fetchNeteaseInfo(match[1])
          title = info.title
          artist = info.artist
          cover = info.cover
          lyrics = info.lyrics
        }
        // 创建播放器
        const musicApp = createApp(MusicPlayer, { url: audioUrl, title, artist, cover, lyrics })
        const container = document.createElement('div')
        container.className = 'music-player-container'
        musicApp.mount(container)
        block.parentNode.replaceChild(container, block)
      }
    }

    // 第二步：处理特殊的ul/li结构（结束标签在ul/li中）
    const ulBlocks = el.querySelectorAll('ul')
    for (const ulBlock of ulBlocks) {
      const liElement = ulBlock.querySelector('li')
      if (liElement && liElement.textContent.includes('{% endmedia %}')) {
        // 找到包含endmedia的ul，现在查找它前面的包含media audio的p标签
        let startBlock = null
        let url = ''

        // 从ul的前一个兄弟元素开始向前查找
        let prevElement = ulBlock.previousElementSibling
        while (prevElement) {
          if (
            prevElement.tagName === 'P' &&
            prevElement.textContent.includes('{% media audio %}')
          ) {
            startBlock = prevElement
            break
          }
          prevElement = prevElement.previousElementSibling
        }

        // 从li中提取URL
        const linkElement = liElement.querySelector('a[href*="music.163.com"]')
        if (linkElement) {
          url = linkElement.href
        }

        if (!startBlock || !url) continue

        let title = '未知歌曲'
        let artist = '未知歌手'
        let cover = ''
        let lyrics = []
        let audioUrl = getAudioUrl(url)
        // 如果是网易云，获取歌名、歌手、歌词
        const match = url.match(/id=(\d+)/)
        if (url.includes('music.163.com') && match) {
          const info = await fetchNeteaseInfo(match[1])
          title = info.title
          artist = info.artist
          cover = info.cover
          lyrics = info.lyrics
        }
        // 创建播放器
        const musicApp = createApp(MusicPlayer, { url: audioUrl, title, artist, cover, lyrics })
        const container = document.createElement('div')
        container.className = 'music-player-container'
        musicApp.mount(container)

        // 替换整个结构：删除p和ul
        startBlock.parentNode.insertBefore(container, startBlock)
        startBlock.remove()
        ulBlock.remove()
      }
    }

    // 第三步：处理第三种格式（开始标签在p中，URL在ul/li中，结束标签在另一个p中）
    const endMediaBlocks = el.querySelectorAll('p')
    for (const endBlock of endMediaBlocks) {
      const text = endBlock.textContent || ''
      if (text.includes('{% endmedia %}')) {
        // 找到结束标签，现在向前查找开始标签和URL
        let startBlock = null
        let urlBlock = null
        let url = ''

        // 从结束标签的前一个兄弟元素开始向前查找
        let prevElement = endBlock.previousElementSibling
        while (prevElement) {
          if (prevElement.tagName === 'UL') {
            const liElement = prevElement.querySelector('li')
            if (liElement && liElement.querySelector('a[href*="music.163.com"]')) {
              urlBlock = prevElement
              const linkElement = liElement.querySelector('a[href*="music.163.com"]')
              url = linkElement.href
            }
          } else if (
            prevElement.tagName === 'P' &&
            prevElement.textContent.includes('{% media audio %}')
          ) {
            startBlock = prevElement
            break
          }
          prevElement = prevElement.previousElementSibling
        }

        if (!startBlock || !urlBlock || !url) continue

        let title = '未知歌曲'
        let artist = '未知歌手'
        let cover = ''
        let lyrics = []
        let audioUrl = getAudioUrl(url)
        // 如果是网易云，获取歌名、歌手、歌词
        const match = url.match(/id=(\d+)/)
        if (url.includes('music.163.com') && match) {
          const info = await fetchNeteaseInfo(match[1])
          title = info.title
          artist = info.artist
          cover = info.cover
          lyrics = info.lyrics
        }
        // 创建播放器
        const musicApp = createApp(MusicPlayer, { url: audioUrl, title, artist, cover, lyrics })
        const container = document.createElement('div')
        container.className = 'music-player-container'
        musicApp.mount(container)

        // 替换整个结构：删除开始标签p、URL的ul、结束标签p
        startBlock.parentNode.insertBefore(container, startBlock)
        startBlock.remove()
        urlBlock.remove()
        endBlock.remove()
      }
    }
  },
  async updated(el) {
    await this.mounted(el)
  },
}
