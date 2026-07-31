<template>
  <nav class="pagination">
    <!-- 上一页按钮 -->
    <button
      v-if="currentPage > 1"
      @click="$emit('update:currentPage', currentPage - 1)"
      class="nav-btn"
    >
      &lt;
    </button>

    <!-- 页码按钮 -->
    <template v-for="(item, index) in visiblePages" :key="index">
      <!-- 省略号 -->
      <span v-if="item === '...'" class="ellipsis">...</span>
      <!-- 页码按钮 -->
      <button
        v-else
        :class="{ active: item === currentPage }"
        @click="$emit('update:currentPage', item)"
      >
        {{ item }}
      </button>
    </template>

    <!-- 下一页按钮 -->
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
import { computed } from 'vue'

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
})

// 计算可见的页码
const visiblePages = computed(() => {
  const pages = []
  const current = props.currentPage
  const total = props.totalPages

  if (total <= 5) {
    // 总页数少于等于5页，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于5页，智能显示
    if (current <= 3) {
      // 当前页在前3页
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      // 当前页在后3页
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      // 当前页在中间
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }

  return pages
})
</script>

<style scoped lang="scss" src="@/styles/sfc/views/home/Pagination.scss"></style>
