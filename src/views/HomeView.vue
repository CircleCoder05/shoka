<template>
  <div>
    <!-- 顶部大图和动态波浪分割，全宽 -->
    <div class="home-banner">
      <div class="banner-images">
        <img
          src="https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943773.jpg"
          alt="banner"
        />
      </div>
      <div class="banner-title">
        <h1>CircleCoder</h1>
        <p>= 仰望星空 =</p>
      </div>
      <div class="waves">
        <svg viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g class="parallax">
            <use xlink:href="#gentle-wave" x="48" y="0" class="wave1" />
            <use xlink:href="#gentle-wave" x="48" y="3" class="wave2" />
            <use xlink:href="#gentle-wave" x="48" y="5" class="wave3" />
            <use xlink:href="#gentle-wave" x="48" y="7" class="wave4" />
          </g>
        </svg>
      </div>
    </div>
    <!-- banner 下方主区块：侧边栏+内容 -->
    <div class="home-main-layout">
      <Sidebar />
      <main class="main-content">
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
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from '../components/Sidebar.vue'
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
      { title: '深度学习入门', slug: 'dl-intro' },
      { title: '机器学习基础', slug: 'ml-basic' },
    ],
  },
  {
    name: 'CO',
    title: '计算机组成原理',
    cover: '/CO/cover.jpg',
    posts: [
      { title: '存储系统', slug: 'storage-system' },
      { title: '流水线', slug: 'pipeline' },
    ],
  },
])

// mock 文章列表
const posts = ref([
  {
    slug: 'dl-intro',
    title: '深度学习入门',
    cover: '/ML/cover.jpg',
    excerpt: '深度学习是机器学习的一个分支...',
    date: '2024-05-01',
    length: 1200,
    readingTime: 5,
    category: 'ML',
    categoryTitle: '机器学习',
    tags: ['AI', '深度学习'],
  },
  {
    slug: 'ml-basic',
    title: '机器学习基础',
    cover: '/ML/cover.jpg',
    excerpt: '机器学习基础知识梳理...',
    date: '2024-04-20',
    length: 900,
    readingTime: 4,
    category: 'ML',
    categoryTitle: '机器学习',
    tags: ['AI', '基础'],
  },
  {
    slug: 'storage-system',
    title: '存储系统',
    cover: '/CO/cover.jpg',
    excerpt: '存储系统的基本原理...',
    date: '2024-03-15',
    length: 800,
    readingTime: 3,
    category: 'CO',
    categoryTitle: '计算机组成原理',
    tags: ['硬件', '存储'],
  },
  {
    slug: 'pipeline',
    title: '流水线',
    cover: '/CO/cover.jpg',
    excerpt: 'CPU 流水线技术详解...',
    date: '2024-02-10',
    length: 1100,
    readingTime: 5,
    category: 'CO',
    categoryTitle: '计算机组成原理',
    tags: ['硬件', 'CPU'],
  },
])

const currentPage = ref(1)
const pageSize = 3
const totalPages = computed(() => Math.ceil(posts.value.length / pageSize))
const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return posts.value.slice(start, start + pageSize)
})
</script>

<style scoped>
.home-banner {
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  height: 66vh;
  min-height: 320px;
  max-height: 600px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  z-index: 1;
}
.banner-images img {
  width: 100vw;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  filter: brightness(0.85) blur(0.5px);
}
.banner-title {
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: center;
  margin-bottom: 32px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.banner-title h1 {
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0 0 16px 0;
}
.banner-title p {
  font-size: 1.2rem;
  margin: 0;
}
.waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 60px;
  z-index: 2;
}
.waves .wave1 {
  fill: #ed6ea0;
  opacity: 0.5;
  animation: waveMove 8s linear infinite;
}
.waves .wave2 {
  fill: #ec8c69;
  opacity: 0.4;
  animation: waveMove 12s linear infinite reverse;
}
.waves .wave3 {
  fill: #38a1db;
  opacity: 0.3;
  animation: waveMove 10s linear infinite;
}
.waves .wave4 {
  fill: #fff;
  opacity: 0.7;
  animation: waveMove 14s linear infinite reverse;
}
@keyframes waveMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-80px);
  }
}
.home-main-layout {
  display: flex;
  flex-direction: row;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  gap: 24px;
  margin-top: 32px;
}
.main-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.08);
  padding: 32px 24px;
  min-height: 400px;
}
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
  background: transparent;
  box-shadow: none;
  padding: 16px 0;
}
</style>
