<template>
  <PageContainer>
    <div class="page-header">
      <h1 class="page-title">文章分类</h1>
      <p class="page-subtitle">按主题分类整理的文章</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else class="categories-content">
      <div class="categories-grid">
        <div
          v-for="category in categoriesWithCount"
          :key="category.slug"
          class="category-card"
          @click="selectCategory(category.name)"
        >
          <div class="category-icon">
            <i class="ic i-flag"></i>
          </div>
          <div class="category-info">
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-count">{{ category.count }} 篇文章</p>
          </div>
          <div class="category-arrow">
            <i class="ic i-arrow-right"></i>
          </div>
        </div>
      </div>

      <!-- 分类详情弹窗 -->
      <div v-if="selectedCategory" class="category-modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedCategory.name }}</h2>
            <button class="close-btn" @click="closeModal">
              <i class="ic i-close"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="articles-list">
              <div
                v-for="article in selectedCategoryArticles"
                :key="article.slug"
                class="article-item"
              >
                <div class="article-date">
                  {{ formatDate(article.date) }}
                </div>
                <div class="article-info">
                  <h3 class="article-title">
                    <router-link :to="`/post/${article.slug}`" @click="closeModal">
                      {{ article.title }}
                    </router-link>
                  </h3>
                  <div class="article-meta">
                    <span v-if="article.tags && article.tags.length" class="tags">
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
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import PageContainer from '@/components/PageContainer.vue'

const statisticsStore = useStatisticsStore()

const loading = computed(() => statisticsStore.loading)
const error = computed(() => statisticsStore.error)
const categoriesWithCount = computed(() => statisticsStore.categoriesWithCount)

const selectedCategory = ref(null)
const selectedCategoryArticles = ref([])

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  })
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

const selectCategory = (categoryName) => {
  selectedCategory.value = { name: categoryName }
  selectedCategoryArticles.value = statisticsStore.getArticlesByCategory(categoryName)
}

const closeModal = () => {
  selectedCategory.value = null
  selectedCategoryArticles.value = []
}

onMounted(async () => {
  if (statisticsStore.archives.length === 0) {
    await statisticsStore.loadStatistics()
  }
})
</script>

<style scoped>
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.category-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.3rem 0;
}

.category-count {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.category-arrow {
  color: #ccc;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.category-card:hover .category-arrow {
  color: #ed6ea0;
  transform: translateX(4px);
}

/* 弹窗样式 */
.category-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.article-item:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-date {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.article-info {
  flex: 1;
}

.article-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
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
  font-size: 0.85rem;
  color: #666;
}

.tags {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tags i {
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .categories-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .category-card {
    padding: 1rem;
  }

  .category-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .category-name {
    font-size: 1.1rem;
  }

  .modal-content {
    margin: 1rem;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .article-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .article-date {
    min-width: auto;
    align-self: flex-start;
  }
}
</style>
