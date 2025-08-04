<template>
  <div class="page-container" :class="{ 'with-background': $slots.background }">
    <div v-if="$slots.background" class="background-slot">
      <slot name="background" />
    </div>
    <div class="content-slot">
      <slot />
    </div>
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
  position: relative;
}

.page-container.with-background {
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.background-slot {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.content-slot {
  position: relative;
  z-index: 2;
  padding: 2rem;
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
