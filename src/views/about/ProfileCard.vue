<template>
  <div class="profile-card">
    <!-- 头像和基本信息 -->
    <div class="profile-header">
      <div class="avatar-section">
        <div class="avatar-placeholder">
          <i class="ic i-user"></i>
        </div>
        <h2 class="nickname">CircleCoder</h2>
        <p class="title">全栈开发工程师</p>
      </div>
    </div>

    <!-- 信息列表 -->
    <div class="info-list">
      <div class="info-row">
        <div class="info-item">
          <div class="info-icon">
            <i class="ic i-user"></i>
          </div>
          <div class="info-content">
            <label>昵称</label>
            <span>CircleCoder</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <i class="ic i-heart"></i>
          </div>
          <div class="info-content">
            <label>性别</label>
            <span>男</span>
          </div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-item">
          <div class="info-icon">
            <i class="ic i-home"></i>
          </div>
          <div class="info-content">
            <label>家乡</label>
            <span>中国</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <i class="ic i-graduation-cap"></i>
          </div>
          <div class="info-content">
            <label>学校</label>
            <span>某知名大学</span>
          </div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-item">
          <div class="info-icon">
            <i class="ic i-code"></i>
          </div>
          <div class="info-content">
            <label>专业</label>
            <span>计算机科学与技术</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <i class="ic i-gamepad"></i>
          </div>
          <div class="info-content">
            <label>爱好</label>
            <span>编程、游戏、音乐</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.profile-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
}

.profile-header {
  text-align: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.nickname {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.title {
  color: #667eea;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

/* 信息列表 */
.info-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  gap: 0.5rem;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(3px);
}

.info-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.info-content label {
  font-size: 0.7rem;
  color: #888;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-content span {
  font-size: 0.8rem;
  color: #2c3e50;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-card {
    padding: 1rem;
  }

  .nickname {
    font-size: 1.3rem;
  }

  .info-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-item {
    padding: 0.4rem;
  }
}
</style>
