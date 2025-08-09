<template>
  <div class="info-box">
    <div class="info-box-background"></div>
    <div class="info-box-content">
      <h2 class="info-box-title">{{ data.title }}</h2>
      <div class="info-box-layout">
        <div class="info-box-text">
          <template v-for="(section, key) in data.sections" :key="key">
            <h3 v-if="section.title">{{ section.title }}</h3>
            <p v-if="section.content">{{ section.content }}</p>
            <ul v-if="section.list" class="info-list">
              <li v-for="(item, index) in section.list" :key="index">{{ item }}</li>
            </ul>
          </template>
        </div>
        <div v-if="data.image" class="info-box-image">
          <img :src="data.image" :alt="data.title" class="info-img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.info-box {
  position: relative;
  border-radius: 20px;
  padding: 3rem;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(255, 255, 255, 0.3),
    0 0 40px rgba(255, 255, 255, 0.2);
  overflow: hidden;
  min-height: 400px;
  margin-top: 4rem;
}

.info-box-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/boxback.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.info-box-content {
  position: relative;
  z-index: 2;
  height: 100%;
}

.info-box-title {
  text-align: center;
  font-size: 2.5rem;
  color: #e67e22 !important; /* 橙色主标题 */
  margin-bottom: 2rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.info-box-layout {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
  height: calc(100% - 100px);
}

.info-box-text {
  flex: 1;
  text-align: left;
}

.info-box-text h3 {
  font-size: 1.5rem;
  color: #8b4513;
  margin-bottom: 1rem;
  font-weight: bold;
  margin-top: 1.5rem;
}

.info-box-text h3:first-child {
  margin-top: 0;
}

.info-box-text p {
  font-size: 1.1rem;
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 1rem;
  text-align: justify;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.info-list li {
  font-size: 1.1rem;
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.info-list li::before {
  content: '•';
  color: #8b4513;
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 0;
}

.info-box-image {
  flex: 0 0 200px;
  text-align: center;
}

.info-img {
  max-width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

/* 修改子标题颜色 */
.info-box-text h3 {
  color: #3498db !important; /* 蓝色子标题 */
}

/* 暗色模式样式 */
html.dark-theme .info-box {
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.4),
    0 0 25px rgba(255, 255, 255, 0.4),
    0 0 50px rgba(255, 255, 255, 0.3) !important;
}

html.dark-theme .info-box .info-box-title {
  color: #f39c12 !important; /* 暗色模式下的橙色主标题 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8) !important;
}

html.dark-theme .info-box-text h3 {
  color: #5dade2 !important; /* 暗色模式下的蓝色子标题 */
}

html.dark-theme .info-box-text p {
  color: #abb2bf !important;
}

html.dark-theme .info-list li {
  color: #abb2bf !important;
}

html.dark-theme .info-list li::before {
  color: #ed6ea0 !important; /* 使用品牌色作为列表符号 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-box-layout {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .info-box-image {
    flex: none;
  }

  .info-box-text {
    text-align: center;
  }

  .info-box-title {
    font-size: 2rem;
  }

  .info-box-text h3 {
    font-size: 1.3rem;
  }

  .info-box-text p {
    font-size: 1rem;
    text-align: left;
  }
}
</style>
