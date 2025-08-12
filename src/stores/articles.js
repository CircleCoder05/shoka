import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'

export const useArticlesStore = defineStore('articles', () => {
  // 状态
  const articles = ref([])
  const categories = ref([])
  const tags = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Markdown 解析器
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: (str, lang) => {
      // 返回一个特殊的标记，稍后会被替换为自定义组件
      const escapedCode = md.utils.escapeHtml(str)
      return `<div class="custom-code-block" data-lang="${lang || ''}" data-code="${escapedCode}"></div>`
    },
  })

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
  const parseFrontMatter = (content) => {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    const match = content.match(frontMatterRegex)

    if (!match) {
      return {
        frontMatter: {},
        content: content,
      }
    }

    const frontMatterText = match[1]
    const markdownContent = match[2]

    const frontMatter = {}
    frontMatterText.split('\n').forEach((line) => {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        let value = line.substring(colonIndex + 1).trim()

        // 处理数组和对象
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value
            .slice(1, -1)
            .split(',')
            .map((item) => item.trim().replace(/['"]/g, ''))
        } else {
          // 去除单引号或双引号包裹
          value = value.replace(/^(['"])(.*)\1$/, '$2').trim()
        }

        frontMatter[key] = value
      }
    })

    return {
      frontMatter,
      content: markdownContent,
    }
  }

  const loadArticles = async () => {
    loading.value = true
    error.value = null

    try {
      const allCategories = new Set()
      const allTags = new Set()

      // 加载文章索引文件
      const indexResponse = await fetch('/posts/articles-index.json')
      if (!indexResponse.ok) {
        throw new Error('Failed to load articles index')
      }

      const articlesIndex = await indexResponse.json()
      console.log(`Loaded ${articlesIndex.length} articles from index`)

      // 并行加载所有文章内容
      const articlePromises = articlesIndex.map(async (articleInfo) => {
        try {
          const response = await fetch(`/posts/${articleInfo.path}`)
          if (response.ok) {
            const content = await response.text()
            const { frontMatter, content: markdownContent } = parseFrontMatter(content)

            const article = {
              ...articleInfo,
              ...frontMatter,
              content: markdownContent,
              // 使用 JSON 中的 excerpt，如果没有则生成
              excerpt: articleInfo.excerpt || markdownContent.substring(0, 200) + '...',
              // 保留 JSON 中的分类映射信息，不被 Front Matter 覆盖
              categories: articleInfo.categories || frontMatter.categories,
            }

            // 收集分类和标签
            if (article.categories) {
              article.categories.forEach((cat) => allCategories.add(cat))
            }
            if (article.tags) {
              article.tags.forEach((tag) => allTags.add(tag))
            }

            return article
          }
        } catch (err) {
          console.warn(`Failed to load article ${articleInfo.path}:`, err)
          return null
        }
      })

      const results = await Promise.all(articlePromises)
      const validArticles = results.filter((article) => article !== null)

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
          html: md.render(cleanContent),
        }
      }

      console.log('Article not found in loaded articles, fetching from index...')
      // 如果没找到，尝试从索引中获取路径信息
      const indexResponse = await fetch('/posts/articles-index.json')
      if (!indexResponse.ok) {
        throw new Error('Failed to load articles index')
      }

      const articlesIndex = await indexResponse.json()
      console.log('Loaded articles index, length:', articlesIndex.length)
      const articleInfo = articlesIndex.find((article) => article.slug === slug)
      console.log('Found articleInfo:', articleInfo)

      if (!articleInfo) {
        throw new Error(`Article not found: ${slug}`)
      }

      // 使用正确的文件路径加载文章
      const fileUrl = `/posts/${articleInfo.path}`
      console.log('Fetching article from:', fileUrl)
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to load article file: ${articleInfo.path}`)
      }

      const content = await response.text()
      console.log('Article content loaded, length:', content.length)

      // 解析 Front Matter，包括 password 字段
      const { frontMatter, content: markdownContent } = parseFrontMatter(content)
      console.log('Front matter parsed:', frontMatter)
      console.log('Markdown content length after parsing:', markdownContent.length)
      console.log('Original content preview:', content.substring(0, 200))
      console.log('Cleaned content preview:', markdownContent.substring(0, 200))

      const result = {
        ...articleInfo,
        ...frontMatter, // 包含 password 等字段
        content: markdownContent,
        html: md.render(markdownContent),
        slug,
      }
      console.log('Returning article with HTML length:', result.html.length)
      return result
    } catch (err) {
      console.error('Failed to load article:', err)
      throw err
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
    getArticlesByCategory,
    getArticlesByTag,
  }
})
