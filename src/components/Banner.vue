<template>
  <div class="app-banner">
    <div class="banner-images">
      <img :src="bannerImage" :alt="bannerAlt" />
    </div>

    <!-- 默认网站标题 -->
    <div v-if="!isArticlePage" class="banner-title">
      <h1>{{ siteTitle }}</h1>
      <p>{{ siteSubtitle }}</p>
    </div>

    <!-- 文章详情页信息 -->
    <div v-else class="article-banner">
      <div class="article-info">
        <h1 class="article-title">{{ articleTitle }}</h1>
        <div class="article-meta">
          <div class="meta-item">
            <i class="ic i-user"></i>
            <span>{{ articleAuthor }}</span>
          </div>
          <div class="meta-item">
            <i class="ic i-calendar"></i>
            <time :datetime="articleDate">{{ formatDate(articleDate) }}</time>
          </div>
          <div class="meta-item">
            <i class="ic i-pen"></i>
            <span>{{ articleWordCount }} 字</span>
          </div>
          <div class="meta-item">
            <i class="ic i-clock"></i>
            <span>{{ articleReadTime }} 分钟</span>
          </div>
          <div class="meta-item">
            <i class="ic i-eye"></i>
            <span>{{ articleViews }} 阅读</span>
          </div>
        </div>
        <div class="article-categories" v-if="articleCategories && articleCategories.length">
          <span v-for="category in articleCategories" :key="category" class="category-tag">
            {{ category }}
          </span>
        </div>
      </div>
    </div>

    <div class="waves">
      <svg viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" class="wave1" />
          <use xlink:href="#gentle-wave" x="48" y="3" class="wave2" />
          <use xlink:href="#gentle-wave" x="48" y="5" class="wave3" />
          <use xlink:href="#gentle-wave" x="48" y="7" class="wave4" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 默认网站信息
  siteTitle: {
    type: String,
    default: 'CircleCoder',
  },
  siteSubtitle: {
    type: String,
    default: '= 仰望星空 =',
  },
  bannerImage: {
    type: String,
    default: 'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943773.jpg',
  },
  bannerAlt: {
    type: String,
    default: 'banner',
  },

  // 文章详情页信息
  isArticlePage: {
    type: Boolean,
    default: false,
  },
  articleTitle: {
    type: String,
    default: '',
  },
  articleAuthor: {
    type: String,
    default: '',
  },
  articleDate: {
    type: String,
    default: '',
  },
  articleWordCount: {
    type: [String, Number],
    default: 0,
  },
  articleReadTime: {
    type: [String, Number],
    default: 0,
  },
  articleViews: {
    type: [String, Number],
    default: 0,
  },
  articleCategories: {
    type: Array,
    default: () => [],
  },
})

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
/* Banner样式 */
.app-banner {
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  height: 66vh;
  min-height: 320px;
  max-height: 600px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  z-index: 1;
  margin-top: 56px;
}

.banner-images img {
  width: 100vw;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  filter: brightness(0.85) blur(0.5px);
}

/* 默认网站标题样式 */
.banner-title {
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: center;
  margin-bottom: 32px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.banner-title h1 {
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0 0 16px 0;
}

.banner-title p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
}

/* 文章详情页样式 */
.article-banner {
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: center;
  margin-bottom: 32px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  padding: 0 20px;
}

.article-info {
  width: 100%;
}

.article-title {
  font-size: 2.4rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 24px 0;
  line-height: 1.3;
  word-wrap: break-word;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  opacity: 0.9;
}

.meta-item i {
  font-size: 0.9rem;
}

.article-categories {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.category-tag {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.category-tag:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* 波浪动画 */
.waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  min-height: 50px;
  max-height: 150px;
  z-index: 1;
}

.waves svg {
  width: 100%;
  height: 100%;
}

.parallax use {
  animation: waveMove 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.wave1 {
  animation-delay: -2s;
  animation-duration: 7s;
  fill: rgba(255, 255, 255, 0.7);
}

.wave2 {
  animation-delay: -3s;
  animation-duration: 10s;
  fill: rgba(255, 255, 255, 0.5);
}

.wave3 {
  animation-delay: -4s;
  animation-duration: 13s;
  fill: rgba(255, 255, 255, 0.3);
}

.wave4 {
  animation-delay: -5s;
  animation-duration: 20s;
  fill: rgba(255, 255, 255, 1);
}

@keyframes waveMove {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .banner-title h1 {
    font-size: 2.4rem;
  }

  .banner-title p {
    font-size: 1.1rem;
  }

  .article-title {
    font-size: 2.1rem;
  }

  .article-meta {
    gap: 16px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-banner {
    height: 50vh;
    min-height: 280px;
    margin-top: 48px;
  }

  .banner-title h1 {
    font-size: 2rem;
    letter-spacing: 1px;
  }

  .banner-title p {
    font-size: 1rem;
  }

  .article-title {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .article-meta {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .meta-item {
    font-size: 0.9rem;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .app-banner {
    height: 40vh;
    min-height: 240px;
    margin-top: 44px;
  }

  .banner-title h1 {
    font-size: 1.8rem;
  }

  .banner-title p {
    font-size: 0.9rem;
  }

  .article-title {
    font-size: 1.6rem;
    margin-bottom: 16px;
  }

  .article-meta {
    gap: 10px;
    margin-bottom: 12px;
  }

  .meta-item {
    font-size: 0.85rem;
  }

  .category-tag {
    padding: 4px 12px;
    font-size: 0.8rem;
  }
}
</style>
