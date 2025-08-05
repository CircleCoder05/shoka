<template>
  <div class="profile-card">
    <!-- 背景图 -->
    <div class="profile-background"></div>

    <!-- 内容区域 -->
    <div class="profile-content">
      <!-- 头像和基本信息 -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-placeholder">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=CircleCoder"
              alt="头像"
              class="avatar-image"
            />
          </div>
          <div class="name-info">
            <h2 class="nickname">CircleCoder</h2>
            <p class="title">全栈开发工程师</p>
          </div>
        </div>
      </div>

      <!-- 信息列表 -->
      <div class="info-list">
        <div class="info-item">
          <div class="info-item-background"></div>
          <div class="info-icon">
            <i class="ic i-user"></i>
          </div>
          <div class="info-content">
            <label>昵称</label>
            <span>CircleCoder</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-item-background"></div>
          <div class="info-icon">
            <i class="ic i-heart"></i>
          </div>
          <div class="info-content">
            <label>性别</label>
            <span>男</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-item-background"></div>
          <div class="info-icon">
            <i class="ic i-home"></i>
          </div>
          <div class="info-content">
            <label>家乡</label>
            <span>中国</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-item-background"></div>
          <div class="info-icon">
            <i class="ic i-graduation-cap"></i>
          </div>
          <div class="info-content">
            <label>学校</label>
            <span>某知名大学</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-item-background"></div>
          <div class="info-icon">
            <i class="ic i-code"></i>
          </div>
          <div class="info-content">
            <label>专业</label>
            <span>计算机科学与技术</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-item-background"></div>
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
  position: relative;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 2;
  overflow: hidden; /* 确保背景图不会溢出 */
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
}

/* 背景图样式 */
.profile-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/infoback.png');
  background-size: 100% 100%; /* 完全拉伸填满，不保持原比例 */
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

/* 内容区域 */
.profile-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem; /* 内容离边框有距离 */
  box-sizing: border-box;
}

.profile-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #8b4513; /* 棕色分隔线 */
}

.avatar-section {
  display: flex;
  flex-direction: row; /* 改为水平排列 */
  align-items: center;
  justify-content: space-between; /* 头像居左，其他居右 */
  gap: 1rem;
}

.avatar-placeholder {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  overflow: hidden; /* 确保图片不会溢出圆形边界 */
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片填满容器 */
  border-radius: 50%; /* 保持圆形 */
}

.name-info {
  display: flex;
  flex-direction: column; /* 竖直排列 */
  align-items: flex-start; /* 左对齐 */
  gap: 0.5rem; /* 昵称和标题之间的间距 */
}

.nickname {
  font-size: 1.6rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.title {
  color: #667eea;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

/* 信息列表 */
.info-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* 自定义滚动条样式 */
.info-list::-webkit-scrollbar {
  width: 6px;
}

.info-list::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
}

.info-list::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.info-list::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

.info-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem; /* 图标和内容之间的间距 */
  padding: 0.75rem 1.5rem; /* 增加左右内边距，整体向右挪动 */
  border-radius: 12px;
  transition: all 0.3s ease;
  min-height: 60px;
  overflow: hidden; /* 确保背景图不会溢出 */
}

/* 信息项背景图 */
.info-item-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/everyinfo.png');
  background-size: 100% 100%; /* 完全拉伸填满，不保持原比例 */
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.info-item:hover {
  transform: translateX(3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.info-icon {
  position: relative;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #dbbd87; /* 土黄色背景 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b4513; /* 棕色图标 */
  font-size: 1.3rem; /* 更大的字体 */
  font-weight: bold; /* 加粗 */
  flex-shrink: 0;
  margin-left: auto; /* 靠右对齐 */
}

.info-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row; /* 改为水平排列 */
  align-items: center;
  gap: 1rem; /* 增加标签和值之间的间距 */
  flex: 1;
}

.info-content label {
  font-size: 1rem; /* 更大的字体 */
  color: #000000; /* 黑色标签 */
  font-family: serif; /* 宋体 */
  font-weight: normal; /* 不加粗 */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap; /* 防止换行 */
}

.info-content span {
  font-size: 1rem;
  color: #000000; /* 黑色文字 */
  font-family: 'SimSun', '宋体', serif; /* 宋体 */
  font-weight: normal; /* 不加粗 */
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-card {
    padding: 1rem;
    flex: 1;
  }

  .profile-content {
    padding: 0.8rem; /* 移动端稍微减少内边距 */
  }

  .nickname {
    font-size: 1.4rem;
  }

  .info-item {
    padding: 0.6rem 1rem; /* 移动端也增加左右内边距 */
    min-height: 50px;
  }
}
</style>
