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
    <GitalkComments :post-slug="route.params.slug" />

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
import PostFooter from '@/views/articles/PostFooter.vue'
import PdfContent from '@/views/articles/PdfContent.vue'
import GitalkComments from '@/components/GitalkComments.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useConfigStore } from '@/stores/config'

const route = useRoute()
const articlesStore = useArticlesStore()
const bannerStore = useBannerStore()
const sidebarStore = useSidebarStore()
const configStore = useConfigStore()
const article = ref(null)
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
  const storedPassword = localStorage.getItem(storageKey)
  if (storedPassword) {
    passwordVerified.value = true
    return true
  }
  return false
}

// 保存密码验证状态到localStorage
const savePasswordState = (slug) => {
  const storageKey = `article_password_${slug}`
  localStorage.setItem(storageKey, 'verified')
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
const verifyPassword = () => {
  if (!passwordInput.value.trim()) {
    passwordError.value = '请输入密钥'
    return
  }

  if (article.value && article.value.password === passwordInput.value.trim()) {
    passwordVerified.value = true
    passwordError.value = ''
    // 保存密码验证状态到localStorage
    savePasswordState(route.params.slug)
    // 密码验证成功后，开始加载文章内容
    loadArticleContent()
  } else {
    passwordError.value = '密钥错误，请重试'
    passwordInput.value = ''
    // 聚焦到密码输入框
    if (passwordInputRef.value) {
      passwordInputRef.value.focus()
    }
  }
}

// 检查文章是否需要密码
const checkPasswordRequirement = (articleData) => {
  if (articleData && articleData.password) {
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
      const wasVerified = restorePasswordState(slug)
      if (wasVerified) {
        await loadArticleContent()
        loading.value = false
        return
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
  (newSlug, oldSlug) => {
    // 清除旧文章的密码状态
    if (oldSlug) {
      clearPasswordState(oldSlug)
    }
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

<style>
/* 密码验证界面样式 */
.password-verification {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
  width: 100%;
}

.password-form {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e1e5e9);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.password-icon {
  font-size: 3rem;
  color: var(--primary-color, #007acc);
  margin-bottom: 1.5rem;
}

.password-form h2 {
  margin: 0 0 2rem 0;
  color: var(--text-color, #333);
  font-size: 1.5rem;
  font-weight: 600;
}

.password-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.password-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color, #e1e5e9);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  background: var(--input-bg, #fff);
  color: var(--text-color, #333);
}

.password-input:focus {
  border-color: var(--primary-color, #007acc);
}

.password-input::placeholder {
  color: var(--text-secondary, #666);
}

.password-submit-btn {
  padding: 0.75rem 1rem;
  background: var(--primary-color, #007acc);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
}

.password-submit-btn:hover {
  background: var(--primary-hover, #005a9e);
}

.password-error {
  color: var(--error-color, #e74c3c);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* 暗色主题样式 */
.dark-theme .password-form {
  background: var(--card-bg, #2c313c);
  border-color: var(--border-color, #3e4451);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.dark-theme .password-form h2 {
  color: var(--text-color, #abb2bf);
}

.dark-theme .password-input {
  background: var(--input-bg, #2c313c);
  color: var(--text-color, #abb2bf);
  border-color: var(--border-color, #3e4451);
}

.dark-theme .password-input::placeholder {
  color: var(--text-secondary, #5c6370);
}

.dark-theme .password-input:focus {
  border-color: var(--primary-color, #007acc);
}

.password-actions {
  margin-top: 1rem;
}

/* 重新验证按钮样式 */
.re-verify-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.re-verify-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color, #007acc);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.re-verify-btn:hover {
  background: var(--primary-hover, #005a9e);
}

.re-verify-btn i {
  font-size: 0.8rem;
}

/* 加载和错误状态 */
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
  border: 4px solid #f3f3f3;
  border-top: 4px solid #e9546b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 文章卡片 */
.post-card-outer {
  width: 100%;
  max-width: 1050px !important;
  background: #fff;
  border-radius: 0;
  box-shadow:
    0 8px 48px 0 rgba(237, 110, 160, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin: 0;
  overflow: visible;
  box-sizing: border-box;
}

/* 文章头部 */
.post-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3c1d1;
}

.post-title {
  font-size: 2.5em;
  font-weight: bold;
  color: v-bind('colors.primary');
  margin: 0 0 1rem 0;
  line-height: 1.2;
  font-family: v-bind('fonts.title');
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  color: #666;
  font-size: 0.95em;
}

.meta-row {
  display: contents;
}

.post-date {
  font-weight: 500;
}

.post-author {
  font-style: italic;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #f3c1d1;
  color: #e9546b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tag i {
  font-size: 0.8em;
}

.post-category {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category {
  background: #dbeafe;
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.category i {
  font-size: 0.8em;
}

/* 文章内容 */
.post-content {
  font-size: 1em;
  line-height: 1.6;
  color: v-bind('colors.text');
  word-break: break-word;
  background: v-bind('colors.background');
  overflow: hidden;
  font-family: v-bind('fonts.content');
  font-weight: 400;
  letter-spacing: 0.2px;
}

/* 标题样式 */
.post-content h1,
.post-content h2,
.post-content h3,
.post-content h4 {
  font-weight: 900;
  margin: 2.2em 0 1em 0;
  line-height: 1.3;
  color: v-bind('colors.primary');
  border-bottom: 1.5px solid v-bind('colors.border');
  padding-bottom: 0.2em;
  font-family: v-bind('fonts.title');
  letter-spacing: 0.5px;
}

.post-content h1 {
  font-size: 2.5em;
}
.post-content h2 {
  font-size: 2em;
}
.post-content h3 {
  font-size: 1.6em;
}
.post-content h4 {
  font-size: 1.4em;
}

/* 段落和列表 */
.post-content p,
.post-content ul,
.post-content ol {
  margin: 1em 0;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'serif';
}

.post-content p {
  text-align: justify;
  line-height: 1.6;
}

.post-content ul,
.post-content ol {
  padding-left: 2em;
}

.post-content li {
  margin: 0.4em 0;
  line-height: 1.6;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'serif';
}

/* 引用块 */
.post-content blockquote {
  margin: 0.4em 0;
  padding: 0.4em 0.4em;
  background: #f8f9fa;
  border-left: 4px solid #e9546b;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #555;
}

/* 代码样式 */
.post-content code {
  background: #f1f3f4;
  color: #e9546b;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.post-content pre {
  margin: 0 0 1.5em 0;
  padding: 0;
  background: none;
  border-radius: 0;
  overflow-x: auto;
  border: none;
  box-shadow: none;
}

.post-content pre code {
  background: none;
  color: #333;
  font-size: 0.9em;
  line-height: 1.5;
  display: block;
}

/* 图片样式 */
.post-content img {
  max-width: 100%;
  width: auto;
  height: auto;
  border-radius: 8px;
  margin: 1.2em 0;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  object-fit: contain;
  overflow: hidden;
}

.optimized-image {
  transition: all 0.3s ease;
}

.optimized-image:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

/* 表格样式 */
.post-content table,
.post-content .table,
.post-card-outer .post-content table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 1.5em 0 !important;
  background: #fff !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow:
    0 4px 16px rgba(237, 84, 107, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.08) !important;
  font-size: 0.95em !important;
  border: 2px solid #f3c1d1 !important;
}

.post-content th,
.post-content td,
.post-content .table th,
.post-content .table td,
.post-card-outer .post-content th,
.post-card-outer .post-content td {
  padding: 1em 1.2em !important;
  text-align: left !important;
  border: none !important;
  vertical-align: top !important;
  position: relative !important;
}

/* 表格头部 */
.post-content th,
.post-content .table th {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%) !important;
  color: #fff !important;
  font-weight: 700 !important;
  font-family:
    'SimHei', 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', 'Arial', 'sans-serif' !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
  letter-spacing: 0.5px !important;
  border-bottom: 3px solid #2563eb !important;
}

/* 表格行样式 */
.post-content tr:nth-child(odd),
.post-content .table tr:nth-child(odd) {
  background: #ffffff !important;
}

.post-content tr:nth-child(even),
.post-content .table tr:nth-child(even) {
  background: #f8f9fa !important;
}

.post-content tr:hover,
.post-content .table tr:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15) !important;
  transition: all 0.3s ease !important;
}

/* 表格单元格 */
.post-content td,
.post-content .table td {
  word-break: break-word !important;
  max-width: 300px !important;
  border-bottom: 1px solid #dbeafe !important;
  border-right: 1px solid #eff6ff !important;
  transition: all 0.2s ease !important;
}

.post-content td:last-child,
.post-content .table td:last-child {
  border-right: none !important;
}

.post-content tr:last-child td,
.post-content .table tr:last-child td {
  border-bottom: none !important;
}

/* 表格分割线 */
.post-content th:not(:last-child)::after,
.post-content td:not(:last-child)::after,
.post-content .table th:not(:last-child)::after,
.post-content .table td:not(:last-child)::after {
  content: '' !important;
  position: absolute !important;
  right: 0 !important;
  top: 20% !important;
  height: 60% !important;
  width: 1px !important;
  background: linear-gradient(to bottom, transparent, #dbeafe, transparent) !important;
}

.post-content th:not(:last-child)::after,
.post-content .table th:not(:last-child)::after {
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  ) !important;
}

/* 链接和强调 */
.post-content a {
  color: #e9546b;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
}

.post-content a:hover {
  border-bottom-color: #e9546b;
}

.post-content strong {
  color: #e9546b;
  font-weight: 600;
}

.post-content em {
  color: #666;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .post-card-outer {
    padding: 2rem;
  }
  .post-title {
    font-size: 2.2em;
  }
}

@media (max-width: 768px) {
  .post-card-outer {
    padding: 1.5rem;
    border-radius: 12px;
  }
  .post-title {
    font-size: 1.8em;
    line-height: 1.3;
  }
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .meta-row {
    display: flex !important;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .post-date,
  .post-author {
    display: inline;
  }

  .post-tags,
  .post-category {
    display: inline-flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .post-content {
    font-size: 1em;
    line-height: 1.8;
  }
  .post-content img {
    margin: 1em 0;
    border-radius: 6px;
  }
  .post-content h1 {
    font-size: 1.8em;
  }
  .post-content h2 {
    font-size: 1.5em;
  }
  .post-content h3 {
    font-size: 1.3em;
  }
  .post-content h4 {
    font-size: 1.1em;
  }

  .post-content table {
    font-size: 0.9em;
    border-radius: 8px;
  }
  .post-content th,
  .post-content td {
    padding: 0.75em 0.8em;
  }
  .post-content td {
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .post-card-outer {
    padding: 1rem;
    border-radius: 8px;
  }
  .post-title {
    font-size: 1.6em;
  }
  .post-content {
    font-size: 0.95em;
  }
  .post-content img {
    margin: 0.8em 0;
    border-radius: 4px;
  }
  .post-content pre {
    padding: 1rem;
    font-size: 0.85em;
  }

  .post-content table {
    font-size: 0.85em;
    border-radius: 6px;
  }
  .post-content th,
  .post-content td {
    padding: 0.6em 0.6em;
  }
  .post-content td {
    max-width: 150px;
  }
}

/* 暗色主题样式 */
html.dark-theme .post-card-outer {
  background: #2c313c !important;
  box-shadow:
    0 8px 48px 0 rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

html.dark-theme .post-header {
  border-bottom-color: #3e4451 !important;
}

html.dark-theme .post-title {
  color: #abb2bf !important;
}

html.dark-theme .post-meta {
  color: #7f848e !important;
}

/* 暗色模式下的标签和分类使用纯白字体 */
html.dark-theme .post-tags .tag {
  color: #111111 !important;
}

html.dark-theme .post-category .category {
  color: #111111 !important;
}

html.dark-theme .post-content {
  color: #abb2bf !important;
  background: #2c313c !important;
}

html.dark-theme .post-content h1,
html.dark-theme .post-content h2,
html.dark-theme .post-content h3,
html.dark-theme .post-content h4 {
  color: #abb2bf !important;
  border-bottom-color: #3e4451 !important;
}

/* 暗色主题下的单行代码样式 */
html.dark-theme .post-content code:not(.code-block code) {
  background: #3e4451 !important;
  color: #ed6ea0 !important;
  padding: 0.2em 0.4em !important;
}

/* 亮色模式下的代码块样式 */
html:not(.dark-theme) .post-content .code-block {
  background: #fafafa !important;
  border: 1px solid #e1e4e8 !important;
  border-radius: 8px !important;
}

html:not(.dark-theme) .post-content .code-block .code-header {
  background: #f6f8fa !important;
  border-bottom: 1px solid #e1e4e8 !important;
  color: #24292e !important;
}

/* 保持语言标签的原有多彩样式，不进行覆盖 */

html:not(.dark-theme) .post-content .code-block .action-btn {
  background: #ffffff !important;
  border: 1px solid #d1d5da !important;
  color: #586069 !important;
}

html:not(.dark-theme) .post-content .code-block .action-btn:hover {
  background: #f6f8fa !important;
  border-color: #0366d6 !important;
  color: #0366d6 !important;
}

html:not(.dark-theme) .post-content .code-block .code-content {
  background: #fafafa !important;
}

html:not(.dark-theme) .post-content .code-block pre {
  background: #fafafa !important;
  color: #24292e !important;
}

/* 亮色模式的highlight.js语法高亮样式 */
html:not(.dark-theme) .post-content .code-block .hljs {
  background: #fafafa !important;
  color: #24292e !important;
}

/* 亮色模式 - 关键字（紫色） */
html:not(.dark-theme) .post-content .code-block .hljs-keyword,
html:not(.dark-theme) .post-content .code-block .hljs-selector-tag,
html:not(.dark-theme) .post-content .code-block .hljs-built_in {
  color: #8b5cf6 !important;
  font-weight: 600 !important;
}

/* 亮色模式 - 字符串（绿色） */
html:not(.dark-theme) .post-content .code-block .hljs-string,
html:not(.dark-theme) .post-content .code-block .hljs-doctag {
  color: #16a085 !important;
}

/* 亮色模式 - 注释（灰色斜体） */
html:not(.dark-theme) .post-content .code-block .hljs-comment,
html:not(.dark-theme) .post-content .code-block .hljs-quote {
  color: #6a737d !important;
  font-style: italic !important;
}

/* 亮色模式 - 数字（橙色） */
html:not(.dark-theme) .post-content .code-block .hljs-number,
html:not(.dark-theme) .post-content .code-block .hljs-literal {
  color: #e67e22 !important;
}

/* 亮色模式 - 变量名（深红色） */
html:not(.dark-theme) .post-content .code-block .hljs-variable,
html:not(.dark-theme) .post-content .code-block .hljs-name {
  color: #c0392b !important;
}

/* 亮色模式 - 属性（深青色） */
html:not(.dark-theme) .post-content .code-block .hljs-attr,
html:not(.dark-theme) .post-content .code-block .hljs-attribute {
  color: #2980b9 !important;
}

/* 亮色模式 - 类名/类型（紫罗兰色） */
html:not(.dark-theme) .post-content .code-block .hljs-title,
html:not(.dark-theme) .post-content .code-block .hljs-class .hljs-title,
html:not(.dark-theme) .post-content .code-block .hljs-type {
  color: #9b59b6 !important;
  font-weight: 600 !important;
}

/* 亮色模式 - 函数名（蓝色） */
html:not(.dark-theme) .post-content .code-block .hljs-function .hljs-title {
  color: #3498db !important;
  font-weight: 600 !important;
}

/* 亮色模式 - 操作符（深灰色） */
html:not(.dark-theme) .post-content .code-block .hljs-operator,
html:not(.dark-theme) .post-content .code-block .hljs-symbol {
  color: #34495e !important;
  font-weight: 600 !important;
}

/* 亮色模式 - 正则表达式（墨绿色） */
html:not(.dark-theme) .post-content .code-block .hljs-regexp {
  color: #27ae60 !important;
}

/* 亮色模式 - 元标签（深蓝色） */
html:not(.dark-theme) .post-content .code-block .hljs-meta {
  color: #2c3e50 !important;
}

/* 亮色模式 - 模板变量（品红色） */
html:not(.dark-theme) .post-content .code-block .hljs-template-variable,
html:not(.dark-theme) .post-content .code-block .hljs-template-tag {
  color: #e91e63 !important;
}

/* 亮色模式 - 展开提示区域 */
html:not(.dark-theme) .post-content .code-block .expand-hint {
  background: #f6f8fa !important;
  color: #586069 !important;
  border-top: 1px solid #e1e4e8 !important;
}

html:not(.dark-theme) .post-content .code-block .expand-hint:hover {
  background: #f1f3f4 !important;
  color: #24292e !important;
}

/* 暗色模式下的代码块样式 */
html.dark-theme .post-content .code-block {
  background: #21252b !important;
  border: 1px solid #3e4451 !important;
  border-radius: 8px !important;
}

html.dark-theme .post-content .code-block .code-header {
  background: #282c34 !important;
  border-bottom: 1px solid #3e4451 !important;
  color: #abb2bf !important;
}

/* 暗色模式下语言标签使用黑色字体 */
html.dark-theme .post-content .code-block .language-tag {
  color: #000000 !important;
}

html.dark-theme .post-content .code-block .action-btn {
  background: #21252b !important;
  border: 1px solid #3e4451 !important;
  color: #abb2bf !important;
}

html.dark-theme .post-content .code-block .action-btn:hover {
  background: #3e4451 !important;
  border-color: #ed6ea0 !important;
  color: #ed6ea0 !important;
}

html.dark-theme .post-content .code-block .code-content {
  background: #21252b !important;
}

html.dark-theme .post-content .code-block pre {
  background: #21252b !important;
  color: #abb2bf !important;
}

/* 暗色模式的highlight.js语法高亮样式 */
html.dark-theme .post-content .code-block .hljs {
  background: #21252b !important;
  color: #abb2bf !important;
}

/* 暗色模式 - 关键字 */
html.dark-theme .post-content .code-block .hljs-keyword,
html.dark-theme .post-content .code-block .hljs-selector-tag,
html.dark-theme .post-content .code-block .hljs-built_in {
  color: #c678dd !important;
}

/* 暗色模式 - 字符串 */
html.dark-theme .post-content .code-block .hljs-string,
html.dark-theme .post-content .code-block .hljs-doctag {
  color: #98c379 !important;
}

/* 暗色模式 - 注释 */
html.dark-theme .post-content .code-block .hljs-comment,
html.dark-theme .post-content .code-block .hljs-quote {
  color: #5c6370 !important;
  font-style: italic !important;
}

/* 暗色模式 - 数字 */
html.dark-theme .post-content .code-block .hljs-number,
html.dark-theme .post-content .code-block .hljs-literal {
  color: #d19a66 !important;
}

/* 暗色模式 - 变量名 */
html.dark-theme .post-content .code-block .hljs-variable,
html.dark-theme .post-content .code-block .hljs-name {
  color: #e06c75 !important;
}

/* 暗色模式 - 属性 */
html.dark-theme .post-content .code-block .hljs-attr,
html.dark-theme .post-content .code-block .hljs-attribute {
  color: #e06c75 !important;
}

/* 暗色模式 - 标题/类名 */
html.dark-theme .post-content .code-block .hljs-title,
html.dark-theme .post-content .code-block .hljs-class .hljs-title,
html.dark-theme .post-content .code-block .hljs-type {
  color: #e5c07b !important;
}

/* 暗色模式 - 函数 */
html.dark-theme .post-content .code-block .hljs-function .hljs-title {
  color: #61dafb !important;
}

/* 暗色模式 - 操作符 */
html.dark-theme .post-content .code-block .hljs-operator,
html.dark-theme .post-content .code-block .hljs-symbol {
  color: #56b6c2 !important;
}

/* 暗色模式 - 正则表达式 */
html.dark-theme .post-content .code-block .hljs-regexp {
  color: #98c379 !important;
}

/* 暗色模式 - 元标签 */
html.dark-theme .post-content .code-block .hljs-meta {
  color: #61dafb !important;
}

/* 暗色模式 - 模板变量 */
html.dark-theme .post-content .code-block .hljs-template-variable,
html.dark-theme .post-content .code-block .hljs-template-tag {
  color: #e06c75 !important;
}

/* 暗色模式 - 展开提示区域 */
html.dark-theme .post-content .code-block .expand-hint {
  background: #282c34 !important;
  color: #abb2bf !important;
  border-top: 1px solid #3e4451 !important;
}

html.dark-theme .post-content .code-block .expand-hint:hover {
  background: #3e4451 !important;
  color: #ffffff !important;
}

/* 暗色主题下的引用块 */
html.dark-theme .post-content blockquote {
  background: #3e4451 !important;
  color: #abb2bf !important;
  border-left-color: #ed6ea0 !important;
}

/* 暗色主题下的表格 */
html.dark-theme .post-content table {
  background: #2c313c !important;
  border-color: #3e4451 !important;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

html.dark-theme .post-content th {
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%) !important;
  border-bottom-color: #ed6ea0 !important;
}

html.dark-theme .post-content tr:nth-child(odd) {
  background: #2c313c !important;
}

html.dark-theme .post-content tr:nth-child(even) {
  background: #383e4a !important;
}

html.dark-theme .post-content tr:hover {
  background: linear-gradient(135deg, #3e4451 0%, #4a5568 100%) !important;
}

html.dark-theme .post-content td {
  border-bottom-color: #3e4451 !important;
  border-right-color: #383e4a !important;
}

/* 暗色主题下的链接 */
html.dark-theme .post-content a {
  color: #ed6ea0 !important;
}

html.dark-theme .post-content a:hover {
  border-bottom-color: #ed6ea0 !important;
}

/* 暗色主题下的强调文本 */
html.dark-theme .post-content strong {
  color: #ed6ea0 !important;
}

html.dark-theme .post-content em {
  color: #abb2bf !important;
}

/* 暗色主题下的列表 */
html.dark-theme .post-content ul,
html.dark-theme .post-content ol {
  color: #abb2bf !important;
}

html.dark-theme .post-content li {
  color: #abb2bf !important;
}

html.dark-theme .post-content li::marker {
  color: #ed6ea0 !important;
}

/* 暗色主题下的分割线 */
html.dark-theme .post-content hr {
  border-color: #3e4451 !important;
  background: #3e4451 !important;
}

/* 暗色主题下的图片 */
html.dark-theme .post-content img {
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}

/* 暗色主题下的删除线文本 */
html.dark-theme .post-content del {
  color: #7f848e !important;
}

/* 暗色主题下的标记文本 */
html.dark-theme .post-content mark {
  background: rgba(237, 110, 160, 0.3) !important;
  color: #abb2bf !important;
  padding: 0.1em 0.2em !important;
  border-radius: 3px !important;
}

/* 暗色主题下的键盘按键样式 */
html.dark-theme .post-content kbd {
  background: #3e4451 !important;
  color: #abb2bf !important;
  border: 1px solid #5c6370 !important;
  border-bottom: 3px solid #5c6370 !important;
  box-shadow: inset 0 -1px 0 #5c6370 !important;
}

/* 暗色主题下的小字体文本 */
html.dark-theme .post-content small {
  color: #7f848e !important;
}

/* 暗色主题下的子标题和副标题 */
html.dark-theme .post-content h5,
html.dark-theme .post-content h6 {
  color: #abb2bf !important;
  border-bottom-color: #3e4451 !important;
}

/* 暗色主题下的段落 */
html.dark-theme .post-content p {
  color: #abb2bf !important;
  line-height: 1.8 !important;
}

/* 暗色主题下的预格式化文本（非代码块） */
html.dark-theme .post-content pre:not(.code-block pre) {
  background: #2c3132 !important;
  color: #abb2bf !important;
  border: 1px solid #5c6370 !important;
}

/* 暗色主题下的PostFooter组件样式 */
html.dark-theme .post-footer {
  border-top-color: #3e4451 !important;
}

html.dark-theme .post-footer .copyright-info {
  background: #2c313c !important;
  border-color: #3e4451 !important;
  color: #abb2bf !important;
}

html.dark-theme .post-footer .copyright-item {
  color: #abb2bf !important;
}

html.dark-theme .post-footer .label {
  color: #7f848e !important;
}

html.dark-theme .post-footer .value {
  color: #abb2bf !important;
}

html.dark-theme .post-footer .value.link {
  color: #ed6ea0 !important;
}

html.dark-theme .post-footer .post-navigation {
  background: #2c313c !important;
  border-top-color: #3e4451 !important;
  border-bottom-color: #3e4451 !important;
}

/* 导航项目在暗色模式下的样式调整 */
html.dark-theme .post-footer .nav-content {
  /* nav-content已经在main.css中被排除，现在只需要确保透明 */
  background: transparent !important;
}

html.dark-theme .post-footer .nav-item:not(:last-child) {
  border-right-color: rgba(255, 255, 255, 0.2) !important;
}
</style>
