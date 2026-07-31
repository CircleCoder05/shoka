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
            <img :src="profileData.avatar" alt="头像" class="avatar-image" />
          </div>
          <div class="name-info">
            <h2 class="nickname">{{ profileData.nickname }}</h2>
            <p class="title">{{ profileData.title }}</p>
          </div>
        </div>
      </div>

      <!-- 信息列表 -->
      <div class="info-list">
        <div v-for="(item, index) in profileData.info" :key="index" class="info-item">
          <div class="info-item-background"></div>
          <div class="info-icon">
            <i :class="`ic ${item.icon}`"></i>
          </div>
          <div class="info-content">
            <label>{{ item.label }}</label>
            <span>{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  profileData: {
    type: Object,
    default: () => ({
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CircleCoder',
      nickname: 'CircleCoder',
      title: '全栈开发工程师',
      info: [
        { label: '昵称', value: 'CircleCoder', icon: 'i-user' },
        { label: '性别', value: '男', icon: 'i-heart' },
        { label: '家乡', value: '中国', icon: 'i-home' },
        { label: '学校', value: '某知名大学', icon: 'i-graduation-cap' },
        { label: '专业', value: '计算机科学与技术', icon: 'i-code' },
        { label: '爱好', value: '编程、游戏、音乐', icon: 'i-gamepad' },
      ],
    }),
  },
})
</script>

<style scoped lang="scss" src="@/styles/sfc/views/about/ProfileCard.scss"></style>
