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

      <!-- 第三个盒子：学术成果 -->
      <div class="third-section">
        <div class="academic-background"></div>
        <div class="academic-content">
          <h2 class="academic-title">学术成果</h2>
          <div class="academic-layout">
            <div class="academic-text">
              <h3>研究领域</h3>
              <p>
                我的研究主要集中在计算机科学和软件工程领域，特别关注前端开发技术、用户体验设计和系统架构优化。
              </p>

              <h3>主要成果</h3>
              <ul class="achievement-list">
                <li>参与多个大型Web应用项目的架构设计和开发</li>
                <li>在Vue.js、React等前端框架方面有深入研究</li>
                <li>对用户体验设计和界面优化有丰富经验</li>
                <li>在性能优化和代码质量方面有独到见解</li>
              </ul>

              <h3>技术栈</h3>
              <p>
                熟练掌握JavaScript、TypeScript、Vue.js、React、Node.js等现代Web开发技术，对微服务架构和云原生技术有深入了解。
              </p>
            </div>
            <div class="academic-stats">
              <div class="stat-item">
                <div class="stat-number">5+</div>
                <div class="stat-label">年开发经验</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">20+</div>
                <div class="stat-label">项目经验</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">10+</div>
                <div class="stat-label">技术栈</div>
              </div>
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

/* 第三个盒子：学术成果 */
.third-section {
  position: relative;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-height: 400px;
  margin-top: 4rem;
}

/* 学术成果背景图 */
.academic-background {
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

/* 学术成果内容 */
.academic-content {
  position: relative;
  z-index: 2;
  height: 100%;
}

.academic-title {
  text-align: center;
  font-size: 2.5rem;
  color: #8b4513;
  margin-bottom: 2rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.academic-layout {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
  height: calc(100% - 100px);
}

.academic-text {
  flex: 2;
  text-align: left;
}

.academic-text h3 {
  font-size: 1.5rem;
  color: #8b4513;
  margin-bottom: 1rem;
  font-weight: bold;
  margin-top: 1.5rem;
}

.academic-text h3:first-child {
  margin-top: 0;
}

.academic-text p {
  font-size: 1.1rem;
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 1rem;
  text-align: justify;
}

.achievement-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.achievement-list li {
  font-size: 1.1rem;
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.achievement-list li::before {
  content: '•';
  color: #8b4513;
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 0;
}

.academic-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  border: 2px solid #8b4513;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
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

  /* 学术成果响应式 */
  .academic-layout {
    flex-direction: column;
    gap: 2rem;
  }

  .academic-text {
    flex: none;
  }

  .academic-stats {
    flex-direction: row;
    justify-content: space-around;
  }

  .stat-item {
    flex: 1;
    padding: 1rem;
  }

  .academic-title {
    font-size: 2rem;
  }

  .academic-text h3 {
    font-size: 1.3rem;
  }

  .academic-text p {
    font-size: 1rem;
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
