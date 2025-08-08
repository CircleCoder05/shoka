import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useOml2dStore = defineStore('oml2d', () => {
  // 状态
  const isEnabled = ref(true)
  const isLoaded = ref(false)
  const oml2dInstance = ref(null)
  const config = reactive({
    enable: true,
    option: {
      dockedPosition: 'left',
      mobileDisplay: true,
      models: [],
      parentElement: document.body,
      primaryColor: '#38B0DE',
      sayHello: false,
      tips: {
        style: {
          width: 230,
          height: 120,
          left: 'calc(50%)',
          top: '-100px',
        },
        mobileStyle: {
          width: 180,
          height: 80,
          left: 'calc(50% - 30px)',
          top: '-100px',
        },
        idleTips: {
          enable: true,
          interval: 15000,
          message: ['你好呀~', '欢迎来到我的小站~', '今天也要加油哦！', '有什么想聊的吗？'],
        },
      },
    },
  })

  // 加载配置文件
  const loadConfig = async () => {
    try {
      const response = await fetch('/oml2d-config.json')
      const jsonConfig = await response.json()

      // 合并配置
      Object.assign(config, jsonConfig)

      // 处理parentElement
      if (config.option.parentElement === 'document.body') {
        config.option.parentElement = document.body
      }

      // 处理提示消息配置
      if (config.option.tips && config.option.tips.idleTips) {
        if (config.option.tips.idleTips.enable === false) {
          // 如果禁用提示，清空消息数组
          config.option.tips.idleTips.message = []
          console.log('Tips disabled by config')
        }
      }

      console.log('OML2D config loaded:', config)
      return config
    } catch (error) {
      console.error('Failed to load OML2D config:', error)
      return config
    }
  }

  // 初始化OhMyLive2d
  const initOml2d = async () => {
    if (!isEnabled.value || isLoaded.value) return

    try {
      // 等待OML2D库加载
      await waitForOml2d()

      // 加载配置
      await loadConfig()

      // 初始化实例
      if (window.OML2D) {
        oml2dInstance.value = window.OML2D.loadOml2d(config.option)
        isLoaded.value = true
        console.log('OhMyLive2d initialized successfully')

        // 监听事件
        if (oml2dInstance.value && oml2dInstance.value.onStageSlideIn) {
          oml2dInstance.value.onStageSlideIn(() => {
            console.log('OhMyLive2d stage slide in')
          })
        }
      }
    } catch (error) {
      console.error('Failed to initialize OhMyLive2d:', error)
    }
  }

  // 等待OML2D库加载
  const waitForOml2d = () => {
    return new Promise((resolve, reject) => {
      if (window.OML2D) {
        resolve()
        return
      }

      const checkInterval = setInterval(() => {
        if (window.OML2D) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      // 超时处理
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.OML2D) {
          reject(new Error('OML2D failed to load within timeout'))
        }
      }, 15000)
    })
  }

  // 切换启用状态
  const toggleEnabled = () => {
    isEnabled.value = !isEnabled.value

    if (isEnabled.value) {
      initOml2d()
    } else {
      // 可以在这里添加清理逻辑
      isLoaded.value = false
      oml2dInstance.value = null
    }
  }

  // 切换模型
  const switchModel = (modelIndex) => {
    if (oml2dInstance.value && oml2dInstance.value.switchModel) {
      oml2dInstance.value.switchModel(modelIndex)
    }
  }

  // 显示提示
  const showTips = (message, duration = 3000) => {
    if (oml2dInstance.value && oml2dInstance.value.tipsMessage) {
      oml2dInstance.value.tipsMessage(message, duration)
    }
  }

  // 更新配置
  const updateConfig = (newConfig) => {
    Object.assign(config, newConfig)
  }

  return {
    // 状态
    isEnabled,
    isLoaded,
    oml2dInstance,
    config,

    // 方法
    loadConfig,
    initOml2d,
    toggleEnabled,
    switchModel,
    showTips,
    updateConfig,
  }
})
