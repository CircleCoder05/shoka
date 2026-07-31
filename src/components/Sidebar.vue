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
                  <router-link to="/categories">
                    <span class="count">{{ stats.categories }}</span>
                    <span class="name">分类</span>
                  </router-link>
                </div>
                <div class="item tags">
                  <router-link to="/tags">
                    <span class="count">{{ stats.tags }}</span>
                    <span class="name">标签</span>
                  </router-link>
                </div>
              </nav>

              <!-- 社交链接 -->
              <div class="social">
                <a
                  v-for="item in configStore.siteConfig.social || []"
                  :key="item.name"
                  :href="item.url"
                  :class="['item', item.name]"
                  :title="item.name"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i :class="['ic', item.icon]"></i>
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
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useMobileSidebarStore } from '@/stores/mobileSidebar'
import { useStatisticsStore } from '@/stores/statistics'
import { useConfigStore } from '@/stores/config'
import TableOfContents from './TableOfContents.vue'

const route = useRoute()
const sidebarStore = useSidebarStore()
const mobileSidebarStore = useMobileSidebarStore()
const statisticsStore = useStatisticsStore()
const configStore = useConfigStore()

const author = computed(() => ({
  name: configStore.siteConfig.author || 'CircleCoder',
  avatar: configStore.siteConfig.avatar || '/img/avatar.png',
  description: configStore.siteConfig.motto || '代码改变世界，知识改变人生',
}))

const social = computed(() => ({
  github: configStore.siteConfig.github || 'https://github.com/CircleCoder05',
  music: 'https://music.163.com/#/user/home?id=yourid',
}))

// 判断是否为文章页面
const isArticlePage = computed(() => {
  return route.name === 'post'
})

// 从 store 获取状态
const activePanel = computed(() => sidebarStore.activePanel)
const articleContent = computed(() => sidebarStore.articleContent)
const isMobileSidebarOpen = computed(() => mobileSidebarStore.isMobileSidebarOpen)

// 动态统计数据
const stats = computed(() => ({
  posts: statisticsStore.archives.length,
  categories: statisticsStore.categories.length,
  tags: statisticsStore.tags.length,
}))

// 切换面板
const switchPanel = (panel) => {
  sidebarStore.switchPanel(panel)
}

// 关闭移动端侧边栏
const closeMobileSidebar = () => {
  mobileSidebarStore.closeMobileSidebar()
}

// 初始化统计数据
const initStatistics = async () => {
  if (statisticsStore.archives.length === 0) {
    await statisticsStore.loadStatistics()
  }
}

// 组件挂载时加载配置和统计数据
onMounted(async () => {
  await configStore.loadConfig()
  await initStatistics()
})
</script>

<style scoped lang="scss" src="@/styles/sfc/components/Sidebar.scss"></style>
