<template>
  <!-- 移动端遮罩层 -->
  <div v-if="isMobileSidebarOpen" class="mobile-sidebar-overlay" @click="closeMobileSidebar"></div>

  <!-- 侧边栏 -->
  <div id="sidebar" :class="{ 'mobile-open': isMobileSidebarOpen }">
    <div class="inner">
      <!-- 移动端关闭按钮 -->
      <button v-if="isMobileSidebarOpen" class="mobile-close-btn" @click="closeMobileSidebar">
        <span class="close-line"></span>
        <span class="close-line"></span>
      </button>

      <!-- 切换按钮 - 只在文章页面显示 -->
      <div v-if="isArticlePage" class="tab">
        <div
          class="item contents"
          :class="{ active: activePanel === 'contents' }"
          @click="switchPanel('contents')"
        >
          <span>目录</span>
        </div>
        <div
          class="item overview"
          :class="{ active: activePanel === 'overview' }"
          @click="switchPanel('overview')"
        >
          <span>概览</span>
        </div>
      </div>

      <div class="panels">
        <div class="inner">
          <transition name="panel-slide" mode="out-in">
            <div
              v-if="activePanel === 'overview'"
              class="overview panel"
              key="overview"
              data-title="站点概览"
            >
              <!-- 作者信息 -->
              <div class="author" itemprop="author" itemscope itemtype="http://schema.org/Person">
                <img class="image" itemprop="image" alt="CircleCoder" :src="author.avatar" />
                <p class="name" itemprop="name">{{ author.name }}</p>
                <div class="description" itemprop="description">{{ author.description }}</div>
              </div>

              <!-- 统计数据 -->
              <nav class="state">
                <div class="item posts">
                  <a href="/archives/">
                    <span class="count">{{ stats.posts }}</span>
                    <span class="name">文章</span>
                  </a>
                </div>
                <div class="item categories">
                  <a href="/categories/">
                    <span class="count">{{ stats.categories }}</span>
                    <span class="name">分类</span>
                  </a>
                </div>
                <div class="item tags">
                  <a href="/tags/">
                    <span class="count">{{ stats.tags }}</span>
                    <span class="name">标签</span>
                  </a>
                </div>
              </nav>

              <!-- 社交链接 -->
              <div class="social">
                <span class="exturl item github" :data-url="social.github" title="GitHub">
                  <i class="ic i-github"></i>
                </span>
                <span class="exturl item music" :data-url="social.music" title="Music">
                  <i class="ic i-cloud-music"></i>
                </span>
                <a href="mailto:3196932484@qq.com" title="3196932484@qq.com" class="item email">
                  <i class="ic i-envelope"></i>
                </a>
              </div>

              <!-- 导航菜单 -->
              <ul class="menu">
                <li class="item">
                  <router-link to="/" rel="section" @click="closeMobileSidebar">
                    <i class="ic i-home"></i>首页
                  </router-link>
                </li>
                <li class="item">
                  <router-link to="/about" rel="section" @click="closeMobileSidebar">
                    <i class="ic i-user"></i>关于
                  </router-link>
                </li>
                <li class="item dropdown">
                  <a href="javascript:void(0);"> <i class="ic i-feather"></i>文章 </a>
                  <ul class="submenu">
                    <li class="item">
                      <router-link to="/archives" rel="section" @click="closeMobileSidebar">
                        <i class="ic i-list-alt"></i>归档
                      </router-link>
                    </li>
                    <li class="item">
                      <router-link to="/categories" rel="section" @click="closeMobileSidebar">
                        <i class="ic i-th"></i>分类
                      </router-link>
                    </li>
                    <li class="item">
                      <router-link to="/tags" rel="section" @click="closeMobileSidebar">
                        <i class="ic i-tags"></i>标签
                      </router-link>
                    </li>
                  </ul>
                </li>
                <li class="item">
                  <router-link to="/statistics" rel="section" @click="closeMobileSidebar">
                    <i class="ic i-clock"></i>统计
                  </router-link>
                </li>
                <li class="item">
                  <router-link to="/friends" rel="section" @click="closeMobileSidebar">
                    <i class="ic i-heart"></i>友链
                  </router-link>
                </li>
              </ul>
            </div>

            <div
              v-else-if="activePanel === 'contents'"
              class="contents panel"
              key="contents"
              data-title="目录"
            >
              <TableOfContents :content="articleContent" />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useMobileSidebarStore } from '@/stores/mobileSidebar'
