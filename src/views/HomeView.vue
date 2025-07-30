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
  opacity: 0.9;
}

.waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  min-height: 50px;
  max-height: 150px;
  z-index: 1;
}

.waves svg {
  width: 100%;
  height: 100%;
}

.parallax use {
  animation: waveMove 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.wave1 {
  animation-delay: -2s;
  animation-duration: 7s;
  fill: rgba(255, 255, 255, 0.7);
}

.wave2 {
  animation-delay: -3s;
  animation-duration: 10s;
  fill: rgba(255, 255, 255, 0.5);
}

.wave3 {
  animation-delay: -4s;
  animation-duration: 13s;
  fill: rgba(255, 255, 255, 0.3);
}

.wave4 {
  animation-delay: -5s;
  animation-duration: 20s;
  fill: rgba(255, 255, 255, 1);
}

@keyframes waveMove {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

.home-main-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  gap: 32px;
}

.main-content {
  flex: 1;
  padding: 40px 0;
  background: transparent;
  border: none;
  box-shadow: 0 2px 16px rgba(237, 110, 160, 0.08);
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

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 2fr));
  gap: 10px;
  margin: 2rem 0;
  justify-items: center;
  justify-content: center;
}

.segments {
  margin-bottom: 40px;
}
</style>
