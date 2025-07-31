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
    const mediaBlocks = el.querySelectorAll('p')
    for (const block of mediaBlocks) {
      const text = block.textContent || ''
      if (text.includes('{% media audio %}') && text.includes('{% endmedia %}')) {
        // 提取URL
        const lines = text.split('\n')
        let url = ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('-')) {
            const m = trimmed.match(/-\s*(https?:\/\/[^\s]+)/)
            if (m) {
              url = m[1]
              break
            }
          } else if (trimmed.match(/^https?:\/\/[^\s]+$/)) {
            url = trimmed
            break
          }
        }
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
  },
  async updated(el) {
    await this.mounted(el)
  },
}
