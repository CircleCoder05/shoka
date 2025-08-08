<template>
  <div class="oml2d-container">
    <!-- OhMyLive2d 会在这里渲染 -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOml2dStore } from '../stores/oml2d'

const oml2dStore = useOml2dStore()

onMounted(() => {
  // 等待页面完全加载后再初始化
  if (document.readyState === 'complete') {
    oml2dStore.initOml2d()
  } else {
    window.addEventListener('load', () => {
      oml2dStore.initOml2d()
    })
  }
})
</script>

<style scoped>
.oml2d-container {
  /* 容器样式，OhMyLive2d 会自己定位 */
  position: relative;
  z-index: 1000;
}
</style>
