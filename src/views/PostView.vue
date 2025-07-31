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
      <div class="post-content" v-html="article.html"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'

const route = useRoute()
const articlesStore = useArticlesStore()
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
    article.value = await articlesStore.getArticleBySlug(slug)
    console.log('Article loaded successfully:', article.value)
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
</script>
<style scoped>
.post-content-wrapper {
  width: 80%;
  max-width: 960px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 平板端适配 */
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

/* 移动端适配 */
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
}

/* 小屏手机适配 */
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

  .post-content pre {
    padding: 1rem;
    font-size: 0.85em;
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
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

.error {
  text-align: center;
  color: #e9546b;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

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

.post-content {
  font-size: 1.1em;
  line-height: 2;
  color: #222;
  word-break: break-word;
  background: #fff;
}

.post-content h1,
.post-content h2,
.post-content h3,
.post-content h4 {
  font-weight: bold;
  margin: 2.2em 0 1em 0;
  line-height: 1.3;
  color: #e9546b;
  border-bottom: 1.5px solid #f3c1d1;
  padding-bottom: 0.2em;
}

.post-content h1 {
  font-size: 2.2em;
}

.post-content h2 {
  font-size: 1.7em;
}

.post-content h3 {
  font-size: 1.4em;
}

.post-content h4 {
  font-size: 1.2em;
}

.post-content p {
  margin: 1.2em 0;
  text-align: justify;
}

.post-content ul,
.post-content ol {
  margin: 1.2em 0;
  padding-left: 2em;
}

.post-content li {
  margin: 0.5em 0;
  line-height: 1.8;
}

.post-content blockquote {
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background: #f8f9fa;
  border-left: 4px solid #e9546b;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #555;
}

.post-content code {
  background: #f1f3f4;
  color: #e9546b;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.post-content pre {
  margin: 1.5em 0;
  padding: 1.5em;
  background: #2d3748;
  border-radius: 8px;
  overflow-x: auto;
}

.post-content pre code {
  background: none;
  color: #e2e8f0;
  padding: 0;
  font-size: 0.95em;
  line-height: 1.6;
}

.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em auto;
  display: block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-content th,
.post-content td {
  padding: 0.75em 1em;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.post-content th {
  background: #f3c1d1;
  color: #e9546b;
  font-weight: 600;
}

.post-content tr:hover {
  background: #f8f9fa;
}

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
</style>
