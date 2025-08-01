<template>
  <nav class="pagination">
    <button
      v-if="currentPage > 1"
      @click="$emit('update:currentPage', currentPage - 1)"
      class="nav-btn"
    >
      &lt;
    </button>
    <span v-for="page in totalPages" :key="page">
      <button :class="{ active: page === currentPage }" @click="$emit('update:currentPage', page)">
        {{ page }}
      </button>
    </span>
    <button
      v-if="currentPage < totalPages"
      @click="$emit('update:currentPage', currentPage + 1)"
      class="nav-btn"
    >
      &gt;
    </button>
  </nav>
</template>

<script setup>
const props = defineProps({
  currentPage: Number,
  totalPages: Number,
})
</script>

<style scoped>
.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin: 32px 0 0 0;
  flex-wrap: wrap;
}

button {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    transform 0.2s;
  font-size: 0.9rem;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

button.active {
  color: #fff;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.3);
}

button.active:hover {
  background: linear-gradient(135deg, #e9546b 0%, #e67e5f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(237, 110, 160, 0.4);
}

button:disabled {
  color: #ccc;
  cursor: not-allowed;
  background: #f9f9f9;
}

button:disabled:hover {
  transform: none;
  background: #f9f9f9;
}

.nav-btn {
  font-weight: bold;
  font-size: 1rem;
}

/* 响应式适配 */

/* 大屏幕适配 (1200px+) */
@media (min-width: 1200px) {
  .pagination {
    gap: 10px;
    margin: 40px 0 0 0;
  }

  button {
    padding: 10px 14px;
    font-size: 1rem;
    min-width: 40px;
    height: 40px;
  }
}

/* 中等屏幕适配 (768px - 1199px) */
@media (max-width: 1199px) and (min-width: 768px) {
  .pagination {
    gap: 8px;
    margin: 36px 0 0 0;
  }

  button {
    padding: 8px 12px;
    font-size: 0.9rem;
    min-width: 36px;
    height: 36px;
  }
}

/* 平板端适配 (768px - 1023px) */
@media (max-width: 1023px) and (min-width: 768px) {
  .pagination {
    gap: 6px;
    margin: 32px 0 0 0;
  }

  button {
    padding: 7px 10px;
    font-size: 0.85rem;
    min-width: 32px;
    height: 32px;
  }
}

/* 移动端适配 (480px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .pagination {
    gap: 5px;
    margin: 28px 0 0 0;
  }

  button {
    padding: 6px 8px;
    font-size: 0.8rem;
    min-width: 28px;
    height: 28px;
  }

  .nav-btn {
    font-size: 0.9rem;
  }
}

/* 小屏手机适配 (480px以下) */
@media (max-width: 480px) {
  .pagination {
    gap: 4px;
    margin: 24px 0 0 0;
  }

  button {
    padding: 5px 6px;
    font-size: 0.75rem;
    min-width: 24px;
    height: 24px;
    border-radius: 3px;
  }

  .nav-btn {
    font-size: 0.8rem;
  }
}

/* 超小屏适配 (360px以下) */
@media (max-width: 360px) {
  .pagination {
    gap: 3px;
    margin: 20px 0 0 0;
  }

  button {
    padding: 4px 5px;
    font-size: 0.7rem;
    min-width: 20px;
    height: 20px;
    border-radius: 2px;
  }

  .nav-btn {
    font-size: 0.75rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  button:hover {
    transform: none;
    background: #fff;
  }

  button.active:hover {
    transform: none;
    background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  }

  button:active {
    transform: scale(0.95);
  }

  button.active:active {
    transform: scale(0.95);
  }
}
</style>
