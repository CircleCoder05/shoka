<template>
  <div class="home-content">
    <div v-if="statisticsStore.loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else>
      <h2 class="divider">精选分类</h2>
      <div class="cards">
        <CategoryCard
          v-for="category in statisticsStore.categoriesWithCount.filter(
            (cat) => cat.name !== '未分类',
          )"
          :key="category.slug"
          :category="{
            name: category.name,
            title: category.name,
            posts: statisticsStore.getArticlesByCategory(category.name),
          }"
        />
      </div>
      <h2 class="divider">文章列表</h2>
      <div class="articles">
        <PostCard v-for="post in paginatedArticles" :key="post.slug" :post="post" />
      </div>
      <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:currentPage="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import CategoryCard from '../components/CategoryCard.vue'
import PostCard from '../components/PostCard.vue'
import Pagination from '../components/Pagination.vue'

const statisticsStore = useStatisticsStore()
const currentPage = ref(1)
const pageSize = 6

const totalPages = computed(() => {
  return Math.ceil(statisticsStore.archives.length / pageSize)
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  const articles = statisticsStore.archives.slice(start, end)

  console.log('📄 [HomeView] paginatedArticles 处理文章范围:', start, '到', end)
  console.log('📄 [HomeView] 当前页文章数:', articles.length)

  return articles.map((article, idx) => {
    console.log(`📝 [HomeView] 处理第${idx + 1}篇文章:`, article.slug)
    console.log(`📝 [HomeView] 原始categories:`, article.categories)

    // 处理分类名，适配新的数据结构
    let categoryName = '未分类'
    let categoryKey = '未分类'
    if (article.categories && article.categories.length > 0) {
      const firstCategory = article.categories[0]
      console.log(`🏷️ [HomeView] 第一个分类:`, firstCategory, `类型:`, typeof firstCategory)

      // 新的数据结构：category是对象，包含key和name
      if (typeof firstCategory === 'object' && firstCategory.key && firstCategory.name) {
        categoryKey = firstCategory.key
        categoryName = firstCategory.name
        console.log(`✅ [HomeView] 使用新数据结构 - key:`, categoryKey, `name:`, categoryName)
      } else {
        // 兼容旧数据结构
        categoryName = Array.isArray(firstCategory) ? firstCategory[0] : firstCategory
        categoryKey = categoryName
        // 去除可能的引号和方括号
        categoryName = categoryName.replace(/^['"[\]]+|['"[\]]+$/g, '')
        console.log(`⚠️ [HomeView] 使用旧数据结构 - key:`, categoryKey, `name:`, categoryName)
      }
    } else {
      console.log(`❌ [HomeView] 文章无categories字段`)
    }

    const result = {
      ...article,
      url: `/post/${article.slug}`,
      cover: article.cover,
      category: {
        name: categoryName,
        key: categoryKey,
        url: `/category/${categoryKey}`,
      },
    }

    console.log(`🎯 [HomeView] 最终处理结果:`, {
      slug: article.slug,
      categoryName: result.category.name,
      categoryKey: result.category.key,
      categoryUrl: result.category.url,
    })

    return result
  })
})

onMounted(async () => {
  if (statisticsStore.archives.length === 0) {
    await statisticsStore.loadStatistics()
  }
})
</script>

<style scoped>
.home-content {
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

.divider {
  margin: 2rem 0;
  line-height: 1;
  height: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  user-select: none;
  color: #999;
  display: table;
  white-space: nowrap;
  height: auto;
  line-height: 1;
  text-align: center;
  font-size: 1.5rem;
  border: none;
  border-left: none;
  border-right: none;
  border-top: none;
  border-bottom: none;
}

.divider::after,
.divider::before {
  content: '';
  display: table-cell;
  position: relative;
  top: 50%;
  width: 50%;
  background-repeat: no-repeat;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaAAAAACCAYAAACuTHuKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1OThBRDY4OUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1OThBRDY4QUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjU5OEFENjg3Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU5OEFENjg4Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VU513gAAADVJREFUeNrs0DENACAQBDBIWLGBJQby/mUcJn5sJXQmOQMAAAAAAJqt+2prAAAAAACg2xdgANk6BEVuJgyMAAAAAElFTkSuQmCC');
}

.divider::before {
  background-position: right 1rem top 50%;
}

.divider::after {
  background-position: left 1rem top 50%;
}

/* 精选分类卡片区域 - 响应式网格布局 */
.cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
  width: 100%;
}

/* 文章列表区域 */
.articles {
  width: 100%;
}

.segments {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.segments > .item {
  display: flex;
  border-radius: 0.625rem;
  width: calc(100% - 2rem);
  min-width: calc(100% - 2rem);
  height: 14rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.625rem 1.875rem -0.9375rem rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out 0s;
  margin-bottom: 2rem;
}

.segments > .item:hover {
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.1);
}

.segments > .item:hover .cover img {
  transform: scale(1.05) rotate(1deg);
}

.segments .cover {
  width: 50%;
  height: 100%;
  margin-right: 1.5rem;
  clip-path: polygon(0 0, 92% 0%, 100% 100%, 0% 100%);
  border-radius: 0.625rem 0 0 0.625rem;
  overflow: hidden;
}

.segments .cover img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  transition: all 0.2s ease-in-out 0s;
}

.segments .info {
  position: relative;
  width: 50%;
  height: 100%;
  padding: 1rem 1.5rem 3rem 0;
  perspective: 62.5rem;
}

.segments .info .meta {
  display: flex;
  justify-content: flex-end;
  margin: 0;
  font-size: 0.75em;
  color: #999;
}

.segments .info h3 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin: 0.5rem 0;
  color: #e9546b;
  font-size: 1.1em;
}

