<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <Header class="floating-header" />

    <!-- Banner区域 -->
    <div class="app-banner">
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
  </div>
</template>

<style>
/* 全局布局样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.floating-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.04);
  backdrop-filter: blur(8px);
}

/* Banner样式 */
.app-banner {
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
  margin-top: 56px;
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

/* 主布局样式 */
.app-main-layout {
  display: flex;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0 20px;
  gap: 32px;
  flex: 1;
  min-height: calc(100vh - 66vh - 56px);
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
  margin-left: 20px;
}

.app-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px 0;
  min-height: calc(100vh - 66vh - 56px - 80px);
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
    margin-left: 16px;
  }

  .app-main-content {
    padding: 32px 0;
  }

  .banner-title h1 {
    font-size: 2.4rem;
  }

  .banner-title p {
    font-size: 1.1rem;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-banner {
    height: 50vh;
    min-height: 280px;
    margin-top: 48px;
  }

  .banner-title h1 {
    font-size: 2rem;
    letter-spacing: 1px;
  }

  .banner-title p {
    font-size: 1rem;
  }

  .app-main-layout {
    flex-direction: column;
    padding: 0 12px;
    gap: 16px;
    min-height: calc(100vh - 50vh - 48px);
  }

  .app-sidebar-wrapper {
    flex: none;
    width: 100%;
    justify-content: center;
  }

  .app-sidebar {
    width: 100%;
    margin-top: 0;
    margin-bottom: 20px;
    min-width: auto;
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
  .app-banner {
    height: 40vh;
    min-height: 240px;
    margin-top: 44px;
  }

  .banner-title h1 {
    font-size: 1.8rem;
  }

  .banner-title p {
    font-size: 0.9rem;
  }

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
