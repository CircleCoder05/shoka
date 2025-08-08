<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Sidebar from './components/Sidebar.vue'
import Banner from './components/Banner.vue'
import OhMyLive2d from './components/OhMyLive2d.vue'
import { useBannerStore } from './stores/banner'

const bannerStore = useBannerStore()
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <Header class="floating-header" />

    <!-- Banner区域 -->
    <Banner v-bind="bannerStore.bannerProps" />

    <!-- 主布局区域 -->
    <div class="app-main-layout">
      <!-- 侧边栏父盒子 -->
      <div class="app-sidebar-wrapper">
        <!-- 侧边栏 -->
        <Sidebar class="app-sidebar" />
      </div>
      <!-- 主内容父盒子 -->
      <div class="app-content-wrapper">
        <!-- 路由主内容区域 -->
        <main class="app-main-content">
          <router-view />
        </main>

        <!-- 页脚 -->
        <Footer />
      </div>
    </div>

    <!-- OhMyLive2d -->
    <OhMyLive2d />
  </div>
</template>

<style>
/* 全局布局样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 - 已移至Header组件内部 */

/* 主布局样式 */
.app-main-layout {
  display: flex;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 20px;
  gap: 32px;
  flex: 1;
  min-height: calc(100vh - 66vh);
  box-sizing: border-box;
}

.app-sidebar-wrapper {
  flex: 0 0 400px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.app-sidebar {
  width: 280px;
  margin-top: -16px;
  min-width: 220px;
}

.app-content-wrapper {
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 66vh - 56px);
  margin-left: 0;
}

.app-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  min-height: calc(100vh - 66vh - 80px);
  width: 100%;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .app-main-layout {
    padding: 0 16px;
    gap: 24px;
  }

  .app-sidebar-wrapper {
    flex: 0 0 320px;
  }

  .app-sidebar {
    width: 240px;
    margin-top: -12px;
    min-width: 200px;
  }

  .app-content-wrapper {
    margin-left: 0;
  }

  .app-main-content {
    padding: 0;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-main-layout {
    flex-direction: column;
    padding: 0 12px;
    gap: 16px;
    min-height: calc(100vh - 50vh);
  }

  .app-sidebar-wrapper {
    /* 移动端使用absolute定位，不占空间 */
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    overflow: visible;
    z-index: 1000;
  }

  .app-sidebar {
    /* 移动端隐藏原来的侧边栏样式 */
    display: none;
  }

  .app-content-wrapper {
    width: 100%;
    min-height: calc(100vh - 50vh - 48px - 200px);
  }

  .app-main-content {
    width: 100%;
    padding: 24px 0;
    min-height: calc(100vh - 50vh - 48px - 200px - 80px);
  }

  .floating-header {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .app-main-layout {
    padding: 0 8px;
    min-height: calc(100vh - 40vh - 44px);
  }

  .app-sidebar-wrapper {
    justify-content: center;
  }

  .app-content-wrapper {
    min-height: calc(100vh - 40vh - 44px - 200px);
  }

  .app-main-content {
    padding: 20px 0;
    min-height: calc(100vh - 40vh - 44px - 200px - 80px);
  }

  .floating-header {
    background: rgba(255, 255, 255, 0.95);
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .floating-header {
    background: rgba(255, 255, 255, 0.95);
  }
}
</style>