.segments .info .excerpt {
  overflow: hidden;
  font-size: 0.875em;
  max-height: 3.5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  color: #666;
  line-height: 1.4;
  margin: 0.5rem 0;
}

.segments > .item:nth-child(2n) {
  flex-direction: row-reverse;
}

.segments > .item:nth-child(2n) .cover {
  margin-right: auto;
  margin-left: 1.5rem;
  clip-path: polygon(0 0%, 100% 0%, 100% 100%, 8% 100%);
  border-radius: 0 0.625rem 0.625rem 0;
}

.segments > .item:nth-child(2n) .info {
  padding: 1rem 0 3rem 1.5rem;
}

.segments > .item:nth-child(2n) .info .meta {
  justify-content: flex-start;
}

.segments > .item:nth-child(2n):hover .cover img {
  transform: scale(1.05) rotate(-1deg);
}

/* 大屏幕适配 (1200px+) */
@media (min-width: 1200px) {
  .home-content {
    max-width: 1200px;
    padding: 2.5rem;
  }

  .cards {
    gap: 2rem;
  }
}

/* 中等屏幕适配 (768px - 1199px) */
@media (max-width: 1199px) and (min-width: 768px) {
  .home-content {
    max-width: 100%;
    padding: 1.5rem;
  }

  .cards {
    gap: 1.25rem;
  }
}

/* 平板端适配 (768px - 1023px) */
@media (max-width: 1023px) and (min-width: 768px) {
  .home-content {
    max-width: 100%;
    padding: 1.25rem;
  }

  .cards {
    gap: 1rem;
  }

  .divider {
    font-size: 1.4rem;
  }
}

/* 移动端适配 (480px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .home-content {
    max-width: 100%;
    padding: 1rem;
  }

  .cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .divider {
    font-size: 1.3rem;
  }

  .divider::before {
    background-position: right 0.5rem top 50%;
  }

  .divider::after {
    background-position: left 0.5rem top 50%;
  }
}

/* 小屏手机适配 (480px以下) */
@media (max-width: 480px) {
  .home-content {
    max-width: 100%;
    padding: 0.75rem;
  }

  .cards {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .divider {
    font-size: 1.2rem;
  }

  .divider::before {
    background-position: right 0.25rem top 50%;
  }

  .divider::after {
    background-position: left 0.25rem top 50%;
  }
}

/* 超小屏适配 (360px以下) */
@media (max-width: 360px) {
  .home-content {
    max-width: 100%;
    padding: 0.5rem;
  }

  .cards {
    gap: 0.5rem;
  }

  .divider {
    font-size: 1.1rem;
  }
}

/* 移动端文章卡片适配 */
@media (max-width: 767px) {
  .segments > .item {
    flex-direction: column;
    height: fit-content;
    max-height: fit-content;
  }

  .segments .cover {
    width: 100%;
    height: 14rem;
    margin: auto;
    clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);
    border-radius: 0.625rem 0.625rem 0 0;
  }

  .segments .info {
    width: 100%;
    height: 14rem;
    padding: 0 1rem 3rem;
  }

  .segments > .item:nth-child(2n) {
    flex-direction: column;
  }

  .segments > .item:nth-child(2n) .cover {
    width: 100%;
    margin: auto;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 92%);
    border-radius: 0.625rem 0.625rem 0 0;
  }

  .segments > .item:nth-child(2n) .info {
    padding: 0 1rem 3rem;
  }
}
</style>
