<template>
  <header class="header">
    <!-- 移动端：显示CircleCoder标题和汉堡菜单 -->
    <div class="mobile-header">
      <div class="mobile-title">CircleCoder</div>
      <button class="mobile-menu-btn" @click="toggleMobileSidebar">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- PC端：显示完整导航 -->
    <nav class="nav">
      <router-link to="/"> <i class="ic i-home"></i>首页 </router-link>
      <router-link to="/archives"> <i class="ic i-archive"></i>归档 </router-link>
      <router-link to="/categories"> <i class="ic i-th"></i>分类 </router-link>
      <router-link to="/tags"> <i class="ic i-tags"></i>标签 </router-link>
      <router-link to="/about"> <i class="ic i-user"></i>关于 </router-link>
      <router-link to="/friends"> <i class="ic i-heart"></i>友链 </router-link>
      <router-link to="/statistics"> <i class="ic i-clock"></i>统计 </router-link>
    </nav>
  </header>
</template>

<script setup>
import { useMobileSidebarStore } from '@/stores/mobileSidebar'

const mobileSidebarStore = useMobileSidebarStore()

const toggleMobileSidebar = () => {
  mobileSidebarStore.toggleMobileSidebar()
}
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mobile-menu-btn:hover .hamburger-line {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nav a.router-link-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
    background: linear-gradient(135deg, rgba(56, 161, 219, 0.7) 0%, rgba(237, 110, 160, 0.65) 100%);
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
