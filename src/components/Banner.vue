<template>
  <div class="app-banner">
    <div class="banner-images">
      <img
        v-for="(image, index) in bannerImages"
        :key="index"
        :src="image"
        :alt="bannerAlt"
        class="banner-image"
        @load="onImageLoad(index)"
      />
    </div>

    <!-- 默认网站标题 -->
    <div v-if="!isArticlePage" class="banner-title">
      <h1>{{ bannerTitle }}</h1>
      <p class="typewriter">{{ typedSubtitle }}</p>
    </div>

    <!-- 文章详情页信息 -->
    <div v-else class="article-banner">
      <div class="article-info">
        <h1 class="article-title">{{ articleTitle }}</h1>
        <div class="article-meta">
          <div class="meta-item">
            <span class="icon"><i class="ic i-calendar"></i></span>
            <span class="meta-value">{{ formatDate(articleDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="icon"><i class="ic i-pen"></i></span>
            <span class="meta-value">{{ articleWordCount }}</span>
          </div>
          <div class="meta-item">
            <span class="icon"><i class="ic i-clock"></i></span>
            <span class="meta-value">{{ articleReadTime }}</span>
          </div>
        </div>
        <div class="article-categories" v-if="articleCategories && articleCategories.length">
          <span v-for="category in articleCategories" :key="category" class="category-tag">
            {{ getCategoryName(category) }}
          </span>
        </div>
      </div>
    </div>

    <div class="waves">
      <svg viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" class="wave1" />
          <use xlink:href="#gentle-wave" x="48" y="3" class="wave2" />
          <use xlink:href="#gentle-wave" x="48" y="5" class="wave3" />
          <use xlink:href="#gentle-wave" x="48" y="7" class="wave4" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useConfigStore } from '@/stores/config'

// 定义组件名称
defineOptions({
  name: 'BannerComponent',
})

// Props
const props = defineProps({
  siteTitle: {
    type: String,
    default: 'CircleCoder',
  },
  siteSubtitle: {
    type: String,
    default: '= 仰望星空 =',
  },
  bannerImage: {
    type: String,
    default: 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943773.jpg',
  },
  bannerAlt: {
    type: String,
    default: 'banner',
  },

  // 文章详情页信息
  isArticlePage: {
    type: Boolean,
    default: false,
  },
  articleTitle: {
    type: String,
    default: '',
  },
  articleAuthor: {
    type: String,
    default: '',
  },
  articleDate: {
    type: String,
    default: '',
  },
  articleWordCount: {
    type: [String, Number],
    default: 0,
  },
  articleReadTime: {
    type: [String, Number],
    default: 0,
  },
  articleViews: {
    type: [String, Number],
    default: 0,
  },
  articleCategories: {
    type: Array,
    default: () => [],
  },
})

const configStore = useConfigStore()

// 轮播图片相关
const bannerImages = ref([])
const loadedImages = ref(new Set())

// 随机图片列表
const randomImageUrls = ref([])

// 加载图片列表
const loadImageUrls = async () => {
  try {
    const response = await fetch('/img/images.yml')
    const yamlText = await response.text()
    // 简单的YAML解析，提取URL
    const urls = yamlText
      .split('\n')
      .filter((line) => line.trim().startsWith('- '))
      .map((line) => line.trim().substring(2))
    randomImageUrls.value = urls
  } catch (error) {
    console.error('Failed to load images.yml:', error)
    // 使用默认图片作为后备
    randomImageUrls.value = [
      'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943773.jpg',
    ]
  }
}

// 初始化轮播图片
const initBannerImages = () => {
  if (randomImageUrls.value.length === 0) return

  // 随机选择6张图片进行轮播（按照hexo的实现）
  const shuffled = [...randomImageUrls.value].sort(() => 0.5 - Math.random())
  bannerImages.value = shuffled.slice(0, 6)
}

// 图片加载完成
const onImageLoad = (index) => {
  loadedImages.value.add(index)
}

// 开始轮播 - 现在由CSS动画控制
const startCarousel = () => {
  // CSS动画自动控制轮播
}

// 停止轮播
const stopCarousel = () => {
  // CSS动画自动控制轮播
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 获取分类名称（去除数组符号）
const getCategoryName = (category) => {
  if (!category) return '未分类'

  // 新的数据结构：category是对象，包含key和name
  if (typeof category === 'object' && category.name) {
    return category.name
  }

  // 如果是数组，取第一个元素
  if (Array.isArray(category)) {
    return category[0] || '未分类'
  }
  return category
}

const bannerTitle = computed(() => configStore.siteConfig.bannerTitle || 'CircleCoder')
const bannerSubtitle = computed(() => configStore.siteConfig.bannerSubtitle || '仰望星空')

// 打字机特效
const typedSubtitle = ref('')
let typingTimer = null
let deleting = false
let charIndex = 0
const typingSpeed = 90
const pauseAfterTyping = 2000 // 打完字后停留2秒
const pauseAfterDeleting = 600
const extraSpace = '\u00A0' // 不断行的空格

function startTyping() {
  const text = bannerSubtitle.value + extraSpace
  if (!deleting) {
    if (charIndex < text.length) {
      typedSubtitle.value += text[charIndex]
      charIndex++
      typingTimer = setTimeout(startTyping, typingSpeed)
    } else {
      typingTimer = setTimeout(() => {
        deleting = true
        startTyping()
      }, pauseAfterTyping)
    }
  } else {
    if (charIndex > 1) {
      // 保留最后一个空白字符
      typedSubtitle.value = text.slice(0, charIndex - 1)
      charIndex--
      typingTimer = setTimeout(startTyping, typingSpeed)
    } else {
      deleting = false
      typingTimer = setTimeout(startTyping, pauseAfterDeleting)
    }
  }
}

// 监听文章页面变化
watch(
  () => props.isArticlePage,
  () => {
    // 所有页面都使用轮播，只是显示的内容不同
    initBannerImages()
    startCarousel()
  },
)

onMounted(async () => {
  await loadImageUrls()
  configStore.loadConfig()

  // 所有页面都使用轮播
  initBannerImages()
  startCarousel()
  typedSubtitle.value = extraSpace
  charIndex = 1
  deleting = false
  startTyping()
})

onUnmounted(() => {
  stopCarousel()
  if (typingTimer) clearTimeout(typingTimer)
})
</script>

<style scoped>
/* Banner样式 */
.app-banner {
  width: 100%;
  height: 66vh;
  min-height: 320px;
  max-height: 600px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  z-index: 1;
  margin-top: 0; /* 移除margin-top，让banner直接顶到导航栏下面 */
}

.banner-images {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1);
  filter: brightness(0.85) blur(0.5px);
  animation: bannerAnimation 36s linear infinite;
}

/* 为每张图片添加不同的动画延迟 */
.banner-image:nth-child(1) {
  animation-delay: 0s;
}

.banner-image:nth-child(2) {
  animation-delay: 6s;
}

.banner-image:nth-child(3) {
  animation-delay: 12s;
}

.banner-image:nth-child(4) {
  animation-delay: 18s;
}

.banner-image:nth-child(5) {
  animation-delay: 24s;
}

.banner-image:nth-child(6) {
  animation-delay: 30s;
}

@keyframes bannerAnimation {
  0% {
    opacity: 0;
    animation-timing-function: ease-in;
  }
  2% {
    opacity: 1;
  }
  8% {
    opacity: 1;
    transform: scale(1.05);
    animation-timing-function: ease-out;
  }
  17% {
    opacity: 1;
    transform: scale(1.1);
  }
  25% {
    opacity: 0;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
  }
}

.banner-title {
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: center;
  margin-bottom: 32px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.banner-title h1 {
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0 0 16px 0;
}

.banner-title p {
  font-size: 1.7rem;
  font-weight: 500;
  letter-spacing: 1.5px;
  line-height: 1.5;
  color: #fff;
  margin: 0;
  opacity: 0.96;
  text-shadow:
    0 4px 24px rgba(0, 0, 0, 0.22),
    0 1px 8px rgba(0, 0, 0, 0.18);
}

.typewriter {
  border-right: 2px solid #fff;
  white-space: pre;
  overflow: hidden;
  display: inline-block;
  animation: blink-cursor 0.8s steps(1) infinite;
}
@keyframes blink-cursor {
  0%,
  100% {
    border-color: #fff;
  }
  50% {
    border-color: transparent;
  }
}

/* 文章详情页样式 */
.article-banner {
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: center;
  margin-bottom: 32px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  padding: 0 20px;
}

.article-info {
  width: 100%;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: 1px;
  margin: 0 0 24px 0;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.meta-item .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.meta-item .icon i {
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.8);
}

.meta-item .meta-value {
  font-weight: 600;
  color: #fff;
}

.article-categories {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.category-tag {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  min-height: 50px;
  max-height: 150px;
  z-index: 1;
}

.waves svg {
  width: 100%;
  height: 100%;
}

.parallax use {
  animation: waveMove 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.wave1 {
  animation-delay: -2s;
  animation-duration: 7s;
  fill: rgba(255, 255, 255, 0.7);
}

.wave2 {
  animation-delay: -3s;
  animation-duration: 10s;
  fill: rgba(255, 255, 255, 0.5);
}

.wave3 {
  animation-delay: -4s;
  animation-duration: 13s;
  fill: rgba(255, 255, 255, 0.3);
}

.wave4 {
  animation-delay: -5s;
  animation-duration: 20s;
  fill: rgba(255, 255, 255, 1);
}

/* 暗色主题下的波浪颜色 */
html.dark-theme .wave1 {
  fill: rgba(44, 49, 60, 0.7);
}

html.dark-theme .wave2 {
  fill: rgba(44, 49, 60, 0.5);
}

html.dark-theme .wave3 {
  fill: rgba(44, 49, 60, 0.3);
}

html.dark-theme .wave4 {
  fill: rgba(44, 49, 60, 1);
}

@keyframes waveMove {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .banner-title h1 {
    font-size: 2.4rem;
  }

  .banner-title p {
    font-size: 1.3rem;
  }

  .article-title {
    font-size: 2.2rem;
  }

  .article-meta {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .app-banner {
    height: 60vh;
    min-height: 60vh;
    margin-top: 0; /* 移除margin-top */
  }

  .banner-title h1 {
    font-size: 2rem;
    letter-spacing: 1px;
  }

  .banner-title p {
    font-size: 1.1rem;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .article-meta {
    flex-direction: row;
    justify-content: center;
    gap: 16px;
    flex-wrap: nowrap;
  }

  .meta-item {
    font-size: 0.9rem;
    gap: 6px;
  }

  .meta-item .icon {
    width: 18px;
    height: 18px;
  }

  .meta-item .icon i {
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .app-banner {
    height: 60vh;
    min-height: 60vh;
    margin-top: 0; /* 移除margin-top */
  }

  .banner-title h1 {
    font-size: 1.8rem;
  }

  .banner-title p {
    font-size: 1rem;
  }

  .article-title {
    font-size: 1.6rem;
  }

  .article-meta {
    gap: 12px;
  }

  .meta-item {
    font-size: 0.85rem;
    gap: 4px;
  }

  .meta-item .icon {
    width: 16px;
    height: 16px;
  }

  .meta-item .icon i {
    font-size: 0.9em;
  }

  .category-tag {
    font-size: 0.8rem;
    padding: 4px 12px;
  }
}

/* 暗色模式下的Banner图片暗化 */
html.dark-theme .banner-image {
  filter: brightness(0.6) contrast(1.2) blur(0.5px) !important;
}
</style>
