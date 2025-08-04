<template>
  <PageContainer>
    <template #background>
      <div class="about-background"></div>
    </template>

    <div class="about-content">
      <!-- 第一个盒子：个人信息和3D模型 -->
      <div class="main-section">
        <!-- 左侧：个人信息卡片 -->
        <ProfileCard />

        <!-- 右侧：3D模型展示 -->
        <div class="model-section">
          <div class="model-container">
            <h3>我的3D形象</h3>
            <ModelViewer initial-model-key="joseph02" />
          </div>
        </div>
      </div>

      <!-- 第二个盒子：预留位置 -->
      <div class="second-section">
        <div class="placeholder">
          <h2>第二个盒子</h2>
          <p>这里将放置更多内容...</p>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import PageContainer from '@/components/PageContainer.vue'
import ModelViewer from '@/views/about/ModelViewer.vue'
import ProfileCard from '@/views/about/ProfileCard.vue'
</script>

<style scoped>
.about-background {
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/selfback.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.about-content {
  max-width: 100%;
  min-height: 100vh;
}

/* 主区域：左右分栏 */
.main-section {
  display: flex;
  gap: 3rem;
  margin-bottom: 4rem;
  height: 600px;
  margin-top: 2rem; /* 添加一些顶部间距 */
}

/* 左侧：个人信息卡片 - 现在使用ProfileCard组件 */

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

.model-container h3 {
  font-size: 1.5rem;
  color: #34495e;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 第二个盒子 */
.second-section {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  border: 2px dashed rgba(102, 126, 234, 0.2);
}

.placeholder h2 {
  color: #667eea;
  margin-bottom: 1rem;
}

.placeholder p {
  color: #888;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-section {
    flex-direction: column;
    gap: 2rem;
    height: auto;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-section {
    flex-direction: column;
    height: auto;
  }

  .page-title {
    font-size: 2rem;
  }

  .profile-card {
    padding: 1.5rem;
  }

  .nickname {
    font-size: 1.5rem;
  }

  .info-grid {
    gap: 1rem;
  }

  .info-item {
    padding: 0.75rem;
  }

  .skill-tags {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .about-content {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .profile-card {
    padding: 1rem;
  }

  .second-section {
    padding: 2rem 1rem;
  }
}
</style>
