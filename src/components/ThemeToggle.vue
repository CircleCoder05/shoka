<template>
  <button
    @click="themeStore.toggleDark()"
    class="theme-toggle-btn"
    :title="`切换到${themeStore.isDark ? '亮色' : '暗色'}模式`"
  >
    <i :class="themeStore.isDark ? 'ic i-sun' : 'ic i-moon'"></i>
    <span class="theme-text">{{ themeStore.isDark ? '亮色' : '暗色' }}</span>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 1px 4px rgba(0, 0, 0, 0.3);
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.theme-text {
  font-weight: 500;
  white-space: nowrap;
}

/* 图标样式 */
.ic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.i-sun::before {
  content: '☀️';
}
.i-moon::before {
  content: '🌙';
}

/* 移动端适配 */
@media (max-width: 768px) {
  .theme-toggle-btn {
    padding: 6px 10px;
    font-size: 13px;
  }

  .theme-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .theme-toggle-btn {
    padding: 6px;
    min-width: 32px;
    justify-content: center;
  }
}
</style>
