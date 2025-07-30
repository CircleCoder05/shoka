<template>
  <header class="header">
    <nav class="nav">
      <router-link to="/"> <i class="ic i-home"></i>首页 </router-link>
      <router-link to="/archives"> <i class="ic i-archive"></i>归档 </router-link>
      <router-link to="/categories"> <i class="ic i-th"></i>分类 </router-link>
      <router-link to="/tags"> <i class="ic i-tags"></i>标签 </router-link>
      <router-link to="/about"> <i class="ic i-user"></i>关于 </router-link>
      <router-link to="/friends"> <i class="ic i-heart"></i>友链 </router-link>
      <router-link to="/statistics"> <i class="ic i-clock"></i>统计 </router-link>
    </nav>
  </header>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid #eee;
  padding: 0 32px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.04);
  backdrop-filter: blur(8px);
}

.nav {
  display: flex;
  gap: 32px;
  justify-content: flex-start;
  align-items: center;
  margin-left: 120px;
}

.nav a {
  color: #222;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  /* 确保文字水平排列 */
  white-space: nowrap;
  /* 防止下划线超出 */
  position: relative;
  overflow: hidden;
}

.nav a:hover {
  background: rgba(237, 110, 160, 0.1);
  color: #ed6ea0;
}

.nav a.router-link-active {
  color: #ed6ea0;
  background: rgba(237, 110, 160, 0.1);
}

.nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: #ed6ea0;
  border-radius: 1px;
}

.nav i {
  font-size: 16px;
}
</style>
