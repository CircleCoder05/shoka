<script setup>
import { onMounted, watch } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Sidebar from './components/Sidebar.vue'
import Banner from './components/Banner.vue'
import OhMyLive2d from './components/OhMyLive2d.vue'
import SearchModal from './components/SearchModal.vue'
import { useBannerStore } from './stores/banner'
import { useThemeStore } from './stores/theme'
import { useConfigStore } from './stores/config'

const bannerStore = useBannerStore()
const themeStore = useThemeStore()
const configStore = useConfigStore()

const systemBanners = ['/default-cover.jpg','/system-banners/web.jpg','/system-banners/os.jpg','/system-banners/oo.jpg','/system-banners/co.jpg']

function applyBannerConfig(config) {
  const site = config?.site || {}
  bannerStore.siteTitle = site.bannerTitle || bannerStore.siteTitle
  bannerStore.siteSubtitle = site.typewriter_text?.length ? site.typewriter_text : (site.bannerSubtitle || bannerStore.siteSubtitle)
  const appearance = site.appearance || {}
  const configuredBanners = Array.isArray(appearance.banners)
    ? appearance.banners.filter(Boolean)
    : []
  const legacyBanner = appearance.banner_url || appearance.background_url
  const candidates = configuredBanners.length
    ? configuredBanners
    : (legacyBanner ? [legacyBanner] : systemBanners)
  bannerStore.bannerImage = candidates[Math.floor(Math.random() * candidates.length)] || legacyBanner || bannerStore.bannerImage
}

watch(() => configStore.config, applyBannerConfig)

// 初始化主题系统
onMounted(async () => {
  themeStore.init()
  applyBannerConfig(await configStore.loadConfig())
})
</script>

<template>
  <div id="app">
    <router-view v-if="$route.meta.plainLayout" />
    <template v-else>
    <!-- 导航栏 -->
    <Header class="floating-header" />

    <!-- Banner区域 -->
    <Banner v-bind="bannerStore.bannerProps" />

    <!-- 主布局区域 -->
    <div class="app-main-layout">
      <!-- 侧边栏父盒子 -->
      <div class="app-sidebar-wrapper">
        <!-- 侧边栏 -->
        <Sidebar />
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

    <!-- 搜索模态框 -->
    <SearchModal />
    </template>
  </div>
</template>

<style lang="scss" src="@/styles/sfc/App.scss"></style>
