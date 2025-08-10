<template>
  <PageContainer>
    <template #background>
      <div class="about-background">
        <div class="bg-top"></div>
        <div class="bg-middle"></div>
        <div class="bg-bottom"></div>
      </div>
    </template>

    <div class="about-content">
      <!-- 标题图片 -->
      <div class="title-section">
        <img src="@/assets/images/selftitle.png" alt="关于我" class="title-image" />
      </div>

      <!-- 第一个盒子：个人信息和3D模型 -->
      <div class="main-section">
        <!-- 左侧：个人信息卡片 -->
        <ProfileCard :profile-data="profileData" />

        <!-- 右侧：3D模型展示 -->
        <div class="model-section">
          <div class="model-container">
            <div class="model-title-container">
              <h3>{{ model3dData.title }}</h3>
            </div>
            <ModelViewer :initial-model-key="model3dData.modelKey" />
          </div>
        </div>
      </div>

      <!-- 动态信息盒子 -->
      <div class="info-boxes-container">
        <InfoBox v-for="(boxData, key) in infoBoxes" :key="key" :data="boxData" />
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import PageContainer from '@/components/PageContainer.vue'
import ModelViewer from '@/views/about/ModelViewer.vue'
import ProfileCard from '@/views/about/ProfileCard.vue'
import InfoBox from '@/components/InfoBox.vue'
import { useAboutStore } from '@/stores/about.js'

const aboutStore = useAboutStore()

// 计算属性：从store获取数据
const profileData = computed(() => aboutStore.getProfileData())
const model3dData = computed(() => aboutStore.getModel3dData())
const infoBoxes = computed(() => aboutStore.getInfoBoxes())

onMounted(() => {
  aboutStore.loadAboutData()
})
</script>

<style scoped>
.about-background {
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/selfback2.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.about-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2); /* 白色半透明覆盖层，让背景更浅 */
  z-index: 1;
}

.about-content {
  max-width: 100%;
  min-height: 100vh;
}

/* 标题图片区域 */
.title-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
}

.title-image {
  max-width: 100%;
  height: auto;
  max-height: 120px; /* 限制最大高度 */
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)); /* 添加阴影      效果 */
}

/* 主区域：左右分栏 */
.main-section {
  display: flex;
  gap: 3rem;
  margin-bottom: 4rem;
  height: 600px;
  margin-top: 2rem; /* 添加一些顶部间距 */
}

/* 右侧：3D模型区域 */
.model-section {
  flex: 1.5;
  height: 100%;
}

.model-container {
  width: 100%;
  height: 100%; /* 填满父区域 */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.model-title-container {
  background-image: url('@/assets/images/3dtitle.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  padding: 1rem 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: inline-block;
}

.model-container h3 {
  font-size: 1.5rem;
  color: #8b4513; /* 棕色文字 */
  margin: 0;
  font-weight: bold;
}

/* 信息盒子容器 */
.info-boxes-container {
  margin-bottom: 4rem; /* 给最后一个盒子添加底部间距 */
}

/* 暗色模式样式 */
html.dark-theme .about-background::before {
  background: rgba(33, 37, 43, 0.85) !important; /* 深色半透明覆盖层 */
}

/* 暗色模式下的3D标题区域 */
html.dark-theme .model-title-container h3 {
  color: #ffffff !important; /* 暗色模式下使用纯白文字 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8) !important; /* 增强文字阴影 */
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-section {
    flex-direction: column;
    gap: 2rem;
    height: auto;
  }
}

@media (max-width: 768px) {
  .title-section {
    margin-bottom: 1.5rem;
    padding: 0.5rem 0;
  }

  .title-image {
    max-height: 80px; /* 移动端稍微缩小 */
  }

  .main-section {
    flex-direction: column;
    height: auto;
  }
}
</style>
