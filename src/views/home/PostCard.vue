<template>
  <article class="post-card">
    <div class="cover">
      <a :href="post.url" :title="post.title">
        <img :src="coverSrc" :alt="post.title" @error="useFallbackCover" />
      </a>
    </div>
    <div class="info">
      <div class="info-content">
        <div class="meta">
          <span class="item" :title="`创建时间：${post.date}`">
            <span class="icon"><i class="ic i-calendar"></i></span>
            <time :datetime="post.date">{{ post.date }}</time>
          </span>
          <span class="item" title="本文字数">
            <span class="icon"><i class="ic i-pen"></i></span>
            <span>{{ post.wordCount }}</span>
            <span class="text">字</span>
          </span>
          <span class="item" title="阅读时长">
            <span class="icon"><i class="ic i-clock"></i></span>
            <span>{{ post.readTime }} 分钟</span>
          </span>
        </div>
        <h3>
          <a :href="post.url" :title="post.title">{{ post.title }}</a>
        </h3>
        <div class="excerpt">{{ post.excerpt }}</div>
      </div>
      <div class="info-footer">
        <router-link :to="`/category/${post.category.name}`" :title="post.category.name">
          <i class="ic i-flag"></i>{{ post.category.name }}
        </router-link>
        <router-link :to="post.url" :title="post.title" class="btn">more...</router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const fallbackCover = '/default-cover.jpg'
const coverSrc = computed(() => props.post.cover || fallbackCover)

function useFallbackCover(event) {
  if (event.target.getAttribute('src') !== fallbackCover) {
    event.target.src = fallbackCover
  }
}
</script>

<style scoped lang="scss" src="@/styles/sfc/views/home/PostCard.scss"></style>
