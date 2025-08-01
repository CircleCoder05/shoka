<template>
  <div class="post-content-wrapper">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error">
      <h2>文章加载失败</h2>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="article" class="post-card-outer">
      <div class="post-header">
        <h1 class="post-title">{{ article.title }}</h1>
        <div class="post-meta">
          <span class="post-date">{{ formatDate(article.date) }}</span>
          <span v-if="article.author" class="post-author">作者: {{ article.author }}</span>
          <div v-if="article.tags && article.tags.length" class="post-tags">
            <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
      <div
        class="post-content"
        v-html="article.html"
        v-code-block
        v-image-optimize
        v-media-block
      ></div>

      <!-- 文章底部：版权信息和上一篇/下一篇导航 -->
      <PostFooter
        :current-slug="route.params.slug"
        :author="article.author || 'CircleCoder'"
        site-name="碼農書架"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useBannerStore } from '@/stores/banner'
import PostFooter from '@/components/PostFooter.vue'

const route = useRoute()
const articlesStore = useArticlesStore()
const bannerStore = useBannerStore()
const article = ref(null)
const loading = ref(true)
const error = ref(null)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const loadArticle = async (slug) => {
  console.log('PostView loadArticle called with slug:', slug)
  loading.value = true
  error.value = null

  try {
    // 确保文章列表已加载
    if (articlesStore.articles.length === 0) {
      console.log('Articles not loaded, loading articles first...')
      await articlesStore.loadArticles()
    }

    article.value = await articlesStore.getArticleBySlug(slug)
    console.log('Article loaded successfully:', article.value)
    console.log('Article HTML content:', article.value.html)
    console.log('Article content length:', article.value.content.length)

    // 设置文章 banner 信息
    bannerStore.setArticleBanner(article.value)
  } catch (err) {
    error.value = err.message
    console.error('Failed to load article:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('🚨 PostView mounted!')
  console.log('Route params:', route.params)
  console.log('Route fullPath:', route.fullPath)
  console.log('Route path:', route.path)
  console.log('Slug from route:', route.params.slug)
  loadArticle(route.params.slug)
})

watch(
  () => route.params.slug,
  (newSlug) => {
    loadArticle(newSlug)
  },
)

onUnmounted(() => {
  // 组件卸载时恢复默认 banner
  bannerStore.setDefaultBanner()
})
</script>

<style>
/* 基础布局 */
.post-content-wrapper {
  width: 80%;
  max-width: 960px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
  max-width: 960px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 8px 48px 0 rgba(237, 110, 160, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  margin: 0 auto;
  overflow: visible;
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
  color: #e9546b;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  color: #666;
  font-size: 0.95em;
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
}

/* 文章内容 */
.post-content {
  font-size: 1em;
  line-height: 1.6;
  color: #333;
  word-break: break-word;
  background: #fff;
  overflow: hidden;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'serif';
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
  color: #3b82f6;
  border-bottom: 1.5px solid #dbeafe;
  padding-bottom: 0.2em;
  font-family: 'SimHei', 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', 'Arial', 'sans-serif';
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
  margin: 1.2em auto;
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
  .post-content-wrapper {
    width: 85%;
  }
  .post-card-outer {
    padding: 2rem;
  }
  .post-title {
    font-size: 2.2em;
  }
}

@media (max-width: 768px) {
  .post-content-wrapper {
    width: 90%;
  }
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
    gap: 0.5rem;
  }
  .post-content {
    font-size: 1em;
    line-height: 1.8;
  }
  .post-content img {
    margin: 1em auto;
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
  .post-content-wrapper {
    width: 95%;
  }
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
    margin: 0.8em auto;
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
</style>
