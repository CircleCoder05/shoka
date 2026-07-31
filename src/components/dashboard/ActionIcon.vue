<template>
  <svg v-if="name === 'edit'" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13.5 6.5 17.5 10.5M4 20l4.1-.8L19 8.3a2.8 2.8 0 0 0-4-4L4.8 14.6 4 20Z" />
  </svg>
  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: 'delete',
  },
})
</script>
