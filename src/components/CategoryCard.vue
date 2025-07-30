<template>
  <section class="category-card" @mouseenter="active = true" @mouseleave="active = false">
    <div class="card-inner" :class="{ active }">
      <!-- 正面 -->
      <div class="card-front" :style="{ backgroundImage: `url(${category.cover})` }">
        <h2 class="title">{{ category.title }}</h2>
      </div>
      <!-- 背面 -->
      <div class="card-back">
        <div class="info">
          <div class="ribbon">
            <router-link :to="`/categories/${category.name}`">{{ category.title }}</router-link>
          </div>
          <div class="inner">
            <ul class="posts">
              <li v-for="post in category.posts" :key="post.slug">
                <router-link :to="`/post/${post.slug}`">{{ post.title }}</router-link>
              </li>
            </ul>
            <div class="meta footer">
              <span><i class="ic i-file"></i>{{ category.posts.length }} 篇文章</span>
            </div>
            <router-link :to="`/categories/${category.name}`" class="btn">more...</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ category: Object })
const active = ref(false)
</script>

<style scoped>
.category-card {
  perspective: 1200px;
  width: 100%;
  max-width: 400px;
  height: 260px;
  background: transparent;
  position: relative;
  box-shadow: none;
}
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 1.2s cubic-bezier(0.4, 2, 0.6, 1);
  transform-style: preserve-3d;
}
.card-inner.active {
  transform: rotateY(180deg);
}
.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* 边框 */
  border: 1px solid #e0e0e0;
}
.card-front {
  background-size: cover;
  background-position: center;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  background-repeat: no-repeat;
}
.card-front .title {
  color: #fff;
  background: rgba(237, 110, 160, 0.7);
  padding: 12px 28px;
  border-radius: 0 0 16px 16px;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.12);
}
.card-back {
  background: linear-gradient(135deg, #fff 60%, #ffe6fa 100%);
  transform: rotateY(180deg);
  z-index: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.info {
  width: 100%;
  padding: 18px 20px 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}
.ribbon {
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--color-pink);
}
.inner {
  font-size: 16px;
}
.posts {
  margin: 0 0 8px 0;
  padding: 0;
  list-style: none;
}
.posts li {
  margin-bottom: 4px;
  color: var(--color-blue);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.posts li a {
  color: var(--color-blue);
  text-decoration: none;
  transition: color 0.2s;
}
.posts li a:hover {
  color: var(--color-pink);
}
.meta.footer {
  margin-top: 8px;
  color: var(--color-grey);
  font-size: 14px;
}
.btn {
  display: inline-block;
  margin-top: 8px;
  color: #fff;
  background: linear-gradient(to right, var(--color-pink), var(--color-orange));
  border-radius: 16px 0 16px 0;
  padding: 4px 18px;
  font-size: 15px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.08);
  transition:
    background 0.2s,
    color 0.2s;
}
.btn:hover {
  background: linear-gradient(to right, var(--color-orange), var(--color-pink));
  color: #fff;
}
</style>
