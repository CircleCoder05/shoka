<template>
  <div class="article-card">
    <!-- 封面图片 -->
    <div class="article-cover">
      <img :src="getCoverImage(article)" :alt="article.title" @error="handleImageError" />
    </div>

    <!-- 文章信息 -->
    <div class="article-info">
      <h3 class="article-title">
        <router-link :to="`/post/${article.slug}`">
          {{ article.title }}
        </router-link>
      </h3>

      <div class="article-meta">
        <span class="author">
          <i class="ic i-user"></i>
          {{ article.author || 'CircleCoder' }}
        </span>
        <span class="date">
          <i class="ic i-calendar"></i>
          {{ formatDate(article.date) }}
        </span>
        <span v-if="getCategoryName(article.categories?.[0])" class="category">
          <i class="ic i-flag"></i>
          {{ getCategoryName(article.categories[0]) }}
        </span>
      </div>

      <div class="article-excerpt">
        {{ getExcerpt(article) }}
      </div>

      <div class="article-footer">
        <div class="article-stats">
          <span class="word-count">
            <i class="ic i-pen"></i>
            {{ getWordCount(article) }}字
          </span>
          <span class="read-time">
            <i class="ic i-clock"></i>
            {{ getReadTime(article) }}
          </span>
        </div>

        <div class="article-tags">
          <span v-for="tag in getTagsArray(article.tags)" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <router-link :to="`/post/${article.slug}`" class="read-more-btn">
          阅读全文
          <i class="ic i-arrow-right"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics'

defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const statisticsStore = useStatisticsStore()

// 工具函数
const getCoverImage = (article) => {
  return article.cover
}

const handleImageError = (event) => {
  // 如果图片加载失败，隐藏图片
  event.target.style.display = 'none'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const getCategoryName = (category) => {
  if (!category) return null

  // 如果category是数组，取第一个元素
  let cleanCategory = category
  if (Array.isArray(category)) {
    cleanCategory = category[0]
  } else if (typeof category === 'string' && category.startsWith('[') && category.endsWith(']')) {
    // 处理数组字符串的情况，如 "[\"操作系统\"]"
    try {
      const parsed = JSON.parse(category)
      cleanCategory = Array.isArray(parsed) ? parsed[0] : parsed
    } catch {
      // 如果JSON解析失败，尝试简单的字符串处理
      cleanCategory = category.replace(/^\[["']?|["']?\]$/g, '')
    }
  }

  const categories = statisticsStore.categories
  return categories.find((cat) => cat.slug === cleanCategory)?.name || cleanCategory
}

const getTagsArray = (tags) => {
  if (!tags) return []
  return Array.isArray(tags) ? tags : [tags]
}

const getExcerpt = (article) => {
  return article.excerpt || '这篇文章还没有摘要...'
}

const getWordCount = (article) => {
  return article.wordCount || 0
}

const getReadTime = (article) => {
  return `${article.readTime || 1} 分钟`
}
</script>

<style scoped>
/* 文章卡片 */
.article-card {
  display: flex;
  width: 100%;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ed6ea0 0%, #ec8c69 100%);
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}

/* 封面图片 */
.article-cover {
  width: 280px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  align-self: stretch;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

/* 文章信息 */
.article-info {
  flex: 1;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;
}

.article-title {
  margin: 0 0 0.8rem 0;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.article-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.article-title a:hover {
  color: #ed6ea0;
}

.article-meta {
  display: flex;
  gap: 0.6rem;
  font-size: 0.7rem;
  color: #666;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
  min-height: 16px;
  /* line-height: 1.2; */
}

.article-meta span {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  /* line-height: 1.2; */
  margin-bottom: 0%;
}

.article-meta i {
  font-size: 0.75rem;
  color: #ed6ea0;
}

.article-excerpt {
  color: #666;
  line-height: 1.6;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  min-height: 30px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.article-stats {
  display: flex;
  gap: 0.6rem;
  font-size: 0.7rem;
  color: #999;
  flex-wrap: wrap;
}

.article-stats span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.article-stats i {
  font-size: 0.7rem;
  color: #ed6ea0;
}

.article-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.15rem 0.5rem;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  color: #fff;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  transition: transform 0.2s ease;
  white-space: nowrap;
}

.tag:hover {
  transform: translateY(-2px);
}

.read-more-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.25);
}

.read-more-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(237, 110, 160, 0.35);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-card {
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 200px;
  }

  .article-info {
    padding: 1rem;
  }

  .article-title {
    font-size: 1.1rem;
  }

  .article-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .read-more-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .article-cover {
    width: 240px;
    height: 100%;
  }

  .article-info {
    padding: 1rem;
  }

  .article-title {
    font-size: 1.1rem;
  }
}
</style>
