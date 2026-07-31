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

<style scoped lang="scss" src="@/styles/sfc/components/PageContainer.scss"></style>
