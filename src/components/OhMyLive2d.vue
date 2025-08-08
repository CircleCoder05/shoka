<template>
  <div class="oml2d-container">
    <!-- OhMyLive2d 会在这里渲染 -->
  </div>
</template>

<script>
import oml2dConfig from '../config/oml2d.js'

export default {
  name: 'OhMyLive2d',
  props: {
    // 配置选项
    enable: {
      type: Boolean,
      default: oml2dConfig.enable,
    },
    option: {
      type: Object,
      default: () => oml2dConfig.option,
    },
  },
  data() {
    return {
      oml2dLoaded: false,
      oml2dInstance: null,
    }
  },
  mounted() {
    if (this.enable) {
      // 等待页面完全加载后再初始化
      if (document.readyState === 'complete') {
        this.loadOhMyLive2d()
      } else {
        window.addEventListener('load', () => {
          this.loadOhMyLive2d()
        })
      }
    }
  },
  methods: {
    loadOhMyLive2d() {
      // 检查是否已经加载过
      if (window.OML2D) {
        this.initOhMyLive2d()
        return
      }

      // 等待OML2D函数可用
      this.waitForOhMyLive2d()
    },

    waitForOhMyLive2d() {
      console.log('Waiting for OML2D to load...')
      console.log('window.OML2D:', window.OML2D)

      const checkInterval = setInterval(() => {
        console.log('Checking for window.OML2D...')
        if (window.OML2D) {
          clearInterval(checkInterval)
          console.log('OML2D found!')
          this.initOhMyLive2d()
        }
      }, 500)

      // 超时处理
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.OML2D) {
          console.error('OML2D failed to load within timeout')
          console.error('Available window properties:', Object.keys(window))
        }
      }, 15000)
    },

    initOhMyLive2d() {
      if (this.oml2dLoaded) return

      try {
        // 使用官方API初始化OhMyLive2d
        this.oml2dInstance = window.OML2D.loadOml2d(this.option)
        this.oml2dLoaded = true
        console.log('OhMyLive2d initialized successfully')

        // 监听事件
        if (this.oml2dInstance && this.oml2dInstance.onStageSlideIn) {
          this.oml2dInstance.onStageSlideIn(() => {
            console.log('OhMyLive2d stage slide in')
          })
        }
      } catch (error) {
        console.error('Failed to initialize OhMyLive2d:', error)
      }
    },

    // 提供一些公共方法
    switchModel(modelIndex) {
      if (this.oml2dInstance) {
        this.oml2dInstance.switchModel(modelIndex)
      }
    },

    showTips(message, duration = 3000) {
      if (this.oml2dInstance) {
        this.oml2dInstance.tipsMessage(message, duration)
      }
    },
  },

  beforeUnmount() {
    // 清理工作
    if (this.oml2dInstance) {
      // 可以在这里添加清理逻辑
    }
  },
}
</script>

<style scoped>
.oml2d-container {
  /* 容器样式，OhMyLive2d 会自己定位 */
  position: relative;
  z-index: 1000;
}
</style>
