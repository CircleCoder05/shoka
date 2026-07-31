<template>
  <div
    class="post-content"
    v-html="html"
    v-code-block
    v-image-optimize
    v-media-block
  ></div>
</template>

<script setup>
defineProps({
  html: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" src="@/styles/sfc/views/articles/PostView.scss"></style>
