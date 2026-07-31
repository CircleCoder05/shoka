<template>
  <!-- 密码验证界面 -->
  <div v-if="needsPassword && !passwordVerified" class="password-verification">
    <div class="password-form">
      <div class="password-icon">
        <i class="ic i-lock"></i>
      </div>
      <h2>此文章需要密钥才能阅读</h2>
      <div class="password-input-group">
        <input
          v-model="passwordInput"
          type="password"
          placeholder="请输入密钥"
          class="password-input"
          @keyup.enter="verifyPassword"
          ref="passwordInputRef"
        />
        <button @click="verifyPassword" class="password-submit-btn">
          <i class="ic i-check"></i>
        </button>
      </div>
      <div v-if="passwordError" class="password-error">
        {{ passwordError }}
      </div>
    </div>
  </div>

  <!-- 文章内容界面 -->
  <div v-else-if="loading" class="loading">
    <div class="loading-spinner"></div>
    <p>加载中...</p>
  </div>
  <div v-else-if="error" class="error">
    <h2>文章加载失败</h2>
    <p>{{ error }}</p>
  </div>
  <div v-else-if="article" class="post-card-outer">
    <!-- 加密文章重新验证按钮 -->
    <div v-if="needsPassword && passwordVerified" class="re-verify-section">
      <button @click="reVerifyPassword" class="re-verify-btn">
        <i class="ic i-lock"></i>
        重新验证密钥
      </button>
    </div>

    <div class="post-header">
      <h1 class="post-title">{{ article.title }}</h1>
      <div class="post-meta">
        <div class="meta-row">
          <span class="post-date">{{ formatDate(article.date) }}</span>
          <span v-if="article.author" class="post-author">作者: {{ article.author }}</span>
        </div>
        <div class="meta-row">
          <div v-if="article.tags && article.tags.length" class="post-tags">
            <span v-for="tag in article.tags" :key="tag" class="tag">
              <i class="ic i-tags"></i>
              {{ tag }}
            </span>
          </div>
          <div v-if="getCategoryName(article)" class="post-category">
            <span class="category">
              <i class="ic i-flag"></i>
              {{ getCategoryName(article) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- 根据文章类型显示不同内容 -->
    <div v-if="article.type === 'pdf'" class="post-content">
      <PdfContent :pdf-path="article.pdfPath" />
    </div>
    <div
      v-else
      class="post-content"
      v-html="processedArticleHtml"
      v-code-block
      v-image-optimize
      v-media-block
    ></div>

    <!-- 评论区 -->
    <CommentSystem :post-slug="route.params.slug" />

    <!-- 文章底部：版权信息和上一篇/下一篇导航 -->
    <PostFooter
      :current-slug="route.params.slug"
      :author="article.author || 'CircleCoder'"
      site-name="碼農書架"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useBannerStore } from '@/stores/banner'
import { useConfigStore } from '@/stores/config'
import PostFooter from '@/views/articles/PostFooter.vue'
import PdfContent from '@/views/articles/PdfContent.vue'
import CommentSystem from '@/components/CommentSystem.vue'
import { useSidebarStore } from '@/stores/sidebar'

const route = useRoute()
const articlesStore = useArticlesStore()
const bannerStore = useBannerStore()
const sidebarStore = useSidebarStore()
const configStore = useConfigStore()
const article = ref(null)

// 文章级别的评论配置
const articleCommentConfig = computed(() => {
  // 从文章数据中获取评论配置
  if (article.value && article.value.frontmatter) {
    return article.value.frontmatter.comment || {}
  }
  return {}
})
const loading = ref(true)
const error = ref(null)
const processedArticleHtml = ref('')

// 密码验证相关
const needsPassword = ref(false)
const passwordVerified = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const passwordInputRef = ref(null)

// 从localStorage恢复密码验证状态
const restorePasswordState = (slug) => {
  const storageKey = `article_password_${slug}`
  return localStorage.getItem(storageKey) || ''
}

// 保存密码验证状态到localStorage
const savePasswordState = (slug, password) => {
  const storageKey = `article_password_${slug}`
  localStorage.setItem(storageKey, password)
}

// 清除密码验证状态
const clearPasswordState = (slug) => {
  const storageKey = `article_password_${slug}`
  localStorage.removeItem(storageKey)
}

// 重新验证密码
const reVerifyPassword = () => {
  clearPasswordState(route.params.slug)
  passwordVerified.value = false
  needsPassword.value = true
  passwordInput.value = ''
  passwordError.value = ''
  // 清空文章内容
  processedArticleHtml.value = ''
  // 重置侧边栏
  sidebarStore.reset()
}

// 获取配置
const colors = computed(() => configStore.colors)
const fonts = computed(() => configStore.fonts)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 获取分类的中文显示名
const getCategoryName = (article) => {
  if (!article) return null

  // 优先使用 categories 数组中的中文名
  if (article.categories && article.categories.length > 0) {
    const firstCategory = article.categories[0]
    if (typeof firstCategory === 'object' && firstCategory.name) {
      return firstCategory.name // 返回中文名
    }
  }

  // 如果没有 categories，使用 category 字段
  if (article.category) {
    return article.category
  }

  return null
}

// 密码验证方法
const verifyPassword = async () => {
  if (!passwordInput.value.trim()) {
    passwordError.value = '请输入访问密钥'
    return
  }

  try {
    article.value = await articlesStore.unlockArticle(route.params.slug, passwordInput.value.trim())
    passwordVerified.value = true
    passwordError.value = ''
    savePasswordState(route.params.slug, passwordInput.value.trim())
    await loadArticleContent()
  } catch {
    passwordError.value = '访问密钥错误，请重试'
    passwordInput.value = ''
    passwordInputRef.value?.focus()
  }
}

// 检查文章是否需要密码
const checkPasswordRequirement = (articleData) => {
  if (articleData && articleData.is_encrypted) {
    needsPassword.value = true
    passwordVerified.value = false
    return true
  }
  needsPassword.value = false
  passwordVerified.value = true
  return false
}

// 加载文章内容（密码验证成功后调用）
const loadArticleContent = async () => {
  if (!article.value) return

  try {
    // 设置文章 banner 信息
    bannerStore.setArticleBanner(article.value)

    // 设置文章页面标题
    document.title = article.value.title

    // 根据文章类型处理内容
    if (article.value.type === 'pdf') {
      // PDF类型文章，不需要处理HTML内容
      processedArticleHtml.value = ''
      // 对于PDF文章，可以设置一个简单的目录
      sidebarStore.setArticleContent('<h1>PDF文档</h1>')
      sidebarStore.switchPanel('contents')
    } else {
      // MD类型文章，处理HTML内容
      const processedHtml = addHeadingIds(article.value.html)
      processedArticleHtml.value = processedHtml
      // 设置侧边栏文章内容
      sidebarStore.setArticleContent(processedHtml)
      // 确保在文章页面显示目录侧边栏
      sidebarStore.switchPanel('contents')
    }
  } catch (err) {
    error.value = err.message
    console.error('Failed to load article content:', err)
  }
}

// 为标题添加 id
const addHeadingIds = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`
    }
  })

  return doc.body.innerHTML
}

const loadArticle = async (slug) => {
  loading.value = true
  error.value = null

  try {
    // 确保文章列表已加载
    if (articlesStore.articles.length === 0) {
      await articlesStore.loadArticles()
    }

    article.value = await articlesStore.getArticleBySlug(slug)

    // 检查文章是否需要密码
    checkPasswordRequirement(article.value)

    // 如果需要密码，先尝试恢复已保存的验证状态
    if (needsPassword.value) {
      const storedPassword = restorePasswordState(slug)
      if (storedPassword) {
        try {
          article.value = await articlesStore.unlockArticle(slug, storedPassword)
          passwordVerified.value = true
          await loadArticleContent()
          loading.value = false
          return
        } catch {
          clearPasswordState(slug)
        }
      }
      loading.value = false
      return
    }

    // 不需要密码或密码已验证，加载文章内容
    await loadArticleContent()
  } catch (err) {
    error.value = err.message
    console.error('Failed to load article:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await configStore.loadConfig()
  loadArticle(route.params.slug)
})

watch(
  () => route.params.slug,
  (newSlug) => {
    // 重置密码验证状态
    passwordVerified.value = false
    needsPassword.value = false
    passwordInput.value = ''
    passwordError.value = ''
    // 加载新文章
    loadArticle(newSlug)
  },
)

onUnmounted(() => {
  // 组件卸载时恢复默认 banner
  bannerStore.setDefaultBanner()
  // 重置侧边栏状态，但保持目录模式
  sidebarStore.reset()
})
</script>

<style lang="scss" src="@/styles/sfc/views/articles/PostView.scss"></style>
