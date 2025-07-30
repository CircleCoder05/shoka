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
        <div class="articles">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
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
    id: 1,
    title: 'Vue+Django 开发前后端分离项目',
    url: '/post/vue-django',
    cover: 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292158821.jpg',
    date: '2025-05-15',
    wordCount: '6k',
    readTime: '11',
    excerpt:
      '# 前言 笔者自学了 Vue 前端工程化开发和 Django 后端开发，但是网上关于如何将二者结合成前后端分离项目的教程较少。幸运的是，笔者的导员学姐曾给笔者推荐过一篇博客，记载了二者结合的过程。但是由于年代久远，框架版本过低，一些语法和细节不再适用。于是笔者重新记录一下此过程...',
    category: {
      name: 'Web',
      url: '/categories/Web',
    },
  },
  {
    id: 2,
    title: 'OS-Chapter6-文件系统',
    url: '/post/os-chapter6',
    cover: 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311942090.jpg',
    date: '2025-05-14',
    wordCount: '3.7k',
    readTime: '7',
    excerpt:
      '# 文件 # 概念 文件是一种抽象机制，它提供了一种把信息保存在磁盘等存储设备上，并且便于以后访问的方法。抽象性体现在用户不必关心具体的实现细节。 可以视为一个单独的连续的逻辑地址空间，其大小即为文件的大小，与进程的地址空间无关...',
    category: {
      name: '操作系统',
      url: '/categories/OS',
    },
  },
  {
    id: 3,
    title: 'OS-题目-操作系统基础',
    url: '/post/os-quiz2',
    cover: 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943580.jpg',
    date: '2025-05-14',
    wordCount: '1.4k',
    readTime: '3',
    excerpt:
      '# 选填题 虚拟存储器只能基于 非连续分配技术 采用二级页表的分页系统中，CPU 页表基址寄存器中的内容是 当前进程一级页表的起始物理地址 动态分区分配算法中，最容易产生内存碎片的是 最佳适应算法，最不容易产生内存碎片的是 最坏适应算法...',
    category: {
      name: '操作系统',
      url: '/categories/OS',
    },
  },
  {
    id: 4,
    title: 'OS-题目-I/O设备',
    url: '/post/os-quiz5',
    cover: 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503292158368.jpg',
    date: '2025-05-14',
    wordCount: '1.7k',
    readTime: '3',
    excerpt:
      '# 选填题 不会导致磁臂黏着的磁盘调度算法是 先来先服务（FCFS） 在系统内存中设置磁盘缓冲区的主要目的是 **** 程序员利用系统调用打开 I/O 设备时，通常使用的设备标识是 逻辑设备名 SPOOLing 技术中，输入井和输出井是 硬盘的一部分...',
    category: {
      name: '操作系统',
      url: '/categories/OS',
    },
  },
])

const currentPage = ref(1)
const pageSize = 3
const totalPages = computed(() => Math.ceil(posts.value.length / pageSize))
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
  box-shadow:
    0 8px 48px 0 rgba(237, 110, 160, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08);
  padding-left: 28px;
  padding-right: 28px;
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
  /* 精选分类卡片区域左右间距 */
  margin-left: 16px;
  margin-right: 16px;
}

.articles {
  /* 文章卡片区域左右间距 */
  margin-left: 16px;
  margin-right: 16px;
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