import TableOfContents from './TableOfContents.vue'

const route = useRoute()
const sidebarStore = useSidebarStore()
const mobileSidebarStore = useMobileSidebarStore()

const author = ref({
  name: 'CircleCoder',
  avatar: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
  description: '空天报国，敢为人先',
})

const stats = ref({
  posts: 45,
  categories: 7,
  tags: 9,
})

const social = ref({
  github: 'https://github.com/CircleCoder05',
  music: 'https://music.163.com/#/user/home?id=yourid',
})

// 判断是否为文章页面
const isArticlePage = computed(() => {
  return route.name === 'post'
})

// 从 store 获取状态
const activePanel = computed(() => sidebarStore.activePanel)
const articleContent = computed(() => sidebarStore.articleContent)
const isMobileSidebarOpen = computed(() => mobileSidebarStore.isMobileSidebarOpen)

// 切换面板
const switchPanel = (panel) => {
  sidebarStore.switchPanel(panel)
}

// 关闭移动端侧边栏
const closeMobileSidebar = () => {
  mobileSidebarStore.closeMobileSidebar()
}
</script>

<style scoped>
/* 移动端遮罩层 */
.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
}

/* 移动端关闭按钮 */
.mobile-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.close-line {
  position: absolute;
  width: 20px;
  height: 2px;
  background: #666;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.close-line:first-child {
  transform: rotate(45deg);
}

.close-line:last-child {
  transform: rotate(-45deg);
}

.mobile-close-btn:hover .close-line {
  background: #333;
}

#sidebar {
  position: sticky;
  top: 40px;
  width: 18rem;
  max-height: calc(100vh - 56px);
  transition: all 0.2s ease-in-out 0s;
  z-index: 5;
  margin-left: 16px;
}

#sidebar > .inner {
  position: relative;
  width: 18rem;
  color: var(--grey-6);
  text-align: center;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  flex-wrap: wrap;
  z-index: 1;
}

.panels {
  padding: 4.6875rem 0 2rem;
  width: 100%;
  overflow: hidden;
}

.panels .inner {
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: auto;
  height: 100%;
}

.panels .inner::-webkit-scrollbar {
  display: none;
}

/* 面板切换动画 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.panels .panel {
  padding: 0.875rem 0.9375rem 2rem;
}

/* 切换按钮样式 */
.tab {
  position: absolute;
  display: inline-flex;
  padding: 1.875rem 0 0.625rem;
  margin: 0;
  min-height: 1.875rem;
  z-index: 10;
}

.tab .item {
  cursor: pointer;
  display: inline-flex;
  font-size: 0.875rem;
  padding: 0.3125rem 0.9375rem;
  color: var(--grey-5);
  border-radius: 0.625rem;
  text-align: center;
  text-decoration: none;
  background-color: rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin: 0 0.3125rem;
  position: relative;
  overflow: hidden;
  transform: translateY(0);
}

.tab .item::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.tab .item:hover::after {
  left: 100%;
}

.tab .item span {
  display: none;
  word-break: keep-all;
}

.tab .item.active span {
  display: inherit;
}

.tab .item:hover,
.tab .item.active {
  color: #fff;
  background-image: linear-gradient(to right, var(--color-pink) 0, var(--color-orange) 100%);
  box-shadow: 0 0 0.75rem var(--color-pink-a3);
  transform: translateY(-2px);
}

.tab .item.active:hover {
  box-shadow: 0 0 0.75rem var(--color-pink);
  transform: translateY(-3px);
}

.tab .item::before {
  font-family: inherit;
  margin-right: 0.3125rem;
  font-size: 1.1em;
}

.tab .item.overview::before {
  content: '🏠'; /* 首页图标 - 使用 emoji */
}

.tab .item.contents::before {
  content: '📋'; /* 目录图标 - 使用 emoji */
}

.tab .item.active::before {
  margin-right: 0.3125rem;
}

