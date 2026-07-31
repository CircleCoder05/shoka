import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBlogStore } from './blog'
import { apiGet, apiPost } from '@/services/api'
import { renderMarkdown } from '@/utils/markdownRenderer'

export const useArticlesStore = defineStore('articles', () => {
  // 状态
  const articles = ref([])
  const categories = ref([])
  const tags = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const articlesByCategory = computed(() => {
    const grouped = {}
    console.log('🔍 [articlesByCategory] 开始分组，文章总数:', articles.value.length)

    articles.value.forEach((article, idx) => {
      console.log(`📄 [articlesByCategory] 处理第${idx}篇文章:`, article.slug)
      console.log(`📄 [articlesByCategory] 文章categories:`, article.categories)

      if (article.categories && article.categories.length > 0) {
        article.categories.forEach((category, catIdx) => {
          console.log(`🏷️ [articlesByCategory] 第${idx}篇文章的第${catIdx}个分类:`, category)
          console.log(`🏷️ [articlesByCategory] 分类类型:`, typeof category)
          console.log(`🏷️ [articlesByCategory] 分类是否为对象:`, typeof category === 'object')

          const categoryKey = category.key || category
          const categoryName = category.name || category

          console.log(
            `🔑 [articlesByCategory] 提取的key:`,
            categoryKey,
            `类型:`,
            typeof categoryKey,
          )
          console.log(
            `📝 [articlesByCategory] 提取的name:`,
            categoryName,
            `类型:`,
            typeof categoryName,
          )

          if (!grouped[categoryKey]) {
            grouped[categoryKey] = {
              name: categoryName,
              posts: [],
            }
            console.log(`✅ [articlesByCategory] 创建新分组:`, categoryKey)
          } else {
            console.log(`📈 [articlesByCategory] 添加到现有分组:`, categoryKey)
          }

          grouped[categoryKey].posts.push(article)
          console.log(
            `📊 [articlesByCategory] 分组后该分类文章数:`,
            grouped[categoryKey].posts.length,
          )
        })
      } else {
        console.log(`❌ [articlesByCategory] 第${idx}篇文章无categories字段或为空`)
      }
    })

    console.log('🎯 [articlesByCategory] 最终分组结果:')
    console.log('🎯 [articlesByCategory] 分组keys:', Object.keys(grouped))
    console.log('🎯 [articlesByCategory] 完整分组数据:', grouped)

    return grouped
  })

  const articlesByTag = computed(() => {
    const grouped = {}
    articles.value.forEach((article) => {
      if (article.tags && article.tags.length > 0) {
        article.tags.forEach((tag) => {
          if (!grouped[tag]) {
            grouped[tag] = []
          }
          grouped[tag].push(article)
        })
      }
    })
    return grouped
  })

  // 方法
  const loadArticles = async () => {
    loading.value = true
    error.value = null

    try {
      const allCategories = new Set()
      const allTags = new Set()

      const blogStore = useBlogStore()
      const data = await blogStore.load()
      const validArticles = data.posts.map((post) => {
        const category = post.category ? { key: post.category.slug, name: post.category.name } : null
        if (category) allCategories.add(category.name)
        post.tags?.forEach((tag) => allTags.add(tag))
        return {
          ...post,
          date: post.published_at || post.created_at,
          cover: post.cover_url,
          type: post.kind === 'markdown' ? 'md' : post.kind,
          pdfPath: post.attachment_url,
          categories: category ? [category] : [],
          wordCount: post.content?.length || 0,
          readTime: Math.max(1, Math.ceil((post.content?.length || 0) / 250)),
        }
      })

      // 按日期排序
      validArticles.sort((a, b) => new Date(b.date) - new Date(a.date))

      articles.value = validArticles
      categories.value = Array.from(allCategories)
      tags.value = Array.from(allTags)
    } catch (err) {
      error.value = err.message
      console.error('Failed to load articles:', err)
    } finally {
      loading.value = false
    }
  }

  const getArticleBySlug = async (slug) => {
    console.log('getArticleBySlug called with slug:', slug)
    try {
      // 首先从已加载的文章中查找
      const existingArticle = articles.value.find((article) => article.slug === slug)
      console.log('existingArticle:', existingArticle)
      if (existingArticle) {
        console.log('Found existing article, returning with HTML')
        console.log('Existing article front matter:', {
          password: existingArticle.password,
          title: existingArticle.title,
          date: existingArticle.date,
        })
        // 确保 content 中没有 Front Matter
        const cleanContent = existingArticle.content.replace(/^---[\s\S]*?---\s*\n?/, '')
        return {
          ...existingArticle,
          content: cleanContent,
          html: renderMarkdown(cleanContent),
        }
      }

      const blogStore = useBlogStore()
      const post = await apiGet(`/api/blogs/${encodeURIComponent(blogStore.selectedSlug)}/posts/${slug}`)
      const result = {
        ...post,
        date: post.published_at || post.created_at,
        cover: post.cover_url,
        type: post.kind === 'markdown' ? 'md' : post.kind,
        pdfPath: post.attachment_url,
        categories: post.category ? [{ key: post.category.slug, name: post.category.name }] : [],
        html: renderMarkdown(post.content || ''),
      }
      return result
    } catch (err) {
      console.error('Failed to load article:', err)
      throw err
    }
  }

  const unlockArticle = async (slug, password) => {
    const blogStore = useBlogStore()
    const post = await apiPost(
      `/api/blogs/${encodeURIComponent(blogStore.selectedSlug)}/posts/${encodeURIComponent(slug)}/unlock`,
      { password },
    )
    return {
      ...post,
      date: post.published_at || post.created_at,
      cover: post.cover_url,
      type: post.kind === 'markdown' ? 'md' : post.kind,
      pdfPath: post.attachment_url,
      categories: post.category ? [{ key: post.category.slug, name: post.category.name }] : [],
      html: renderMarkdown(post.content || ''),
    }
  }

  const getArticlesByCategory = (category) => {
    return articles.value.filter(
      (article) => article.categories && article.categories.includes(category),
    )
  }

  const getArticlesByTag = (tag) => {
    return articles.value.filter((article) => article.tags && article.tags.includes(tag))
  }

  return {
    // 状态
    articles,
    categories,
    tags,
    loading,
    error,

    // 计算属性
    articlesByCategory,
    articlesByTag,

    // 方法
    loadArticles,
    getArticleBySlug,
    unlockArticle,
    getArticlesByCategory,
    getArticlesByTag,
  }
})
