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
  background: linear-gradient(135deg, rgba(56, 161, 219, 0.6) 0%, rgba(237, 110, 160, 0.55) 100%);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 32px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(56, 161, 219, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.nav {
  display: flex;
  gap: 32px;
  justify-content: flex-start;
  align-items: center;
  margin-left: 120px;
}

.nav a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  /* 确保文字水平排列 */
  white-space: nowrap;
  /* 防止下划线超出 */
  position: relative;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nav a.router-link-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0.8));
  border-radius: 1px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav i {
  font-size: 16px;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .header {
    padding: 0 24px;
    background: linear-gradient(135deg, rgba(56, 161, 219, 0.65) 0%, rgba(237, 110, 160, 0.6) 100%);
  }

  .nav {
    gap: 24px;
    margin-left: 80px;
  }

  .nav a {
    padding: 6px 10px;
    font-size: 0.95em;
  }

  .nav i {
    font-size: 15px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    height: 48px;
    background: linear-gradient(135deg, rgba(56, 161, 219, 0.7) 0%, rgba(237, 110, 160, 0.65) 100%);
  }

  .nav {
    gap: 16px;
    margin-left: 0;
    justify-content: center;
    flex-wrap: wrap;
  }

  .nav a {
    padding: 4px 8px;
    font-size: 0.9em;
    gap: 4px;
  }

  .nav i {
    font-size: 14px;
  }

  .nav a span {
    display: none;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .header {
    padding: 0 12px;
    height: 44px;
  }

  .nav {
    gap: 12px;
  }

  .nav a {
    padding: 3px 6px;
    font-size: 0.85em;
  }

  .nav i {
    font-size: 13px;
  }
}
</style>
