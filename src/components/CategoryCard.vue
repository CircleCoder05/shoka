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

<style scoped>
/* 样式保持原样 */
.category-card {
  perspective: 1200px;
  width: 100%;
  max-width: 100%;
  height: 220px;
  background: transparent;
  position: relative;
  box-shadow: none;
  overflow: visible;
  margin-bottom: 0;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 2s cubic-bezier(0.4, 2, 0.6, 1);
  transform-style: preserve-3d;
}

.card-inner.active {
  transform: rotateY(-180deg);
}

.category-card:nth-child(2n) .card-inner.active {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-front {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-front .title {
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  letter-spacing: 2px;
  text-align: center;
  padding: 0 12px;
  background: none;
}

.card-back {
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  transform: rotateY(-180deg);
  padding: 0;
  position: relative;
}

.category-card:nth-child(2n) .card-back {
  transform: rotateY(180deg);
}

.ribbon {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  padding: 8px 16px;
  border-radius: 0 0 8px 0;
  z-index: 2;
}

.ribbon a {
  color: #fff;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.9rem;
}

.inner {
  width: 100%;
  height: 100%;
  padding: 40px 12px 0 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.posts-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  width: 100%;
  padding-left: 8px;
}

.posts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(4, auto);
  gap: 6px 12px;
  max-height: 120px;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.posts li {
  margin: 0;
  padding: 0;
  min-width: 0;
}

.posts a {
  color: #ed6ea0;
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.3;
  display: block;
  padding: 2px 4px;
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  box-sizing: border-box;
}

.posts a:hover {
  color: #25c9f7;
}

.meta-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0 0 0;
  margin-bottom: 0;
  min-height: 40px;
}

.count {
  color: #666;
  font-size: 0.85rem;
  padding-left: 16px;
  display: flex;
  align-items: center;
}

.count i {
  margin-right: 4px;
}

.btn {
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  color: #fff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px 0 8px 0;
  font-size: 0.8rem;
  font-weight: bold;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.2);
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(237, 110, 160, 0.3);
}

/* 响应式适配 */

/* 大屏幕适配 (1200px+) */
@media (min-width: 1200px) {
  .category-card {
    height: 240px;
  }

  .card-front .title {
    font-size: 1.6rem;
  }

  .posts {
    gap: 8px 16px;
  }

  .posts a {
    font-size: 0.95rem;
  }
}

/* 中等屏幕适配 (768px - 1199px) */
@media (max-width: 1199px) and (min-width: 768px) {
  .category-card {
    height: 220px;
  }

  .card-front .title {
    font-size: 1.4rem;
  }

  .posts {
    gap: 6px 12px;
  }

  .posts a {
    font-size: 0.85rem;
  }
}

/* 平板端适配 (768px - 1023px) */
@media (max-width: 1023px) and (min-width: 768px) {
  .category-card {
    height: 200px;
  }

  .card-front .title {
    font-size: 1.3rem;
    letter-spacing: 1px;
  }

  .inner {
    padding: 35px 10px 0 10px;
  }

  .posts {
    gap: 5px 10px;
    max-height: 100px;
  }

  .posts a {
    font-size: 0.8rem;
  }

  .ribbon {
    padding: 6px 12px;
  }

  .ribbon a {
    font-size: 0.8rem;
  }
}

/* 移动端适配 (480px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .category-card {
    height: 180px;
  }

  .card-front .title {
    font-size: 1.2rem;
    letter-spacing: 1px;
    padding: 0 8px;
  }

  .inner {
    padding: 30px 8px 0 8px;
  }

  .posts-container {
    padding-left: 6px;
  }

  .posts {
    grid-template-columns: 1fr;
    gap: 4px 8px;
    max-height: 90px;
  }

  .posts a {
    font-size: 0.75rem;
    padding: 1px 3px;
  }

  .ribbon {
    padding: 5px 10px;
  }

  .ribbon a {
    font-size: 0.75rem;
  }

  .count {
    font-size: 0.8rem;
    padding-left: 12px;
  }

  .btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }
}

/* 小屏手机适配 (480px以下) */
@media (max-width: 480px) {
  .category-card {
    height: 160px;
  }

  .card-front .title {
    font-size: 1.1rem;
    letter-spacing: 0.5px;
    padding: 0 6px;
  }

  .inner {
    padding: 25px 6px 0 6px;
  }

  .posts-container {
    padding-left: 4px;
  }

  .posts {
    grid-template-columns: 1fr;
    gap: 3px 6px;
    max-height: 80px;
  }

  .posts a {
    font-size: 0.7rem;
    padding: 1px 2px;
  }

  .ribbon {
    padding: 4px 8px;
  }

  .ribbon a {
    font-size: 0.7rem;
  }

  .count {
    font-size: 0.75rem;
    padding-left: 8px;
  }

  .btn {
    padding: 5px 10px;
    font-size: 0.7rem;
  }

  .meta-footer {
    margin-top: 12px;
    min-height: 35px;
  }
}

/* 超小屏适配 (360px以下) */
@media (max-width: 360px) {
  .category-card {
    height: 140px;
  }

  .card-front .title {
    font-size: 1rem;
    letter-spacing: 0.5px;
    padding: 0 4px;
  }

  .inner {
    padding: 20px 4px 0 4px;
  }

  .posts-container {
    padding-left: 2px;
  }

  .posts {
    grid-template-columns: 1fr;
    gap: 2px 4px;
    max-height: 70px;
  }

  .posts a {
    font-size: 0.65rem;
    padding: 1px 1px;
  }

  .ribbon {
    padding: 3px 6px;
  }

  .ribbon a {
    font-size: 0.65rem;
  }

  .count {
    font-size: 0.7rem;
    padding-left: 6px;
  }

  .btn {
    padding: 4px 8px;
    font-size: 0.65rem;
  }

  .meta-footer {
    margin-top: 8px;
    min-height: 30px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .card-inner {
    transition: transform 1.5s cubic-bezier(0.4, 2, 0.6, 1);
  }

  .btn:hover {
    transform: none;
  }
}
</style>
