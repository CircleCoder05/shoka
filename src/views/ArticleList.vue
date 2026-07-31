<template>
  <PageContainer>
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <i class="ic i-arrow-left"></i>
          返回
        </button>
        <div class="title-section">
          <h1 class="page-title">
            <i class="ic" :class="type === 'category' ? 'i-flag' : 'i-tags'"></i>
            {{ pageTitle }}
          </h1>
          <p class="page-subtitle">{{ pageSubtitle }}</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else class="articles-content">
      <div class="articles-header">
        <div class="stats">
          <span class="stat-item">
            <i class="ic i-file-text"></i>
            {{ articles.length }} 篇文章
          </span>
          <span class="stat-item">
            <i class="ic i-clock"></i>
            总计 {{ totalWordCount }} 字
          </span>
        </div>
      </div>

      <div v-if="articles.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="ic i-inbox"></i>
        </div>
        <h3>暂无文章</h3>
        <p>该{{ typeText }}下还没有文章</p>
      </div>

      <div v-else class="articles-list">
        <div
          v-for="article in articles"
          :key="article.slug"
          class="article-card"
          @click="goToArticle(article.slug)"
        >
          <div class="article-header">
            <h3 class="article-title">{{ article.title }}</h3>
            <div class="article-meta">
              <span class="article-date">
                <i class="ic i-calendar"></i>
                {{ formatDate(article.date) }}
              </span>
              <span class="article-word-count">
                <i class="ic i-file-text"></i>
                {{ article.wordCount || 0 }} 字
              </span>
              <span class="article-read-time">
                <i class="ic i-clock"></i>
                {{ article.readTime || 1 }} 分钟
              </span>
            </div>
          </div>

          <div class="article-excerpt">
            {{ article.excerpt }}
          </div>

          <div class="article-footer">
            <div class="article-tags" v-if="article.tags && article.tags.length">
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="tag-badge"
                @click.stop="goToTag(tag)"
              >
                <i class="ic i-tags"></i>
                {{ tag }}
              </span>
            </div>
            <div class="article-categories" v-if="article.categories && article.categories.length">
              <span
                v-for="category in getCategoryNames(article.categories)"
                :key="category"
                class="category-badge"
                @click.stop="goToCategory(category)"
              >
                <i class="ic i-flag"></i>
                {{ category }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStatisticsStore } from '@/stores/statistics'
import PageContainer from '@/components/PageContainer.vue'

const route = useRoute()
const router = useRouter()
const statisticsStore = useStatisticsStore()

// 定义props
const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
})

const loading = ref(false)
const error = ref(null)
const articles = ref([])

// 从路由参数获取信息
const type = computed(() => route.params.type || props.type) // 'category' 或 'tag'
const name = computed(() => route.params.name || props.name)
const typeText = computed(() => (type.value === 'category' ? '分类' : '标签'))

// 页面标题和副标题
const pageTitle = computed(() => {
  return name.value
})

const pageSubtitle = computed(() => {
  return ''
})

// 计算总字数
const totalWordCount = computed(() => {
  return articles.value.reduce((total, article) => total + (article.wordCount || 0), 0)
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const goBack = () => {
  if (type.value === 'category') {
    router.push('/categories')
  } else {
    router.push('/tags')
  }
}

const goToArticle = (slug) => {
  router.push(`/post/${slug}`)
}

const goToTag = (tag) => {
  router.push(`/tag/${tag}`)
}

const getCategoryNames = (categories) => {
  if (!categories) return []

  const cleanCategories = []

  if (Array.isArray(categories)) {
    // 如果是数组，处理每个元素
    categories.forEach((category) => {
      const cleanCategory = getCleanCategory(category)
      if (cleanCategory && cleanCategory !== '未分类') {
        cleanCategories.push(cleanCategory)
      }
    })
  } else if (typeof categories === 'string') {
    // 如果是字符串，尝试解析
    const cleanCategory = getCleanCategory(categories)
    if (cleanCategory && cleanCategory !== '未分类') {
      cleanCategories.push(cleanCategory)
    }
  }

  return cleanCategories
}

const getCleanCategory = (category) => {
  if (!category) return null

  let cleanCategory = category

  // 新的数据结构：category是对象，包含key和name
  if (typeof category === 'object' && category.name) {
    cleanCategory = category.name
  } else if (Array.isArray(category)) {
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

  return cleanCategory
}

const goToCategory = (category) => {
  router.push(`/category/${category}`)
}

const loadArticles = async () => {
  loading.value = true
  error.value = null

  try {
    if (statisticsStore.archives.length === 0) {
      await statisticsStore.loadStatistics()
    }

    if (type.value === 'category') {
      // 直接使用分类名，不需要特殊映射
      articles.value = statisticsStore.getArticlesByCategory(name.value)
    } else {
      articles.value = statisticsStore.getArticlesByTag(name.value)
    }

    // 按日期排序
    articles.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (err) {
    error.value = err.message
    console.error('Failed to load articles:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticles()
})

// 监听路由参数变化，重新加载文章
watch(
  () => [route.params.type, route.params.name],
  () => {
    loadArticles()
  },
  { immediate: false },
)
</script>

<style scoped lang="scss" src="@/styles/sfc/views/ArticleList.scss"></style>
