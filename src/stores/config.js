import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useBlogStore } from './blog'

export const useConfigStore = defineStore('config', () => {
  const config = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 加载配置
  const loadConfig = async () => {
    if (config.value) return config.value

    loading.value = true
    error.value = null

    try {
      const blogStore = useBlogStore()
      const data = await blogStore.load()
      const blog = data.blog
      config.value = {
        site: {
          bannerTitle: blog.title, bannerSubtitle: blog.subtitle, description: blog.description,
          author: blog.author, avatar: blog.avatar_url, motto: blog.motto,
          ...(blog.settings || {}),
        },
        footer: blog.footer || {},
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to load config:', err)
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const siteConfig = computed(() => config.value?.site || {})
  const colors = computed(() => siteConfig.value.colors || {})
  const fonts = computed(() => siteConfig.value.fonts || {})
  const footer = computed(() => config.value?.footer || {})

  return {
    config,
    loading,
    error,
    siteConfig,
    colors,
    fonts,
    footer,
    loadConfig,
  }
})
