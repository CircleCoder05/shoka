<template>
  <nav class="pagination">
    <button v-if="currentPage > 1" @click="$emit('update:currentPage', currentPage - 1)">
      &lt;
    </button>
    <span v-for="page in totalPages" :key="page">
      <button :class="{ active: page === currentPage }" @click="$emit('update:currentPage', page)">
        {{ page }}
      </button>
    </span>
    <button v-if="currentPage < totalPages" @click="$emit('update:currentPage', currentPage + 1)">
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
  margin: 32px 0 0 0;
}
button {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}
button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}
button:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
