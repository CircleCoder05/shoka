<template>
  <div class="page-container">
    <slot />
  </div>
</template>

<script setup>
// 通用页面容器组件
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 1050px !important;
  background: #fff;
  border-radius: 0;
  box-shadow:
    0 8px 48px 0 rgba(237, 110, 160, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin: 0;
  overflow: visible;
  box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 0.75rem;
  }
}
</style>
