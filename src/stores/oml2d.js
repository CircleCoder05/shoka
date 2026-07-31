import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

const defaultConfig = {
  enable: true,
  option: {
    dockedPosition: 'left',
    mobileDisplay: true,
    models: [],
    parentElement: 'document.body',
    primaryColor: '#ed6ea0',
    sayHello: false,
    tips: {
      style: {
        width: 240,
        minHeight: 84,
        left: '50%',
        top: '-168px',
      },
      mobileStyle: {
        width: 190,
        minHeight: 72,
        left: '50%',
        top: '-142px',
      },
      idleTips: {
        enable: false,
        interval: 15000,
        message: ['你好呀~', '欢迎来到我的小站~', '今天也要加油哦！', '有什么想聊的吗？'],
      },
    },
  },
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge(base, override) {
  const result = { ...base }
  Object.entries(override || {}).forEach(([key, value]) => {
    result[key] = isPlainObject(value) && isPlainObject(base?.[key])
      ? deepMerge(base[key], value)
      : value
  })
  return result
}

export const useOml2dStore = defineStore('oml2d', () => {
  const isEnabled = ref(true)
  const isLoaded = ref(false)
  const oml2dInstance = ref(null)
  const config = reactive(deepMerge({}, defaultConfig))
  let initializing = null

  const loadConfig = async () => {
    const response = await fetch('/oml2d-config.json')
    if (!response.ok) throw new Error('看板娘配置加载失败')

    const loaded = await response.json()
    const merged = deepMerge(defaultConfig, loaded)
    Object.assign(config, merged)
    config.option.parentElement = document.body
    return config
  }

  const show = async () => {
    if (!isEnabled.value || !oml2dInstance.value) return
    document.documentElement.classList.remove('oml2d-suspended')
    await oml2dInstance.value.stageSlideIn?.()
  }

  const suspend = async () => {
    document.documentElement.classList.add('oml2d-suspended')
    oml2dInstance.value?.clearTips?.()
    try {
      await oml2dInstance.value?.stageSlideOut?.()
    } catch {
      // CSS still keeps the injected stage hidden if its exit animation is interrupted.
    }
  }

  const initOml2d = async () => {
    if (!isEnabled.value) return
    if (isLoaded.value) {
      await show()
      return oml2dInstance.value
    }
    if (initializing) return initializing

    initializing = (async () => {
      try {
        await loadConfig()
        if (!isEnabled.value) return null

        const { loadOml2d } = await import('oh-my-live2d')
        oml2dInstance.value = loadOml2d(config.option)
        isLoaded.value = true
        await show()
        return oml2dInstance.value
      } catch (error) {
        console.error('Failed to initialize OhMyLive2d:', error)
        return null
      } finally {
        initializing = null
      }
    })()

    return initializing
  }

  const setEnabled = async (enabled, { start = true } = {}) => {
    isEnabled.value = Boolean(enabled)
    if (!isEnabled.value) {
      await suspend()
      return
    }
    // 确保无论初始化成功与否都移除隐藏状态
    document.documentElement.classList.remove('oml2d-suspended')
    if (start) await initOml2d()
  }

  const toggleEnabled = () => setEnabled(!isEnabled.value)

  const switchModel = (modelIndex) => {
    oml2dInstance.value?.loadModelByIndex?.(modelIndex)
  }

  const showTips = (message, duration = 3000) => {
    oml2dInstance.value?.tipsMessage?.(message, duration, 3)
  }

  const updateConfig = (newConfig) => {
    Object.assign(config, deepMerge(config, newConfig))
  }

  return {
    isEnabled,
    isLoaded,
    oml2dInstance,
    config,
    loadConfig,
    initOml2d,
    setEnabled,
    toggleEnabled,
    suspend,
    switchModel,
    showTips,
    updateConfig,
  }
})
