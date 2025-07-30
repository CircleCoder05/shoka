<template>
  <section class="category-card">
    <div class="cover" :style="{ backgroundImage: `url(${category.cover})` }">
      <h2 class="title">{{ category.title }}</h2>
    </div>
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
  </section>
</template>

<script setup>
const props = defineProps({
  category: Object,
})
</script>

<style scoped>
.category-card {
  display: flex;
  background: #fafbfc;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.cover {
  width: 160px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.title {
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  padding: 8px 16px;
  border-radius: 0 0 8px 8px;
  font-size: 20px;
}
.info {
  flex: 1;
  padding: 16px;
}
.ribbon {
  font-weight: bold;
  margin-bottom: 8px;
}
.inner {
  font-size: 15px;
}
.meta.footer {
  margin-top: 8px;
  color: #888;
}
.btn {
  display: inline-block;
  margin-top: 8px;
  color: #409eff;
  text-decoration: underline;
  font-size: 14px;
}
</style>
