<template>
  <Teleport to="body">
    <div
      v-if="searchStore.showSearchModal"
      class="search-modal-overlay"
      @click="handleOverlayClick"
    >
      <div class="search-modal" @click.stop>
        <!-- 搜索头部 -->
        <div class="search-header">
          <div class="search-input-wrapper">
            <i class="ic i-search search-icon"></i>
            <input
              ref="searchInput"
              v-model="searchStore.searchQuery"
              @input="handleSearch"
              @keydown.escape="searchStore.closeSearchModal"
              @keydown.enter="handleEnterKey"
              type="text"
              placeholder="搜索文章标题、内容、标签..."
              class="search-input"
            />
            <button
              v-if="searchStore.searchQuery"
              @click="searchStore.clearSearch"
              class="clear-btn"
              title="清空搜索"
            >
              <i class="ic i-times"></i>
            </button>
          </div>
          <button @click="searchStore.closeSearchModal" class="close-btn" title="关闭搜索">
            <i class="ic i-times"></i>
          </button>
        </div>

        <!-- 搜索内容 -->
        <div class="search-content">
          <!-- 搜索提示 -->
          <div v-if="!searchStore.searchQuery" class="search-tips">
            <div class="tip-item">
              <i class="ic i-info-circle"></i>
              <span>输入关键词搜索文章标题、内容、标签和分类</span>
            </div>
            <div class="tip-item">
              <i class="ic i-keyboard"></i>
              <span>按 <kbd>ESC</kbd> 关闭搜索</span>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-else-if="searchStore.isSearching" class="search-loading">
            <div class="loading-spinner"></div>
            <span>搜索中...</span>
          </div>

          <!-- 搜索结果 -->
          <div v-else-if="searchStore.hasResults" class="search-results">
            <div class="results-header">
              <span class="results-count">找到 {{ searchStore.resultCount }} 篇相关文章</span>
            </div>

            <div class="results-list">
              <div
                v-for="article in searchStore.searchResults"
                :key="article.slug"
                class="result-item"
                @click="navigateToArticle(article.slug)"
              >
                <div class="result-content">
                  <h3
                    class="result-title"
                    v-html="searchStore.getHighlightedTitle(article.title, searchStore.searchQuery)"
                  ></h3>
                  <p
                    class="result-excerpt"
                    v-html="
                      searchStore.getHighlightedExcerpt(article.excerpt, searchStore.searchQuery)
                    "
                  ></p>
                  <div class="result-meta">
                    <span class="result-date">{{ formatDate(article.date) }}</span>
                    <div
                      v-if="article.categories && article.categories.length"
                      class="result-categories"
                    >
                      <span
                        v-for="category in article.categories"
                        :key="typeof category === 'object' ? category.key : category"
                        class="category-tag"
                      >
                        {{ typeof category === 'object' ? category.name : category }}
                      </span>
                    </div>
                    <div v-if="article.tags && article.tags.length" class="result-tags">
                      <span v-for="tag in article.tags.slice(0, 3)" :key="tag" class="tag">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无结果 -->
          <div v-else-if="searchStore.searchQuery" class="no-results">
            <i class="ic i-search"></i>
            <h3>未找到相关文章</h3>
            <p>尝试使用不同的关键词或简化搜索条件</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'

const router = useRouter()
const searchStore = useSearchStore()

// 显示所有搜索结果

// 处理搜索输入
const handleSearch = (event) => {
  const query = event.target.value
  searchStore.searchWithDebounce(query)
}

// 处理Enter键
const handleEnterKey = async () => {
  if (searchStore.searchQuery.trim()) {
    await searchStore.performSearch(searchStore.searchQuery.trim())
  }
}

// 处理遮罩层点击
const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    searchStore.closeSearchModal()
  }
}

// 导航到文章
const navigateToArticle = (slug) => {
  router.push(`/post/${slug}`)
  searchStore.closeSearchModal()
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// 键盘事件处理
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    searchStore.closeSearchModal()
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    searchStore.openSearchModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  animation: overlay-fade-in 0.2s ease-out;
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.search-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 70vh;
  overflow: hidden;
  animation: modal-slide-in 0.3s ease-out;
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 搜索头部 */
.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #999;
  font-size: 16px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #e9546b;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
}

.clear-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

