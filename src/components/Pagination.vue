<template>
  <nav class="pagination">
    <button :disabled="currentPage === 1" @click="$emit('update:currentPage', currentPage - 1)">
      上一页
    </button>
    <span v-for="page in totalPages" :key="page">
      <button :class="{ active: page === currentPage }" @click="$emit('update:currentPage', page)">
        {{ page }}
      </button>
    </span>
    <button
      :disabled="currentPage === totalPages"
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      下一页
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
  margin: 32px 0 0 0;
}
button {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}
button.active {
  color: #409eff;
  border-color: #409eff;
}
button:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
