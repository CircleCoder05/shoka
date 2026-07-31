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
import { ref, watch, onMounted } from 'vue'
const props = defineProps({ category: Object })
const active = ref(false)
const defaultCover = '/default-cover.jpg'
const bgUrl = ref(defaultCover)
const coverMap = ref({})

async function loadCoverMap() {
  try {
    const res = await fetch('/category-cover-map.json')
    if (res.ok) {
      coverMap.value = await res.json()
    }
  } catch {
    coverMap.value = {}
  }
}

function getDirName(name) {
  // 优先查映射表，否则用原名
  return coverMap.value[name] || name
}

function tryLoad(url, fallback) {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve(url)
    img.onerror = () => resolve(fallback)
    img.src = url
  })
}

async function setCover() {
  // 使用英文key进行目录映射
  const dir = getDirName(props.category.name)
  let url = `/posts/${dir}/cover.jpg`
  let fallback = `/posts/${dir}/cover.png`
  let result = await tryLoad(url, fallback)
  if (result === fallback) {
    // png也失败
    result = await tryLoad(fallback, defaultCover)
  }
  bgUrl.value = result
}

// 初始化加载映射表
onMounted(async () => {
  await loadCoverMap()
  setCover()
})

// 分类名变化时重新设置图片
watch(
  () => props.category.name,
  () => setCover(),
)
// 映射表加载后也要重新设置图片
watch(
  () => coverMap.value,
  () => setCover(),
)
</script>

<style scoped lang="scss" src="@/styles/sfc/views/home/CategoryCard.scss"></style>