/* 搜索内容 */
.search-content {
  max-height: calc(70vh - 80px);
  overflow-y: auto;
}

/* 搜索提示 */
.search-tips {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.tip-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item i {
  color: #e9546b;
}

kbd {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-family: monospace;
}

/* 加载状态 */
.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #e9546b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 搜索结果 */
.search-results {
  padding: 0;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
}

.results-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.view-all-link {
  color: #e9546b;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #d94356;
}

.results-list {
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.result-item:hover {
  background: #f9f9f9;
}

.result-item:last-child {
  border-bottom: none;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.result-title :deep(mark) {
  background: #fff3cd;
  color: #856404;
  padding: 2px 4px;
  border-radius: 3px;
}

.result-excerpt {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-excerpt :deep(mark) {
  background: #fff3cd;
  color: #856404;
  padding: 2px 4px;
  border-radius: 3px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.result-date {
  font-weight: 500;
}

.result-categories {
  display: flex;
  gap: 6px;
}

.category-tag {
  background: #e9546b;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.result-tags {
  display: flex;
  gap: 6px;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

/* 无结果 */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-results i {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 16px;
}

.no-results h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.no-results p {
  margin: 0;
  font-size: 14px;
}

/* 暗色模式样式 */
html.dark-theme .search-modal-overlay {
  background: rgba(0, 0, 0, 0.8);
}

html.dark-theme .search-modal {
  background: #2c313c;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

html.dark-theme .search-header {
  border-bottom-color: #3e4451;
}

html.dark-theme .search-icon {
  color: #abb2bf;
}

html.dark-theme .search-input {
  background: #21252b;
  border-color: #3e4451;
  color: #abb2bf;
}

html.dark-theme .search-input:focus {
  border-color: #ed6ea0;
}

html.dark-theme .search-input::placeholder {
  color: #5c6370;
}

html.dark-theme .clear-btn {
  color: #abb2bf;
}

html.dark-theme .clear-btn:hover {
  background: #3e4451;
  color: #ffffff;
}

html.dark-theme .close-btn {
  color: #abb2bf;
}

html.dark-theme .close-btn:hover {
  background: #3e4451;
  color: #ffffff;
}

html.dark-theme .search-tips {
  color: #abb2bf;
}

html.dark-theme .tip-item i {
  color: #ed6ea0;
}

html.dark-theme kbd {
  background: #3e4451;
  border-color: #5c6370;
  color: #abb2bf;
}

html.dark-theme .search-loading {
  color: #abb2bf;
}

html.dark-theme .loading-spinner {
  border-color: #3e4451;
  border-top-color: #ed6ea0;
}

html.dark-theme .results-header {
  background: #21252b;
  border-bottom-color: #3e4451;
}

html.dark-theme .results-count {
  color: #abb2bf;
}

html.dark-theme .view-all-link {
  color: #ed6ea0;
}

html.dark-theme .view-all-link:hover {
  color: #ec8c69;
}

html.dark-theme .result-item {
  border-bottom-color: #3e4451;
}

html.dark-theme .result-item:hover {
  background: #21252b;
}

html.dark-theme .result-title {
  color: #abb2bf;
}

html.dark-theme .result-title :deep(mark) {
  background: #ed6ea0;
  color: #000000;
}

html.dark-theme .result-excerpt {
  color: #7f848e;
}

html.dark-theme .result-excerpt :deep(mark) {
  background: #ed6ea0;
  color: #000000;
}

html.dark-theme .result-meta {
  color: #5c6370;
}

html.dark-theme .category-tag {
  background: #ed6ea0;
  color: #000000;
}

html.dark-theme .tag {
  background: #3e4451;
  color: #abb2bf;
}

html.dark-theme .no-results {
  color: #abb2bf;
}

html.dark-theme .no-results i {
  color: #5c6370;
}

html.dark-theme .no-results h3 {
  color: #abb2bf;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .search-modal-overlay {
    padding: 0;
    align-items: stretch;
  }

  .search-modal {
    width: 100%;
    height: 100%;
    border-radius: 0;
    max-height: none;
  }

  .search-header {
    padding: 16px;
  }

  .search-input {
    font-size: 16px; /* 防止iOS缩放 */
  }

  .search-content {
    max-height: calc(100vh - 80px);
  }
}
</style>
