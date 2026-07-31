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
import CategoryCard from '@/views/home/CategoryCard.vue'
import PostCard from '@/views/home/PostCard.vue'
import Pagination from '@/views/home/Pagination.vue'

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

  return articles.map((article) => {
    // 处理分类名，适配新的数据结构
    let categoryName = '未分类'
    let categoryKey = '未分类'
    if (article.categories && article.categories.length > 0) {
      const firstCategory = article.categories[0]

      // 新的数据结构：category是对象，包含key和name
      if (typeof firstCategory === 'object' && firstCategory.key && firstCategory.name) {
        categoryKey = firstCategory.key
        categoryName = firstCategory.name
      } else {
        // 兼容旧数据结构
        categoryName = Array.isArray(firstCategory) ? firstCategory[0] : firstCategory
        categoryKey = categoryName
        // 去除可能的引号和方括号
        categoryName = categoryName.replace(/^['"[\]]+|['"[\]]+$/g, '')
      }
    }

    return {
      ...article,
      url: `/post/${article.slug}`,
      cover: article.cover,
      category: {
        name: categoryName,
        key: categoryKey,
        url: `/category/${categoryKey}`,
      },
    }
  })
})

onMounted(async () => {
  if (statisticsStore.archives.length === 0) {
    await statisticsStore.loadStatistics()
  }
})
</script>

<style scoped lang="scss" src="@/styles/sfc/views/home/HomeView.scss"></style>
