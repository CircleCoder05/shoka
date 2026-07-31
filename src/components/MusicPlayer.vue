<template>
  <div class="music-player" :class="{ playing: isPlaying }">
    <!-- 上盒子：图片+歌词 -->
    <div class="upper-section">
      <!-- 左侧：专辑封面 -->
      <div class="album-section">
        <div class="cover">
          <!-- 唱针 -->
          <div class="needle" :class="{ playing: isPlaying }"></div>
          <!-- 磁盘 -->
          <div class="disc">
            <img :src="albumCover" :alt="songTitle" @error="handleImageError" class="album-image" />
          </div>
        </div>
      </div>

      <!-- 右侧：歌曲信息和歌词 -->
      <div class="content-section">
        <!-- 歌曲信息 -->
        <div class="song-info">
          <h4 class="song-title">{{ songTitle }}</h4>
          <span class="artist-name">{{ artistName }}</span>
        </div>

        <!-- 歌词区域 -->
        <div class="lrc">
          <div class="inner">
            <p
              v-for="(line, index) in windowLyrics"
              :key="line.time + '-' + line.text"
              class="lyric-line"
              :class="{ current: windowCurrentIndex === index }"
            >
              {{ line.text }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 下盒子：控制按钮和进度条 -->
    <div class="lower-section">
      <div class="control-bar">
        <button class="control-btn play-btn" @click="togglePlay">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>

        <!-- 进度条 -->
        <div class="progress-container">
          <div class="progress-bar" @click="seekTo">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="time-display">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="total-time">{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, default: '未知歌曲' },
  artist: { type: String, default: '未知歌手' },
  cover: { type: String, default: '' },
  lyrics: { type: Array, default: () => [] },
})

// 响应式数据
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progressPercent = ref(0)
const currentLyricIndex = ref(0)

// 歌词中央定位逻辑
const VISIBLE_LINES = 4
const CENTER_LINE = 2

const startLine = computed(() => {
  if (lyrics.value.length <= VISIBLE_LINES) return 0
  if (currentLyricIndex.value < CENTER_LINE) return 0
  if (currentLyricIndex.value > lyrics.value.length - CENTER_LINE - 1)
    return lyrics.value.length - VISIBLE_LINES
  return currentLyricIndex.value - CENTER_LINE
})
const windowLyrics = computed(() =>
  lyrics.value.slice(startLine.value, startLine.value + VISIBLE_LINES),
)
const windowCurrentIndex = computed(() => currentLyricIndex.value - startLine.value)

// 歌曲信息（优先用 props）
const songTitle = computed(() => props.title)
const artistName = computed(() => props.artist)
const albumCover = computed(() => {
  if (props.cover && props.cover.trim()) {
    return props.cover
  }
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjQwIiBmaWxsPSIjRkZGNkZCIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjE1IiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo='
})
const lyrics = computed(() =>
  Array.isArray(props.lyrics) && props.lyrics.length && typeof props.lyrics[0] === 'object'
    ? props.lyrics
    : [{ time: 0, text: '暂无歌词' }],
)

// 音频元素
let audio = null

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 播放/暂停
const togglePlay = () => {
  if (!audio) return

  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
  isPlaying.value = !isPlaying.value
}

// 这些函数暂时不需要，但保留以备将来扩展
// const previousTrack = () => {
//   console.log('Previous track')
// }

// const nextTrack = () => {
//   console.log('Next track')
// }

// const togglePlaylist = () => {
//   console.log('Toggle playlist')
// }

// 跳转到指定位置
const seekTo = (event) => {
  if (!audio) return

  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percent = clickX / rect.width
  const seekTime = percent * duration.value

  audio.currentTime = seekTime
  currentTime.value = seekTime
}

// 处理图片加载错误
const handleImageError = () => {
  // 图片加载失败时，albumCover 会自动回退到默认图片
  console.log('封面图片加载失败，使用默认图片')
}

// 初始化音频
const initAudio = () => {
  audio = new Audio()

  // 音频事件监听
  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio.duration
  })

  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime
    progressPercent.value = (currentTime.value / duration.value) * 100
    updateLyricIndex()
  })

  audio.addEventListener('ended', () => {
    isPlaying.value = false
    currentTime.value = 0
    progressPercent.value = 0
    currentLyricIndex.value = 0
  })

  audio.addEventListener('play', () => {
    isPlaying.value = true
  })

  audio.addEventListener('pause', () => {
    isPlaying.value = false
  })

  // 设置音频源
  if (props.url) {
    // 直接使用传入的URL作为音频源
    audio.src = props.url
    console.log('Audio source set:', props.url)
  }
}

onMounted(() => {
  initAudio()
  console.log('MusicPlayer mounted, controls section should be visible')
})

// 歌词同步高亮
function updateLyricIndex() {
  if (!audio || !lyrics.value.length) return
  let idx = 0
  for (let i = 0; i < lyrics.value.length; i++) {
    if (lyrics.value[i].time <= currentTime.value) idx = i
    else break
  }
  currentLyricIndex.value = idx
}

onUnmounted(() => {
  if (audio) {
    audio.pause()
    audio = null
  }
})
</script>

<style scoped lang="scss" src="@/styles/sfc/components/MusicPlayer.scss"></style>
