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

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const statisticsStore = useStatisticsStore()

// 随机图片列表
const randomImages = [
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292157001.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292158771.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292158368.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292158099.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292158821.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292158043.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311942570.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311942090.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311942804.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943183.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943052.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943222.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943439.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943580.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943773.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311944494.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311944837.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311944966.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311944606.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311945788.jpg',
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311945208.jpg',
]

// 工具函数
const getCoverImage = (article) => {
  if (article.cover) {
    return article.cover
  }

  // 使用随机图片
  const index = Math.abs(article.title.hashCode()) % randomImages.length
  return randomImages[index]
}

const handleImageError = (event) => {
  event.target.src = randomImages[0]
  event.target.onerror = null
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const getCategoryName = (category) => {
  if (!category) return null
  const categories = statisticsStore.categories
  return categories.find((cat) => cat.slug === category)?.name || category
}

const getTagsArray = (tags) => {
  if (!tags) return []
  return Array.isArray(tags) ? tags : [tags]
}

const getExcerpt = (article) => {
  if (article.excerpt) {
    return article.excerpt
  }
  if (article.content) {
    const text = article.content.replace(/[#*`]/g, '').replace(/\n/g, ' ')
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }
  return '这篇文章还没有摘要...'
}

const getWordCount = (article) => {
  if (article.content) {
    return article.content.replace(/\s/g, '').length
  }
  return 0
}

const getReadTime = (article) => {
  const wordCount = getWordCount(article)
  const minutes = Math.ceil(wordCount / 300)
  return `${minutes} 分钟`
}

// 为String添加hashCode方法
if (!String.prototype.hashCode) {
  String.prototype.hashCode = function () {
    let hash = 0
    if (this.length === 0) return hash
    for (let i = 0; i < this.length; i++) {
      const char = this.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash
  }
}
</script>

<style scoped>
/* 文章卡片 */
.article-card {
  display: flex;
  width: 100%;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 200px;
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
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

/* 封面图片 */
.article-cover {
  width: 240px;
  height: 180px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;
}

.article-title {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
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
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.article-meta i {
  font-size: 0.75rem;
  color: #ed6ea0;
}

.article-excerpt {
  color: #666;
  line-height: 1.5;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.article-stats {
  display: flex;
  gap: 0.8rem;
  font-size: 0.75rem;
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
  padding: 0.4rem 0.8rem;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 18px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(237, 110, 160, 0.3);
}

.read-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(237, 110, 160, 0.4);
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
    width: 200px;
    height: 150px;
  }

  .article-info {
    padding: 1.2rem;
  }

  .article-title {
    font-size: 1.2rem;
  }
}
</style>