/* 作者信息样式 */
.overview .author .image {
  border: 0.0625rem solid var(--body-bg-shadow);
  display: block;
  margin: 0 auto;
  max-width: 10rem;
  padding: 0.125rem;
  box-shadow: 0 0 1rem 0.625rem var(--body-bg-shadow);
  border-radius: 50%;
  transition: all 0.2s ease-in-out;
}

.overview .author:hover .image {
  animation: shake 1s;
}

.overview .author .name {
  color: var(--grey-7);
  font-weight: 400;
  margin: 0.3125rem 0 0.625rem 0;
  text-align: center;
  font-family: 'SimHei', '黑体', sans-serif;
}

.overview .author .description {
  color: var(--grey-4);
  font-size: 1em;
  margin-top: 0.3125rem;
  text-align: center;
  font-family: 'SimHei', '黑体', sans-serif;
}

/* 统计数据样式 */
.state {
  display: flex;
  justify-content: center;
  line-height: 1.4;
  margin-top: 0.625rem;
  overflow: hidden;
  text-align: center;
  white-space: nowrap;
}

.state .item {
  padding: 0 0.9375rem;
}

.state .item:not(:first-child) {
  border-left: 1px solid #ccc;
}

.state .item a {
  border-bottom: none;
  color: inherit;
  text-decoration: none;
}

.state .item .count {
  display: block;
  font-size: 1.25em;
  font-weight: 700;
  text-align: center;
  font-family: 'SimHei', '黑体', sans-serif;
}

.state .item .name {
  color: inherit;
  font-size: 0.875em;
  font-family: 'SimHei', '黑体', sans-serif;
}

/* 社交链接样式 */
.social {
  margin-top: 0.9375rem;
  text-align: center;
}

.social .item {
  display: inline-block;
  width: 1.875rem;
  height: 1.875rem;
  line-height: 1.875rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-radius: 38%;
  margin: 0 0.25rem;
}

.social .item i {
  font-size: 1.4em;
  vertical-align: middle;
  transform: scale(0.8);
  transition: all 0.35s cubic-bezier(0.31, -0.105, 0.43, 1.59) 0s;
}

.social .item::before {
  top: 90%;
  left: -110%;
  content: '';
  width: 120%;
  height: 120%;
  position: absolute;
  transform: rotate(45deg);
  transition: all 0.35s cubic-bezier(0.31, -0.105, 0.43, 1.59) 0s;
}

.social .item:focus::before,
.social .item:hover::before {
  top: -10%;
  left: -10%;
}

.social .item:focus i,
.social .item:hover i {
  color: var(--grey-0);
  transform: scale(1);
}

.social .item.github::before {
  background-color: #191717;
}

.social .item.github i {
  color: #191717;
}

.social .item.music::before {
  background-color: #e60026;
}

.social .item.music i {
  color: #e60026;
}

.social .item.email::before {
  background-color: #55acd5;
}

.social .item.email i {
  color: #55acd5;
}

/* 导航菜单样式 */
.overview .menu {
  padding: 1.25rem;
  margin: 0;
  background-color: transparent;
}

.overview .menu .item {
  border-radius: 0.9375rem;
  margin-bottom: 0.625rem;
  display: block;
  color: var(--grey-5);
  transition: all 0.2s ease-in-out 0s;
}

.overview .menu .item a {
  color: inherit;
  display: block;
  line-height: 3;
  text-decoration: none;
  font-family: 'SimHei', '黑体', sans-serif;
}

.overview .menu .item a.router-link-active {
  color: #fff;
  background-image: linear-gradient(to right, var(--color-pink) 0, var(--color-orange) 100%);
  box-shadow: 0 0 0.75rem var(--color-pink-a3);
  border-radius: 0.9375rem;
}

.overview .menu .item .submenu {
  display: none;
  padding: 0;
}

.overview .menu .item:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: inherit;
}

.overview .menu .item:hover .submenu {
  display: block;
}

.overview .menu .item .ic {
  margin-right: 0.625rem;
}

.overview .menu .item.active:hover {
  box-shadow: 0 0 0.75rem var(--color-pink);
  color: var(--grey-0);
}

.overview .menu .item.active .item {
  color: currentColor;
}

.overview .menu .item.expand {
  background-color: rgba(0, 0, 0, 0.05);
}

.overview .menu .item.expand .submenu {
  display: block;
}

