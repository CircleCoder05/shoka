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
        <router-link :to="post.url" :title="post.title" class="btn">more...</router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
import { RouterLink } from 'vue-router'
defineProps({
  post: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
/* 卡片基础样式 */
.post-card {
  display: flex;
  height: 14rem;
  width: calc(100% - 2rem);
  min-width: calc(100% - 2rem);
  border-radius: 0.5rem;
  box-shadow:
    0 8px 32px -4px rgba(237, 110, 160, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;
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

/* 封面图样式 */
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
  transition: all 0.2s ease-in-out;
}

/* 信息区域样式 */
.info {
  position: relative;
  width: 50%;
  height: 100%;
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.info-content {
  padding: 1rem 1.5rem 0 0;
}

/* 元信息样式 */
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

/* 标题样式 */
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

/* 摘要样式 */
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

/* 底部按钮区域 */
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
  cursor: pointer;
}

.info-footer a.btn {
  color: #fff;
  background-image: linear-gradient(to right, #ed6ea0 0, #ec8c69 100%);
  border-radius: 0.5rem 0 0.5rem 0;
}

.info-footer a.btn:hover {
  transform: scale(1.08);
  color: #fff;
}

/* 偶数卡片样式 */
.post-card:nth-child(2n) {
  flex-direction: row-reverse;
}

.post-card:nth-child(2n) .cover {
  margin-right: 0;
  margin-left: 1.5rem;
  clip-path: polygon(0 0%, 100% 0%, 100% 100%, 8% 100%);
  border-radius: 0 0.625rem 0.625rem 0;
}

.post-card:nth-child(2n) .info-content {
  padding: 1rem 0 0 1.5rem;
}

.post-card:nth-child(2n) .info-footer {
  flex-direction: row-reverse;
}

.post-card:nth-child(2n) .info-footer a.btn {
  border-radius: 0 0.5rem 0 0.5rem;
  background-image: linear-gradient(to right, #ec8c69 0, #ed6ea0 100%);
}

/* 移动端适配 */
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

/* 响应式适配 */

/* 大屏幕适配 (1200px+) */
@media (min-width: 1200px) {
  .post-card {
    height: 16rem;
  }
  
  .info h3 {
    font-size: 1.2em;
  }
  
  .excerpt {
    font-size: 0.9em;
    max-height: 5.5rem;
  }
  
  .meta {
    font-size: 0.85em;
  }
}

/* 中等屏幕适配 (768px - 1199px) */
@media (max-width: 1199px) and (min-width: 768px) {
  .post-card {
    height: 14rem;
  }
  
  .info h3 {
    font-size: 1.1em;
  }
  
  .excerpt {
    font-size: 0.875em;
    max-height: 5rem;
  }
}

/* 平板端适配 (768px - 1023px) */
@media (max-width: 1023px) and (min-width: 768px) {
  .post-card {
    height: 13rem;
  }
  
  .cover {
    margin-right: 1.25rem;
  }
  
  .post-card:nth-child(2n) .cover {
    margin-left: 1.25rem;
  }
  
  .info-content {
    padding: 0.875rem 1.25rem 0 0;
  }
  
  .post-card:nth-child(2n) .info-content {
    padding: 0.875rem 0 0 1.25rem;
  }
  
  .info h3 {
    font-size: 1.05em;
  }
  
  .excerpt {
    font-size: 0.85em;
    max-height: 4.5rem;
  }
  
  .meta {
    font-size: 0.8em;
  }
}

/* 移动端适配 (480px - 767px) */
@media (max-width: 767px) and (min-width: 481px) {
  .post-card,
  .post-card:nth-child(2n) {
    flex-direction: column;
    height: fit-content;
    max-height: fit-content;
  }

  .cover,
  .post-card:nth-child(2n) .cover {
    width: 100%;
    height: 12rem;
    margin: auto;
    clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);
    border-radius: 0.625rem 0.625rem 0 0;
  }

  .info,
  .post-card:nth-child(2n) .info {
    width: 100%;
    height: 12rem;
    padding: 0;
  }

  .info-content,
  .post-card:nth-child(2n) .info-content {
    padding: 0.875rem 0.875rem 0 0.875rem;
  }
  
  .info h3 {
    font-size: 1em;
  }
  
  .excerpt {
    font-size: 0.8em;
    max-height: 4rem;
  }
  
  .meta {
    font-size: 0.75em;
  }
  
  .info-footer a {
    font-size: 0.8em;
    padding: 0.25rem 0.75rem;
  }
}

/* 小屏手机适配 (480px以下) */
@media (max-width: 480px) {
  .post-card,
  .post-card:nth-child(2n) {
    flex-direction: column;
    height: fit-content;
    max-height: fit-content;
    margin-bottom: 1.5rem;
  }

  .cover,
  .post-card:nth-child(2n) .cover {
    width: 100%;
    height: 10rem;
    margin: auto;
    clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .info,
  .post-card:nth-child(2n) .info {
    width: 100%;
    height: 10rem;
    padding: 0;
  }

  .info-content,
  .post-card:nth-child(2n) .info-content {
    padding: 0.75rem 0.75rem 0 0.75rem;
  }
  
  .info h3 {
    font-size: 0.95em;
    margin: 0.5rem 0;
  }
  
  .excerpt {
    font-size: 0.75em;
    max-height: 3.5rem;
    margin-bottom: 0.375rem;
  }
  
  .meta {
    font-size: 0.7em;
  }
  
  .meta .item {
    margin-right: 0.5rem;
  }
  
  .info-footer {
    gap: 0.375rem;
  }
  
  .info-footer a {
    font-size: 0.75em;
    padding: 0.2rem 0.6rem;
  }
}

/* 超小屏适配 (360px以下) */
@media (max-width: 360px) {
  .post-card,
  .post-card:nth-child(2n) {
    margin-bottom: 1rem;
  }

  .cover,
  .post-card:nth-child(2n) .cover {
    height: 8rem;
    border-radius: 0.375rem 0.375rem 0 0;
  }

  .info,
  .post-card:nth-child(2n) .info {
    height: 8rem;
  }

  .info-content,
  .post-card:nth-child(2n) .info-content {
    padding: 0.5rem 0.5rem 0 0.5rem;
  }
  
  .info h3 {
    font-size: 0.9em;
    margin: 0.375rem 0;
  }
  
  .excerpt {
    font-size: 0.7em;
    max-height: 3rem;
    margin-bottom: 0.25rem;
  }
  
  .meta {
    font-size: 0.65em;
  }
  
  .meta .item {
    margin-right: 0.375rem;
  }
  
  .info-footer {
    gap: 0.25rem;
  }
  
  .info-footer a {
    font-size: 0.7em;
    padding: 0.15rem 0.5rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .post-card:hover {
    box-shadow: 0 8px 32px -4px rgba(237, 110, 160, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .post-card:hover .cover img {
    transform: none;
  }
  
  .info-footer a.btn:hover {
    transform: none;
  }
}
</style>
