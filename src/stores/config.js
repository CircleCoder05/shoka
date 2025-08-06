import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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
      const response = await fetch('/config.json')
      if (!response.ok) {
        throw new Error('Failed to load config')
      }
      config.value = await response.json()
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

  return {
    config,
    loading,
    error,
    siteConfig,
    colors,
    fonts,
    loadConfig,
  }
})