/* 抖动动画 */
@keyframes shake {
  0% {
    transform: scale(1);
  }
  10%,
  20% {
    transform: scale(0.9) rotate(3deg);
  }
  30%,
  50%,
  70%,
  90% {
    transform: scale(1.1) rotate(-3deg);
  }
  40%,
  60%,
  80% {
    transform: scale(1.1) rotate(3deg);
  }
  100% {
    transform: scale(1);
  }
}

/* 平板端适配 */
@media (max-width: 1024px) {
  #sidebar {
    width: 14rem;
  }

  #sidebar > .inner {
    width: 14rem;
  }

  .panels {
    padding: 3.5rem 0 1.5rem;
  }

  .overview .author .image {
    max-width: 8rem;
  }

  .state .item {
    padding: 0 0.75rem;
  }

  .state .count {
    font-size: 1.1em;
  }

  .state .name {
    font-size: 0.8em;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  #sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    max-height: 100vh;
    margin-left: 0;
    background: #fff;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    transition: left 0.3s ease-in-out;
    z-index: 1001;
    overflow-y: auto;
  }

  #sidebar.mobile-open {
    left: 0 !important;
    z-index: 1001 !important;
    opacity: 1 !important;
    display: block !important;
  }

  #sidebar > .inner {
    width: 100%;
    height: 100%;
    padding-top: 60px;
  }

  .panels {
    padding: 1.5rem 0 1rem;
    height: calc(100vh - 60px);
  }

  .panels .panel {
    padding: 0.5rem 0.75rem 1.5rem;
  }

  .overview .author .image {
    max-width: 6rem;
  }

  .overview .author .name {
    font-size: 1.1em;
  }

  .overview .author .description {
    font-size: 0.9em;
  }

  .state {
    margin-top: 0.5rem;
  }

  .state .item {
    padding: 0 0.5rem;
  }

  .state .count {
    font-size: 1em;
  }

  .state .name {
    font-size: 0.75em;
  }

  .social {
    margin-top: 0.75rem;
  }

  .social .item {
    width: 1.5rem;
    height: 1.5rem;
    line-height: 1.5rem;
    margin: 0 0.2rem;
  }

  .social .item i {
    font-size: 1.2em;
  }

  .overview .menu {
    padding: 1rem;
  }

  .overview .menu .item {
    margin-bottom: 0.5rem;
  }

  .overview .menu .item a {
    line-height: 2.5;
    font-size: 0.95em;
  }

  #sidebar .tab {
    position: static !important;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 1rem 0 0.5rem 0;
    background: none;
    z-index: auto;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  #sidebar {
    width: 260px;
  }

  .panels {
    padding: 1rem 0 0.5rem;
  }

  .panels .panel {
    padding: 0.25rem 0.5rem 1rem;
  }

  .overview .author .image {
    max-width: 5rem;
  }

  .overview .author .name {
    font-size: 1em;
  }

  .overview .author .description {
    font-size: 0.85em;
  }

  .state .item {
    padding: 0 0.4rem;
  }

  .state .count {
    font-size: 0.9em;
  }

  .state .name {
    font-size: 0.7em;
  }

  .social .item {
    width: 1.3rem;
    height: 1.3rem;
    line-height: 1.3rem;
    margin: 0 0.15rem;
  }

  .social .item i {
    font-size: 1em;
  }

  .overview .menu {
    padding: 0.75rem;
  }

  .overview .menu .item a {
    line-height: 2.2;
    font-size: 0.9em;
  }
}

/* CSS变量定义 */
:root {
  --grey-0: #fff;
  --grey-1: #fdfdfd;
  --grey-2: #f7f7f7;
  --grey-3: #eff2f3;
  --grey-4: #ccc;
  --grey-5: #999;
  --grey-6: #666;
  --grey-7: #333;
  --grey-8: #222;
  --grey-9: #000;
  --body-bg-shadow: var(--grey-2);
  --color-pink: #ed6ea0;
  --color-orange: #ec8c69;
  --color-pink-a3: rgba(237, 110, 160, 0.3);
}

#sidebar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}
#sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #b3c0d1 0%, #ed6ea0 100%);
  border-radius: 6px;
  min-height: 40px;
  transition: background 0.3s;
}
#sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #ed6ea0 0%, #b3c0d1 100%);
}
#sidebar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 6px;
}
#sidebar::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
