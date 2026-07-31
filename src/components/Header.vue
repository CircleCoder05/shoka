<template>
  <header
    class="header"
    :class="{
      'header-visible': isVisible,
      'header-in-banner': isInBanner,
    }"
  >
    <!-- 移动端：显示网站标题和汉堡菜单 -->
    <div class="mobile-header">
      <div class="mobile-title">{{ configStore.siteConfig.author || 'CircleCoder' }}</div>
      <div class="mobile-actions">
        <button class="search-btn-mobile" @click="searchStore.openSearchModal" title="搜索文章">
          <i class="ic i-search"></i>
        </button>
        <ThemeToggle :simple="true" />
        <button class="mobile-menu-btn" @click="toggleMobileSidebar">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>

    <!-- PC端：显示完整导航 -->
    <nav class="nav">
      <router-link to="/"> <i class="ic i-home"></i>首页 </router-link>
      <router-link to="/archives"> <i class="ic i-archive"></i>归档 </router-link>
      <router-link to="/categories"> <i class="ic i-th"></i>分类 </router-link>
      <router-link to="/tags"> <i class="ic i-tags"></i>标签 </router-link>
      <router-link to="/about"> <i class="ic i-user"></i>关于 </router-link>
      <router-link to="/friends"> <i class="ic i-heart"></i>友链 </router-link>
      <router-link v-if="authStore.authenticated" to="/dashboard"><i class="ic i-edit"></i>管理</router-link>

      <!-- 搜索按钮 -->
      <button class="search-btn" @click="searchStore.openSearchModal" title="搜索文章 (Ctrl+K)">
        <i class="ic i-search"></i>
        <span class="search-text">搜索</span>
        <kbd class="search-shortcut">⌘K</kbd>
      </button>

      <!-- 主题切换 -->
      <ThemeToggle :simple="false" />
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMobileSidebarStore } from '@/stores/mobileSidebar'
import { useSearchStore } from '@/stores/search'
import { useConfigStore } from '@/stores/config'
import ThemeToggle from './ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'

const mobileSidebarStore = useMobileSidebarStore()
const searchStore = useSearchStore()
const configStore = useConfigStore()
const authStore = useAuthStore()

const toggleMobileSidebar = () => {
  mobileSidebarStore.toggleMobileSidebar()
}

// 响应式导航栏状态
const isInBanner = ref(true)
const isVisible = ref(true)
const lastScrollY = ref(0)

function updateHeader() {
  const scrollY = window.scrollY
  const bannerHeight = 320 // banner高度

  // 判断是否在banner区域
  isInBanner.value = scrollY < bannerHeight

  // 只有在滑出banner区域后才开始响应滚动方向
  if (scrollY >= bannerHeight) {
    if (scrollY > lastScrollY.value + 10) {
      // 向下滚动，隐藏
      isVisible.value = false
    } else if (scrollY < lastScrollY.value - 10) {
      // 向上滚动，显示
      isVisible.value = true
    }
  } else {
    // 在banner区域时，导航栏始终可见
    isVisible.value = true
  }

  lastScrollY.value = scrollY
}

onMounted(() => {
  window.addEventListener('scroll', updateHeader, { passive: true })
  authStore.restore()
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateHeader)
})
</script>

<style scoped lang="scss" src="@/styles/sfc/components/Header.scss"></style>
