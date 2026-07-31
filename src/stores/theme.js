import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const AVAILABLE_THEMES = Object.freeze(['light', 'dark'])
const DEFAULT_THEME = 'light'
const STORAGE_KEY = 'blog-theme-mode'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const isDark = ref(false)
  const themeMode = ref(DEFAULT_THEME)

  // 计算属性
  const themeClass = computed(() => {
    return isDark.value ? 'dark-theme' : 'light-theme'
  })

  // 从localStorage加载主题设置
  const loadThemeFromStorage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && AVAILABLE_THEMES.includes(saved)) {
        themeMode.value = saved
        isDark.value = saved === 'dark'
        console.log('📱 加载保存的主题设置:', saved)
      }
    }
  }

  // 保存主题设置到localStorage
  const saveThemeToStorage = (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme)
      console.log('💾 保存主题设置:', theme)
    }
  }

  // 应用主题到DOM
  const applyTheme = (theme) => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement

      html.classList.remove(...AVAILABLE_THEMES.map((name) => `${name}-theme`))
      html.classList.add(`${theme}-theme`)
      html.dataset.theme = theme

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
    const nextMode = AVAILABLE_THEMES.includes(mode) ? mode : DEFAULT_THEME
    themeMode.value = nextMode
    isDark.value = nextMode === 'dark'
    saveThemeToStorage(nextMode)
    applyTheme(nextMode)
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
