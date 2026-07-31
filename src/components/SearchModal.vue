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

<style scoped lang="scss" src="@/styles/sfc/components/SearchModal.scss"></style>
