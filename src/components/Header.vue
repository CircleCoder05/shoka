<template>
  <header
    class="header"
    :class="{
      'header-visible': isVisible,
      'header-in-banner': isInBanner,
    }"
  >
    <!-- 移动端：显示CircleCoder标题和汉堡菜单 -->
    <div class="mobile-header">
      <div class="mobile-title">CircleCoder</div>
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
import ThemeToggle from './ThemeToggle.vue'

const mobileSidebarStore = useMobileSidebarStore()
const searchStore = useSearchStore()

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
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateHeader)
})
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, rgba(56, 161, 219, 0.6) 0%, rgba(237, 110, 160, 0.55) 100%);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 32px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(56, 161, 219, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  /* 动画过渡 */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
  opacity: 1;
}

/* 暗色主题下的Header */
html.dark-theme .header {
  background: linear-gradient(135deg, rgba(44, 49, 60, 0.95) 0%, rgba(62, 68, 81, 0.9) 100%);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

html.dark-theme .header-in-banner {
  background: transparent;
}

/* 导航栏隐藏状态 */
.header:not(.header-visible) {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

/* 在banner区域时的样式 */
.header-in-banner {
  background: transparent;
  backdrop-filter: none;
  border-bottom: none;
  box-shadow: none;
}

/* 移动端Header样式 */
.mobile-header {
  display: none;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.mobile-title {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 1px 4px rgba(0, 0, 0, 0.3);
}

.mobile-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hamburger-line {
  width: 24px;
  height: 3px;
  background: #ffffff;
  border-radius: 2px;
  transition: all 0.3s ease;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 1px 4px rgba(0, 0, 0, 0.3);
}

.mobile-menu-btn:hover .hamburger-line {
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.4);
}

.nav {
  display: flex;
  gap: 32px;
  justify-content: flex-start;
  align-items: center;
  margin-left: 120px;
}

.nav a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  /* 确保文字水平排列 */
  white-space: nowrap;
  /* 防止下划线超出 */
  position: relative;
  overflow: hidden;
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 1px 4px rgba(0, 0, 0, 0.3);
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  text-shadow:
    0 3px 12px rgba(0, 0, 0, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.4);
}

.nav a.router-link-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  text-shadow:
    0 3px 12px rgba(0, 0, 0, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.4);
}

.nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0.8));
  border-radius: 1px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav i {
  font-size: 16px;
}

/* 搜索按钮样式 */
.search-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px 12px;
  margin-left: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 1px 4px rgba(0, 0, 0, 0.3);
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.search-text {
  font-size: 14px;
}

.search-shortcut {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 4px;
}

/* 移动端搜索按钮 */
.mobile-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn-mobile {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn-mobile:hover {
  background: rgba(255, 255, 255, 0.2);
}

.search-btn-mobile i {
  font-size: 18px;
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 1px 4px rgba(0, 0, 0, 0.3);
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .header {
    padding: 0 24px;
    background: linear-gradient(135deg, rgba(56, 161, 219, 0.65) 0%, rgba(237, 110, 160, 0.6) 100%);
  }

  .nav {
    gap: 24px;
    margin-left: 80px;
  }

  .nav a {
    padding: 6px 10px;
    font-size: 0.95em;
  }

  .nav i {
    font-size: 15px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    height: 48px;
  }

  /* 隐藏PC端导航，显示移动端Header */
  .nav {
    display: none;
  }

  .mobile-header {
    display: flex;
  }

  .mobile-title {
    font-size: 1.1rem;
  }

  .hamburger-line {
    width: 22px;
    height: 2.5px;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .header {
    padding: 0 12px;
    height: 44px;
  }

  .mobile-title {
    font-size: 1rem;
  }

  .hamburger-line {
    width: 20px;
    height: 2px;
  }

  .mobile-menu-btn {
    padding: 6px;
  }
}
</style>
