<template>
  <div class="music-player" :class="{ playing: isPlaying }">
    <!-- 上盒子：图片+歌词 -->
    <div class="upper-section">
      <!-- 左侧：专辑封面 -->
      <div class="album-section">
        <div class="cover">
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
              :key="index"
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

        <button class="control-btn volume-btn" @click="toggleMute">
          <svg v-if="!isMuted" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
            />
          </svg>
        </button>
      </div>

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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, default: '未知歌曲' },
  artist: { type: String, default: '未知歌手' },
  lyrics: { type: Array, default: () => [] },
})

// 响应式数据
const isPlaying = ref(false)
const isMuted = ref(false)
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
const albumCover = ref(
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjQwIiBmaWxsPSIjRkZGNkZCIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjE1IiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=',
)
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

// 静音/取消静音
const toggleMute = () => {
  if (!audio) return
  audio.muted = !audio.muted
  isMuted.value = audio.muted
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
  albumCover.value =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjQwIiBmaWxsPSIjRkZGNkZCIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjE1IiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo='
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

<style scoped>
/* 音乐播放器容器 - 修复脱标问题 */
.music-player {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  position: static;
}

/* 上盒子：图片+歌词 */
.upper-section {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.25rem 0.75rem;
  min-height: 120px;
}

/* 左侧：专辑封面 */
.album-section {
  flex-shrink: 0;
}

.cover {
  position: relative;
  cursor: pointer;
}

.cover::before {
  content: '';
  position: absolute;
  z-index: 1;
  background: url('/src/assets/images/play_needle.png') no-repeat center/contain;
  width: 3.4375rem;
  height: 5.1875rem;
  top: -1.5625rem;
  left: -1.5625rem;
  transform: rotateZ(-60deg);
  animation: rotate-needle-pause 0.5s 1 normal linear forwards;
  transform-origin: 0.625rem 0.625rem;
}

.disc {
  animation: rotate 20s linear infinite;
  animation-play-state: paused;
  padding: 1.5rem;
  max-height: 144px;
  position: relative;
}

.disc::after {
  content: '';
  position: absolute;
  background: url('/src/assets/images/play_disc.png') no-repeat center/contain;
  z-index: 1;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.album-image {
  object-fit: contain;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  position: relative;
  z-index: 0;
}

/* 右侧：歌曲信息和歌词 */
.content-section {
  display: flex;
  flex-direction: column;
  margin-left: 0.625rem;
  padding: 0.625rem;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  height: 100%;
  justify-content: space-between;
}

.song-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.song-title {
  margin: 0;
  text-overflow: ellipsis;
  max-height: 3rem;
  padding: 0;
  overflow: hidden;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
}

.artist-name {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

/* 歌词区域 */
.lrc {
  max-height: 6rem;
  height: 6rem;
  margin-top: 0.3125rem;
  font-size: 0.8rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner {
  width: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 2, 0.6, 1);
  text-align: center;
}

.lyric-line {
  font-size: 0.95rem;
  color: #888;
  line-height: 1.5rem;
  height: 1.5rem;
  padding: 0;
  margin: 0;
  transition: all 0.3s;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lyric-line.current {
  opacity: 1;
  color: #333;
  font-weight: 600;
  font-size: 1.1rem;
}

/* 下盒子：控制按钮和进度条 */
.lower-section {
  padding: 0.75rem 1.25rem 1.25rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.control-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.control-btn {
  background: #fff !important;
  border: 1px solid #ddd !important;
  cursor: pointer !important;
  padding: 0.5rem !important;
  border-radius: 50% !important;
  transition: all 0.2s ease;
  display: flex !important;
  align-items: center;
  justify-content: center;
  width: 36px !important;
  height: 36px !important;
  color: #666 !important;
}

.control-btn:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.control-btn svg {
  width: 18px;
  height: 18px;
  color: #666;
}

.play-btn {
  width: 40px !important;
  height: 40px !important;
  background: #fff !important;
  border-radius: 50% !important;
  border: 1px solid #ddd !important;
}

.play-btn:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.play-btn svg {
  color: #666;
  width: 18px;
  height: 18px;
}

/* 进度条 */
.progress-container {
  margin-top: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ee5a24);
  border-radius: 2px;
  transition: width 0.1s ease;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #999;
}

/* 播放状态动画 */
.playing .cover::before {
  animation: rotate-needle-resume 0.5s 1 normal linear forwards;
}

.playing .disc {
  animation-play-state: running;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotate-needle-pause {
  from {
    transform: rotateZ(-60deg);
  }
  to {
    transform: rotateZ(-30deg);
  }
}

@keyframes rotate-needle-resume {
  from {
    transform: rotateZ(-30deg);
  }
  to {
    transform: rotateZ(-60deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview {
    padding: 1.25rem 0.625rem 0;
    flex-direction: column;
  }

  .content-section {
    margin-left: 0;
    text-align: center;
  }

  .lrc {
    text-align: center;
  }

  .control-bar {
    gap: 0.5rem;
  }

  .control-btn {
    padding: 0.4rem;
  }

  .play-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
