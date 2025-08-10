import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStatisticsStore } from './statistics.js'

export const useSearchStore = defineStore('search', () => {
  // 状态
  const searchQuery = ref('')
  const searchResults = ref([])
  const isSearching = ref(false)
  const showSearchModal = ref(false)

  // 获取文章数据
  const statisticsStore = useStatisticsStore()

  // 搜索函数
  const performSearch = async (query) => {
    console.log('🔍 搜索开始，查询词:', query)

    // 确保数据已加载
    if (statisticsStore.archives.length === 0) {
      console.log('📚 数据未加载，正在加载...')
      await statisticsStore.loadStatistics()
    }

    console.log('📚 可用文章数量:', statisticsStore.archives.length)

    if (!query || query.trim().length < 1) {
      searchResults.value = []
      return
    }

    isSearching.value = true
    const normalizedQuery = query.toLowerCase().trim()

    try {
      const results = statisticsStore.archives.filter((article) => {
        // 搜索标题
        const titleMatch =
          article.title && typeof article.title === 'string'
            ? article.title.toLowerCase().includes(normalizedQuery)
            : false

        // 搜索摘要/内容
        const contentMatch =
          article.excerpt && typeof article.excerpt === 'string'
            ? article.excerpt.toLowerCase().includes(normalizedQuery)
            : false

        // 搜索标签
        const tagMatch = Array.isArray(article.tags)
          ? article.tags.some(
              (tag) => typeof tag === 'string' && tag.toLowerCase().includes(normalizedQuery),
            )
          : false

        // 搜索分类
        const categoryMatch = Array.isArray(article.categories)
          ? article.categories.some((cat) => {
              const categoryName = typeof cat === 'object' ? cat.name : cat
              return (
                typeof categoryName === 'string' &&
                categoryName.toLowerCase().includes(normalizedQuery)
              )
            })
          : false

        const isMatch = titleMatch || contentMatch || tagMatch || categoryMatch

        return isMatch
      })

      // 按相关性排序（标题匹配优先级最高）
      results.sort((a, b) => {
        const aTitle =
          a.title && typeof a.title === 'string' && a.title.toLowerCase().includes(normalizedQuery)
            ? 1
            : 0
        const bTitle =
          b.title && typeof b.title === 'string' && b.title.toLowerCase().includes(normalizedQuery)
            ? 1
            : 0

        if (aTitle !== bTitle) {
          return bTitle - aTitle // 标题匹配的排在前面
        }

        // 按日期排序
        return new Date(b.date || 0) - new Date(a.date || 0)
      })

      searchResults.value = results
      console.log('✅ 搜索完成，找到结果:', results.length)

      // 调试：如果是搜索"o"且没有结果，检查前几个文章
      if (normalizedQuery === 'o' && results.length === 0) {
        console.log('🐛 搜索"o"无结果，检查前3个文章:')
        statisticsStore.archives.slice(0, 3).forEach((article, index) => {
          const titleMatch =
            article.title && typeof article.title === 'string'
              ? article.title.toLowerCase().includes('o')
              : false
          const contentMatch =
            article.excerpt && typeof article.excerpt === 'string'
              ? article.excerpt.toLowerCase().includes('o')
              : false
          console.log(
            `${index + 1}. "${article.title}": 标题匹配=${titleMatch}, 内容匹配=${contentMatch}`,
          )
          console.log(`   标题: ${article.title}`)
          console.log(`   摘要: ${article.excerpt?.substring(0, 100)}...`)
        })
      }
    } catch (error) {
      console.error('搜索时发生错误:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // 实时搜索（防抖）
  let searchTimer = null
  const searchWithDebounce = (query) => {
    searchQuery.value = query

    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    searchTimer = setTimeout(async () => {
      await performSearch(query)
    }, 300) // 300ms 防抖
  }

  // 清空搜索
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    isSearching.value = false
  }

  // 打开搜索模态框
  const openSearchModal = () => {
    showSearchModal.value = true
    // 延迟聚焦，确保模态框已渲染
    setTimeout(() => {
      const searchInput = document.querySelector('.search-modal input')
      if (searchInput) {
        searchInput.focus()
      }
    }, 100)
  }

  // 关闭搜索模态框
  const closeSearchModal = () => {
    showSearchModal.value = false
    clearSearch()
  }

  // 计算属性
  const hasResults = computed(() => searchResults.value.length > 0)
  const resultCount = computed(() => searchResults.value.length)

  // 获取高亮的标题
  const getHighlightedTitle = (title, query) => {
    if (!query || !title) return title

    const regex = new RegExp(`(${query})`, 'gi')
    return title.replace(regex, '<mark>$1</mark>')
  }

  // 获取高亮的摘要
  const getHighlightedExcerpt = (excerpt, query) => {
    if (!query || !excerpt) return excerpt

    const regex = new RegExp(`(${query})`, 'gi')
    return excerpt.replace(regex, '<mark>$1</mark>')
  }

  return {
    // 状态
    searchQuery,
    searchResults,
    isSearching,
    showSearchModal,

    // 计算属性
    hasResults,
    resultCount,

    // 方法
    performSearch,
    searchWithDebounce,
    clearSearch,
    openSearchModal,
    closeSearchModal,
    getHighlightedTitle,
    getHighlightedExcerpt,
  }
})
