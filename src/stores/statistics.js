import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStatisticsStore = defineStore('statistics', () => {
  // 状态
  const archives = ref([])
  const categories = ref([])
  const tags = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const archivesByYear = computed(() => {
    const grouped = {}
    archives.value.forEach((article) => {
      const year = new Date(article.date).getFullYear()
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(article)
    })

    // 按年份降序排序，最新的年份在前面
    const sortedYears = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a))

    // 使用Map确保顺序
    const resultMap = new Map()
    sortedYears.forEach((year) => {
      resultMap.set(year, grouped[year])
    })

    console.log('Store archivesByYear - sorted years:', sortedYears)
    console.log('Store archivesByYear - result map keys:', Array.from(resultMap.keys()))

    // 转换回普通对象
    const result = {}
    resultMap.forEach((value, key) => {
      result[key] = value
    })

    return result
  })

  const categoriesWithCount = computed(() => {
    const categoryCounts = {}
    archives.value.forEach((article) => {
      // 处理分类数据
      if (article.categories && Array.isArray(article.categories)) {
        article.categories.forEach((category) => {
          let categoryName = ''
          if (Array.isArray(category)) {
            categoryName = category[0] || ''
          } else if (typeof category === 'string') {
            categoryName = category
          }
          if (categoryName) {
            categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1
          }
        })
      }
      // 如果没有categories但有category字段，也统计
      else if (article.category && typeof article.category === 'string') {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1
      }
    })

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }))
  })

  const tagsWithCount = computed(() => {
    const tagCounts = {}
    archives.value.forEach((article) => {
      // 处理标签数据
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag) => {
          if (typeof tag === 'string' && tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        })
      }
    })

    return Object.entries(tagCounts).map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }))
  })

  // 方法
  const loadStatistics = async () => {
    loading.value = true
    error.value = null

    try {
      // 加载文章索引文件
      const response = await fetch('/posts/articles-index.json')
      if (!response.ok) {
        throw new Error('Failed to load articles index')
      }

      const articlesIndex = await response.json()

      // 按日期排序（最新的在前面）
      const sortedArticles = articlesIndex.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB - dateA // 降序排列
      })

      archives.value = sortedArticles

      // 收集所有分类和标签
      const allCategories = new Set()
      const allTags = new Set()

      sortedArticles.forEach((article) => {
        // 处理分类
        if (article.categories && Array.isArray(article.categories)) {
          article.categories.forEach((category) => {
            let categoryName = ''
            if (Array.isArray(category)) {
              categoryName = category[0] || ''
            } else if (typeof category === 'string') {
              categoryName = category
            }
            if (categoryName) {
              allCategories.add(categoryName)
            }
          })
        } else if (article.category && typeof article.category === 'string') {
          allCategories.add(article.category)
        }

        // 处理标签
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach((tag) => {
            if (typeof tag === 'string' && tag) {
              allTags.add(tag)
            }
          })
        }
      })

      categories.value = Array.from(allCategories)
      tags.value = Array.from(allTags)
    } catch (err) {
      error.value = err.message
      console.error('Failed to load statistics:', err)
    } finally {
      loading.value = false
    }
  }

  const getArticlesByCategory = (categoryName) => {
    return archives.value.filter((article) => {
      // 检查categories数组
      if (article.categories && Array.isArray(article.categories)) {
        return article.categories.some((category) => {
          let cat = ''
          if (Array.isArray(category)) {
            cat = category[0] || ''
          } else if (typeof category === 'string') {
            cat = category
          }
          return cat === categoryName
        })
      }
      // 检查category字段
      else if (article.category && typeof article.category === 'string') {
        return article.category === categoryName
      }
      return false
    })
  }

  const getArticlesByTag = (tagName) => {
    return archives.value.filter((article) => {
      return article.tags && Array.isArray(article.tags) && article.tags.includes(tagName)
    })
  }

  const getArticlesByYear = (year) => {
    return archives.value.filter((article) => {
      return new Date(article.date).getFullYear() === year
    })
  }

  return {
    // 状态
    archives,
    categories,
    tags,
    loading,
    error,

    // 计算属性
    archivesByYear,
    categoriesWithCount,
    tagsWithCount,

    // 方法
    loadStatistics,
    getArticlesByCategory,
    getArticlesByTag,
    getArticlesByYear,
  }
})
