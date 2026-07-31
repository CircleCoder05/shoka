<template>
  <div class="article-card">
    <!-- 封面图片 -->
    <div class="article-cover">
      <img :src="getCoverImage(article)" :alt="article.title" @error="handleImageError" />
    </div>

    <!-- 文章信息 -->
    <div class="article-info">
      <h3 class="article-title">
        <router-link :to="`/post/${article.slug}`">
          {{ article.title }}
        </router-link>
      </h3>

      <div class="article-meta">
        <span class="author">
          <i class="ic i-user"></i>
          {{ article.author || 'CircleCoder' }}
        </span>
        <span class="date">
          <i class="ic i-calendar"></i>
          {{ formatDate(article.date) }}
        </span>
        <span v-if="getCategoryName(article.categories?.[0])" class="category">
          <i class="ic i-flag"></i>
          {{ getCategoryName(article.categories[0]) }}
        </span>
      </div>

      <div class="article-excerpt">
        {{ getExcerpt(article) }}
      </div>

      <div class="article-footer">
        <div class="article-stats">
          <span class="word-count">
            <i class="ic i-pen"></i>
            {{ getWordCount(article) }}字
          </span>
          <span class="read-time">
            <i class="ic i-clock"></i>
            {{ getReadTime(article) }}
          </span>
        </div>

        <div class="article-tags">
          <span v-for="tag in getTagsArray(article.tags)" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <router-link :to="`/post/${article.slug}`" class="read-more-btn">
          阅读全文
          <i class="ic i-arrow-right"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics'

defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const statisticsStore = useStatisticsStore()

// 工具函数
const getCoverImage = (article) => {
  return article.cover || '/default-cover.jpg'
}

const handleImageError = (event) => {
  if (event.target.getAttribute('src') !== '/default-cover.jpg') {
    event.target.src = '/default-cover.jpg'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const getCategoryName = (category) => {
  if (!category) return null

  // 新的数据结构：category是对象，包含key和name
  if (typeof category === 'object' && category.name) {
    return category.name
  }

  // 如果category是数组，取第一个元素
  let cleanCategory = category
  if (Array.isArray(category)) {
    cleanCategory = category[0]
  } else if (typeof category === 'string' && category.startsWith('[') && category.endsWith(']')) {
    // 处理数组字符串的情况，如 "[\"操作系统\"]"
    try {
      const parsed = JSON.parse(category)
      cleanCategory = Array.isArray(parsed) ? parsed[0] : parsed
    } catch {
      // 如果JSON解析失败，尝试简单的字符串处理
      cleanCategory = category.replace(/^\[["']?|["']?\]$/g, '')
    }
  }

  const categories = statisticsStore.categories
  return categories.find((cat) => cat.slug === cleanCategory)?.name || cleanCategory
}

const getTagsArray = (tags) => {
  if (!tags) return []
  return Array.isArray(tags) ? tags : [tags]
}

const getExcerpt = (article) => {
  return article.excerpt || '这篇文章还没有摘要...'
}

const getWordCount = (article) => {
  return article.wordCount || 0
}

const getReadTime = (article) => {
  return `${article.readTime || 1} 分钟`
}
</script>

<style scoped lang="scss" src="@/styles/sfc/views/archives/TimelineArticleCard.scss"></style>
