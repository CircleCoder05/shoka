<template>
  <div>
    <h2 class="divider">精选分类</h2>
    <div class="cards">
      <CategoryCard v-for="cat in categories" :key="cat.name" :category="cat" />
    </div>
    <h2 class="divider">文章列表</h2>
    <div class="segments posts">
      <PostCard v-for="post in pagedPosts" :key="post.slug" :post="post" />
    </div>
    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @update:currentPage="currentPage = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CategoryCard from '../components/CategoryCard.vue'
import PostCard from '../components/PostCard.vue'
import Pagination from '../components/Pagination.vue'

// mock 精选分类
const categories = ref([
  {
    name: 'ML',
    title: '机器学习',
    cover: '/ML/cover.jpg',
    posts: [
      { title: 'ML-Chapter0-概述', slug: 'ML-OS-Chapter0' },
      { title: 'ML-Chapter2-模型评估与选择', slug: 'ML-OS-Chapter2' },
    ],
  },
  {
    name: 'CO',
    title: '计算机组成原理',
    cover: '/CO/cover.jpg',
    posts: [
      { title: 'P5课上指令攻略', slug: 'CO-2024-11-15-bulid_own_website' },
      { title: 'P6评测机说明', slug: 'CO-2024-11-20-P6' },
      { title: 'P7课上指令回忆', slug: 'CO-2024-12-03-P7' },
    ],
  },
  // ...可继续添加
])

// mock 文章列表
const posts = ref([
  {
    slug: 'Web-VueDjango',
    title: 'Vue+Django 开发前后端分离项目',
    cover: 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292158821.jpg',
    date: '2025-05-15',
    length: 6000,
    readingTime: 11,
    excerpt:
      '笔者自学了 Vue 前端工程化开发和 Django 后端开发，但是网上关于如何将二者结合成前后端分离项目的教程较少...',
    category: 'Web',
    categoryTitle: 'Web',
  },
  {
    slug: 'OS-Chapter6',
    title: 'OS-Chapter6-文件系统',
    cover: 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311942090.jpg',
    date: '2025-05-14',
    length: 3700,
    readingTime: 7,
    excerpt:
      '文件是一种抽象机制，它提供了一种把信息保存在磁盘等存储设备上，并且便于以后访问的方法...',
    category: 'OS',
    categoryTitle: '操作系统',
  },
  // ...可继续添加
])

// 分页逻辑
const pageSize = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(posts.value.length / pageSize))
const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return posts.value.slice(start, start + pageSize)
})
</script>

<style scoped>
.divider {
  font-size: 22px;
  font-weight: bold;
  margin: 32px 0 16px 0;
  border-left: 4px solid #409eff;
  padding-left: 12px;
}
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
}
.segments.posts {
  margin-bottom: 32px;
}
</style>
