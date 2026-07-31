<template>
  <div class="post-footer">
    <!-- 版权信息 -->
    <div class="copyright-info">
      <div class="copyright-item">
        <i class="icon author-icon">👤</i>
        <span class="label">作者:</span>
        <span class="value">{{ author }} @ {{ siteName }}</span>
      </div>
      <div class="copyright-item">
        <i class="icon link-icon">🔗</i>
        <span class="label">本文链接:</span>
        <a :href="articleUrl" class="value link" target="_blank" rel="noopener">{{ articleUrl }}</a>
      </div>
      <div class="copyright-item">
        <i class="icon copyright-icon">©</i>
        <span class="label">版权声明:</span>
        <span class="value"
          >本站所有文章除特别声明外，均采用 (CC)BY-NC-SA 许可协议。转载请注明出处！</span
        >
      </div>
    </div>

    <!-- 上一篇/下一篇导航 -->
    <div class="post-navigation">
      <div class="nav-item prev" v-if="prevArticle" :style="prevBackgroundStyle">
        <router-link :to="`/post/${prevArticle.slug}`" class="nav-link" @click="scrollToTop">
          <div class="nav-content">
            <div class="nav-header">
              <span class="nav-type">上一篇</span>
              <span class="nav-category">
                <i class="flag-icon">🏷️</i>
                {{ getCategoryName(prevArticle.categories?.[0]) }}
              </span>
            </div>
            <h3 class="nav-title">{{ prevArticle.title }}</h3>
          </div>
        </router-link>
      </div>

      <div class="nav-item next" v-if="nextArticle" :style="nextBackgroundStyle">
        <router-link :to="`/post/${nextArticle.slug}`" class="nav-link" @click="scrollToTop">
          <div class="nav-content">
            <div class="nav-header">
              <span class="nav-type">下一篇</span>
              <span class="nav-category">
                <i class="flag-icon">🏷️</i>
                {{ getCategoryName(nextArticle.categories?.[0]) }}
              </span>
            </div>
            <h3 class="nav-title">{{ nextArticle.title }}</h3>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useArticlesStore } from '@/stores/articles'

const props = defineProps({
  currentSlug: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'CircleCoder',
  },
  siteName: {
    type: String,
    default: '碼農書架',
  },
})

const articlesStore = useArticlesStore()
const prevBackgroundStyle = ref({})
const nextBackgroundStyle = ref({})

// 计算文章URL
const articleUrl = computed(() => {
  return `http://circlecoder05.github.io/2025/05/14/${props.currentSlug}/`
})

// 获取上一篇和下一篇文章
const prevArticle = computed(() => {
  const currentIndex = articlesStore.articles.findIndex(
    (article) => article.slug === props.currentSlug,
  )
  if (currentIndex > 0) {
    return articlesStore.articles[currentIndex - 1]
  }
  return null
})

const nextArticle = computed(() => {
  const currentIndex = articlesStore.articles.findIndex(
    (article) => article.slug === props.currentSlug,
  )
  if (currentIndex >= 0 && currentIndex < articlesStore.articles.length - 1) {
    return articlesStore.articles[currentIndex + 1]
  }
  return null
})

// 获取背景样式
const getBackgroundStyle = async (article) => {
  let backgroundImage = ''

  // 优先使用文章的 cover 字段
  if (article.cover) {
    backgroundImage = article.cover
  } else {
    // 如果 cover 为空，从 images.yml 动态获取
    try {
      const response = await fetch('/img/images.yml')
      if (response.ok) {
        const yamlText = await response.text()
        // 简单的 YAML 解析，提取所有图片 URL
        const imageUrls = yamlText
          .split('\n')
          .filter((line) => line.trim().startsWith('- '))
          .map((line) => line.trim().substring(2))

        if (imageUrls.length > 0) {
          // 根据文章 slug 生成固定的随机索引
          const hash = article.slug.split('').reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0)
            return a & a
          }, 0)
          const randomIndex = Math.abs(hash) % imageUrls.length
          backgroundImage = imageUrls[randomIndex]
        }
      }
    } catch (error) {
      console.warn('Failed to load images.yml:', error)
    }
  }

  // 如果没有获取到图片，使用默认图片
  if (!backgroundImage) {
    backgroundImage = 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943773.jpg'
  }

  return {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  }
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

// 加载背景样式
const loadBackgroundStyles = async () => {
  if (prevArticle.value) {
    prevBackgroundStyle.value = await getBackgroundStyle(prevArticle.value)
  }
  if (nextArticle.value) {
    nextBackgroundStyle.value = await getBackgroundStyle(nextArticle.value)
  }
}

// 监听文章变化，重新加载背景样式
onMounted(() => {
  loadBackgroundStyles()
})

// 监听 prevArticle 和 nextArticle 的变化
watch([prevArticle, nextArticle], () => {
  loadBackgroundStyles()
})

// 滚动到顶部
const scrollToTop = () => {
  // 使用平滑滚动到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<style scoped lang="scss" src="@/styles/sfc/views/articles/PostFooter.scss"></style>
