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
        @error="onImageError(index)"
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

const onImageError = (index) => {
  if (bannerImages.value[index] !== '/default-cover.jpg') {
    bannerImages.value[index] = '/default-cover.jpg'
  }
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

<style scoped lang="scss" src="@/styles/sfc/components/Banner.scss"></style>
