<template>
  <PageContainer>
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <i class="ic i-arrow-left"></i>
          返回
        </button>
        <div class="title-section">
          <h1 class="page-title">{{ pageTitle }}</h1>
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
                {{ tag }}
              </span>
            </div>
            <div class="article-categories" v-if="article.categories && article.categories.length">
              <span
                v-for="category in article.categories"
                :key="category"
                class="category-badge"
                @click.stop="goToCategory(category)"
              >
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
import { computed, ref, onMounted } from 'vue'
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
  if (type.value === 'category') {
    return name.value === '未分类' ? '未分类文章' : `${name.value} 分类`
  } else {
    return `${name.value} 标签`
  }
})

const pageSubtitle = computed(() => {
  if (type.value === 'category') {
    return `查看 ${name.value} 分类下的所有文章`
  } else {
    return `查看 ${name.value} 标签下的所有文章`
  }
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
      // 处理未分类的特殊情况
      const actualCategoryName = name.value === '未分类' ? 'uncategorized' : name.value
      articles.value = statisticsStore.getArticlesByCategory(actualCategoryName)
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
</script>

<style scoped>
.page-header {
  margin-bottom: 3rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, #38a1db 0%, #ed6ea0 100%);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(56, 161, 219, 0.2);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(56, 161, 219, 0.3);
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #38a1db 0%, #ed6ea0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading {
  color: #666;
}

.error {
  text-align: center;
  color: #e9546b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ed6ea0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.articles-header {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(56, 161, 219, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.stat-item i {
  color: #38a1db;
  font-size: 1.1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(56, 161, 219, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(56, 161, 219, 0.15);
}

.article-header {
  margin-bottom: 1rem;
}

.article-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.article-meta i {
  font-size: 0.8rem;
}

.article-excerpt {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.article-footer {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.article-tags,
.article-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag-badge,
.category-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-badge {
  background: rgba(56, 161, 219, 0.1);
  color: #38a1db;
}

.category-badge {
  background: rgba(237, 110, 160, 0.1);
  color: #ed6ea0;
}

.tag-badge:hover {
  background: #38a1db;
  color: #fff;
  transform: translateY(-1px);
}

.category-badge:hover {
  background: #ed6ea0;
  color: #fff;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .back-btn {
    align-self: flex-start;
  }

  .page-title {
    font-size: 2rem;
  }

  .stats {
    flex-direction: column;
    gap: 1rem;
  }

  .article-card {
    padding: 1rem;
  }

  .article-title {
    font-size: 1.2rem;
  }

  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .article-card {
    padding: 0.8rem;
  }

  .article-title {
    font-size: 1.1rem;
  }

  .article-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
