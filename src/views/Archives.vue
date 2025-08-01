<template>
  <div class="archives-page">
    <div class="page-header">
      <h1 class="page-title">文章归档</h1>
      <p class="page-subtitle">按时间顺序整理的所有文章</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else class="archives-content">
      <div v-for="(articles, year) in archivesByYear" :key="year" class="year-group">
        <h2 class="year-title">{{ year }}</h2>
        <div class="articles-list">
          <div v-for="article in articles" :key="article.slug" class="article-item">
            <div class="article-date">
              {{ formatDate(article.date) }}
            </div>
            <div class="article-info">
              <h3 class="article-title">
                <router-link :to="`/post/${article.slug}`">
                  {{ article.title }}
                </router-link>
              </h3>
              <div class="article-meta">
                <span v-if="article.categories && article.categories.length" class="category">
                  <i class="ic i-flag"></i>
                  {{ getCategoryName(article.categories[0]) }}
                </span>
                <span v-if="getTagsString(article.tags)" class="tags">
                  <i class="ic i-tags"></i>
                  {{ getTagsString(article.tags) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'

const statisticsStore = useStatisticsStore()

const loading = computed(() => statisticsStore.loading)
const error = computed(() => statisticsStore.error)
const archivesByYear = computed(() => statisticsStore.archivesByYear)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  })
}

const getCategoryName = (category) => {
  if (!category) return '未分类'
  if (Array.isArray(category)) {
    return category[0] || '未分类'
  }
  if (typeof category === 'string') {
    return category
  }
  return '未分类'
}

const getTagsString = (tags) => {
  if (!tags) return ''
  if (Array.isArray(tags)) {
    return tags.filter((tag) => typeof tag === 'string' && tag).join(', ')
  }
  if (typeof tags === 'string') {
    return tags
  }
  return ''
}

onMounted(async () => {
  if (statisticsStore.archives.length === 0) {
    await statisticsStore.loadStatistics()
  }
})
</script>

<style scoped>
.archives-page {
  max-width: 1050px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 1rem 0;
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

.year-group {
  margin-bottom: 3rem;
}

.year-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ed6ea0;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.article-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.article-date {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.article-info {
  flex: 1;
}

.article-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.article-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.article-title a:hover {
  color: #ed6ea0;
}

.article-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.category,
.tags {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.category i,
.tags i {
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .archives-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .year-title {
    font-size: 1.5rem;
  }

  .article-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .article-date {
    min-width: auto;
    align-self: flex-start;
  }

  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
