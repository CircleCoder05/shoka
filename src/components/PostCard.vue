<template>
  <article class="post-card">
    <div class="cover" v-if="post.cover">
      <router-link :to="`/post/${post.slug}`">
        <img :src="post.cover" :alt="post.title" />
      </router-link>
    </div>
    <div class="info">
      <div class="meta">
        <span class="item"><i class="ic i-calendar"></i> {{ post.date }}</span>
        <span class="item"><i class="ic i-pen"></i> {{ post.length }} 字</span>
        <span class="item"><i class="ic i-clock"></i> {{ post.readingTime }} 分钟</span>
      </div>
      <h3>
        <router-link :to="`/post/${post.slug}`">{{ post.title }}</router-link>
      </h3>
      <div class="excerpt">{{ post.excerpt }}</div>
      <div class="meta footer">
        <router-link :to="`/categories/${post.category}`"
          ><i class="ic i-flag"></i>{{ post.categoryTitle }}</router-link
        >
      </div>
      <router-link :to="`/post/${post.slug}`" class="btn">more...</router-link>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  post: Object,
})
</script>

<style scoped>
.post-card {
  display: flex;
  background: #fafbfc;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.cover {
  width: 160px;
  flex-shrink: 0;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px 0 0 8px;
}
.info {
  flex: 1;
  padding: 16px;
}
.meta {
  color: #888;
  font-size: 13px;
  margin-bottom: 4px;
}
.meta .item {
  margin-right: 12px;
}
h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}
.excerpt {
  color: #555;
  font-size: 15px;
  margin-bottom: 8px;
}
.meta.footer {
  margin-top: 8px;
}
.btn {
  display: inline-block;
  margin-top: 8px;
  color: #409eff;
  text-decoration: underline;
  font-size: 14px;
}
</style>
