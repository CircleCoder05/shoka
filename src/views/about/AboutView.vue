<template>
  <PageContainer>
    <template #background>
      <div class="about-background"></div>
    </template>

    <div class="about-content">
      <!-- 标题图片 -->
      <div class="title-section">
        <img src="@/assets/images/selftitle.png" alt="关于我" class="title-image" />
      </div>

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

      <!-- 第二个盒子：MBTI -->
      <div class="second-section">
        <div class="mbti-background"></div>
        <div class="mbti-content">
          <h2 class="mbti-title">MBTI</h2>
          <div class="mbti-layout">
            <div class="mbti-image">
              <img src="@/assets/images/infj.png" alt="INFJ" class="mbti-img" />
            </div>
            <div class="mbti-text">
              <h3>INFJ - 提倡者</h3>
              <p>
                作为INFJ性格类型，我是一个理想主义者，追求深度和意义。我善于洞察他人，具有强烈的同理心和直觉。在编程和创作中，我注重细节和用户体验，喜欢探索新的可能性。
              </p>
              <p>
                我倾向于独立思考，享受独处时光来充电和思考。在工作中，我追求完美主义，喜欢有挑战性的项目，并且能够看到事物的整体图景。
              </p>
            </div>
          </div>
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
  position: relative;
}

.about-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3); /* 白色半透明覆盖层，让背景更浅 */
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
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)); /* 添加阴影效果 */
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

/* 第二个盒子：MBTI */
.second-section {
  position: relative;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-height: 400px;
}

/* MBTI背景图 */
.mbti-background {
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

/* MBTI内容 */
.mbti-content {
  position: relative;
  z-index: 2;
  height: 100%;
}

.mbti-title {
  text-align: center;
  font-size: 2.5rem;
  color: #8b4513;
  margin-bottom: 2rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.mbti-layout {
  display: flex;
  gap: 3rem;
  align-items: center;
  height: calc(100% - 100px);
}

.mbti-image {
  flex: 0 0 200px;
  text-align: center;
}

.mbti-img {
  max-width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.mbti-text {
  flex: 1;
  text-align: left;
}

.mbti-text h3 {
  font-size: 1.8rem;
  color: #8b4513;
  margin-bottom: 1rem;
  font-weight: bold;
}

.mbti-text p {
  font-size: 1.1rem;
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 1rem;
  text-align: justify;
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

  .page-title {
    font-size: 2rem;
  }

  .profile-card {
    padding: 1.5rem;
  }

  /* MBTI响应式 */
  .mbti-layout {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .mbti-image {
    flex: none;
  }

  .mbti-text {
    text-align: center;
  }

  .mbti-title {
    font-size: 2rem;
  }

  .mbti-text h3 {
    font-size: 1.5rem;
  }

  .mbti-text p {
    font-size: 1rem;
    text-align: left;
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
