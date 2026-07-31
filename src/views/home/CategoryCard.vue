<template>
  <section class="category-card" @mouseenter="active = true" @mouseleave="active = false">
    <div class="card-inner" :class="{ active }">
      <!-- 正面 -->
      <div class="card-front" :style="{ backgroundImage: `url(${bgUrl})` }">
        <span class="title">{{ category.title }}</span>
      </div>
      <!-- 背面 -->
      <div class="card-back">
        <div class="ribbon">
          <router-link :to="`/category/${category.name}`">{{ category.title }}</router-link>
        </div>
        <div class="inner">
          <div class="posts-container">
            <ul class="posts">
              <li v-for="post in category.posts.slice(0, 8)" :key="post.slug">
                <router-link :to="`/post/${post.slug}`">{{ post.title }}</router-link>
              </li>
            </ul>
          </div>
          <div class="meta-footer">
            <span class="count">
              <i class="fas fa-file-alt"></i> {{ category.posts.length }} 篇文章
            </span>
            <router-link :to="`/category/${category.name}`" class="btn">more...</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ category: Object })
const active = ref(false)
const defaultCover = '/default-cover.jpg'
const bgUrl = computed(() => props.category.cover_url || defaultCover)
</script>

<style scoped lang="scss" src="@/styles/sfc/views/home/CategoryCard.scss"></style>
