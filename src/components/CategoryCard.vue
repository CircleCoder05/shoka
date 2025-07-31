<template>
  <section class="category-card" @mouseenter="active = true" @mouseleave="active = false">
    <div class="card-inner" :class="{ active }">
      <!-- 正面 -->
      <div
        class="card-front"
        :style="{
          // backgroundImage: `url(${category.cover || 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202507301820707.jpg'})`,
          backgroundImage: `url(${'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202507301820707.jpg'})`,
        }"
      >
        <span class="title">{{ category.title }}</span>
      </div>
      <!-- 背面 -->
      <div class="card-back">
        <div class="ribbon">
          <router-link :to="`/categories/${category.name}`">{{ category.title }}</router-link>
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
            <span class="count"
              ><i class="fas fa-file-alt"></i> {{ category.posts.length }} 篇文章</span
            >
            <router-link :to="`/categories/${category.name}`" class="btn">more...</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  category: Object,
})
const active = ref(false)
</script>

<style scoped>
.category-card {
  perspective: 1200px;
  width: 100%;
  max-width: 440px;
  height: 220px;
  background: transparent;
  position: relative;
  box-shadow: none;
  overflow: visible;
  margin-bottom: 26px;
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
}
.posts li {
  margin: 0;
  padding: 0;
}
.posts a {
  color: #25c9f7;
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.3;
  display: block;
  padding: 2px 4px;
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.posts a:hover {
  color: #ed6ea0;
}
.meta-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0 0 0;
  /* border-top: 1px solid #eee; */
  margin-bottom: 0;
  /* 垂直居中 */
  min-height: 40px;
}
.count {
  color: #666;
  font-size: 0.85rem;
  padding-left: 16px;
  /* 垂直居中 */
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
</style>
