import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const isDark = ref(false)
  const themeMode = ref('light') // 'light', 'dark'

  // 计算属性
  const themeClass = computed(() => {
    return isDark.value ? 'dark-theme' : 'light-theme'
  })

  // 从localStorage加载主题设置
  const loadThemeFromStorage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('blog-theme-mode')
      if (saved && ['light', 'dark'].includes(saved)) {
        themeMode.value = saved
        isDark.value = saved === 'dark'
        console.log('📱 加载保存的主题设置:', saved)
      }
    }
  }

  // 保存主题设置到localStorage
  const saveThemeToStorage = (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blog-theme-mode', theme)
      console.log('💾 保存主题设置:', theme)
    }
  }

  // 应用主题到DOM
  const applyTheme = (theme) => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement

      // 移除所有主题类
      html.classList.remove('light-theme', 'dark-theme')

      // 添加当前主题类
      html.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme')

      console.log('🎨 应用主题:', theme)
    }
  }

  // 切换暗色模式
  const toggleDark = () => {
    const newMode = isDark.value ? 'light' : 'dark'
    themeMode.value = newMode
    isDark.value = newMode === 'dark'
    saveThemeToStorage(newMode)
    applyTheme(newMode)
  }

  // 设置主题模式
  const setThemeMode = (mode) => {
    themeMode.value = mode
    isDark.value = mode === 'dark'
    saveThemeToStorage(mode)
    applyTheme(mode)
  }

  // 初始化
  const init = () => {
    loadThemeFromStorage()
    applyTheme(themeMode.value)
  }

  return {
    // 状态
    isDark,
    themeMode,

    // 计算属性
    themeClass,

    // 方法
    init,
    toggleDark,
    setThemeMode,
  }
})
