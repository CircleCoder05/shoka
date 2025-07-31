<template>
  <article class="post-card">
    <div class="cover">
      <a :href="post.url" :title="post.title">
        <img :src="post.cover" :alt="post.title" />
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
        <a :href="post.category.url" :title="post.category.name">
          <i class="ic i-flag"></i>{{ post.category.name }}
        </a>
        <a :href="post.url" :title="post.title" class="btn">more...</a>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.post-card {
  display: flex;
  height: 14rem;
  border-radius: 0.625rem;
  width: calc(100% - 2rem);
  min-width: calc(100% - 2rem);
  border-radius: 0.5rem;
  box-shadow:
    0 8px 32px -4px rgba(237, 110, 160, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out 0s;
  margin-bottom: 2rem;
  background: #fff;
  overflow: visible;
}

.post-card:hover {
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.1);
}

.post-card:hover .cover img {
  transform: scale(1.05) rotate(1deg);
}

.cover {
  width: 50%;
  height: 100%;
  margin-right: 1.5rem;
  clip-path: polygon(0 0, 92% 0%, 100% 100%, 0% 100%);
  border-radius: 0.625rem 0 0 0.625rem;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: all 0.2s ease-in-out 0s;
}

.info {
  position: relative;
  width: 50%;
  height: 100%;
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

.info-content {
  padding: 1rem 1.5rem 0 0;
}

.meta {
  display: flex;
  justify-content: flex-end;
  margin: 0;
  font-size: 0.8125em;
  color: #999;
}

.meta .item {
  display: inline-block;
  margin-right: 0.625rem;
}

.meta .item .icon {
  margin-right: 0.0625rem;
}

.info h3 {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin: 0.625rem 0;
  color: #e9546b;
  font-size: 1.1em;
}

.info h3 a {
  color: inherit;
  text-decoration: none;
}

.info h3 a:hover {
  color: #38a1db;
}

.excerpt {
  overflow: hidden;
  font-size: 0.875em;
  max-height: 5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  color: #666;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.info-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: 0;
  gap: 0.5rem;
  background: none;
  overflow: visible;
}

.info-footer a {
  display: inline-flex;
  align-items: center;
  font-size: 0.875em;
  line-height: 1.8;
  color: #999;
  text-decoration: none;
  padding: 0.3rem 1rem;
  border-radius: 1rem 0;
  background: none;
  transition: all 0.2s;
}

.info-footer a.btn {
  color: #fff;
  background-image: linear-gradient(to right, #ed6ea0 0, #ec8c69 100%);
  border-radius: 0.5rem 0 0.5rem 0;
}

.post-card:nth-child(2n) .info-footer a.btn {
  border-radius: 0 0.5rem 0 0.5rem;
  background-image: linear-gradient(to right, #ec8c69 0, #ed6ea0 100%);
}

.info-footer a.btn:hover {
  transform: scale(1.08);
  color: #fff;
}

/* 偶数卡片反向布局 */
.post-card:nth-child(2n) {
  flex-direction: row-reverse;
}

.post-card:nth-child(2n) .cover {
  margin-right: 0;
  margin-left: 1.5rem;
  clip-path: polygon(0 0%, 100% 0%, 100% 100%, 8% 100%);
  border-radius: 0 0.625rem 0.625rem 0;
  position: relative;
}

.post-card:nth-child(2n) .info {
  padding: 0;
}

.post-card:nth-child(2n) .info-content {
  padding: 1rem 0 0 1.5rem;
}

.post-card:nth-child(2n) .meta {
  justify-content: flex-end;
}

.post-card:nth-child(2n) .info-footer {
  flex-direction: row-reverse;
  justify-content: space-between;
}

@media (max-width: 767px) {
  .post-card,
  .post-card:nth-child(2n) {
    flex-direction: column;
    height: fit-content;
    max-height: fit-content;
  }

  .cover,
  .post-card:nth-child(2n) .cover {
    width: 100%;
    height: 14rem;
    margin: auto;
    clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);
    border-radius: 0.625rem 0.625rem 0 0;
  }

  .info,
  .post-card:nth-child(2n) .info {
    width: 100%;
    height: 14rem;
    padding: 0;
  }

  .info-content,
  .post-card:nth-child(2n) .info-content {
    padding: 1rem 1rem 0 1rem;
  }
}
</style>
