import { createApp } from 'vue'
import MusicPlayer from '@/components/MusicPlayer.vue'

// 用 Meting API 获取网易云音乐元数据
async function fetchNeteaseInfo(songId) {
  try {
    const res = await fetch(
      `https://api.i-meto.com/meting/api?server=netease&type=song&id=${songId}&r=${Math.random()}`,
    )
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      return {
        title: data[0].title,
        artist: data[0].author,
      }
    }
  } catch {
    // 忽略错误
  }
  return { title: '未知歌曲', artist: '未知歌手' }
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
        let audioUrl = getAudioUrl(url)
        // 如果是网易云，获取歌名和歌手
        const match = url.match(/id=(\d+)/)
        if (url.includes('music.163.com') && match) {
          const info = await fetchNeteaseInfo(match[1])
          title = info.title
          artist = info.artist
        }
        // 创建播放器
        const musicApp = createApp(MusicPlayer, { url: audioUrl, title, artist })
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
