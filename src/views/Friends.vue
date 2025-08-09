<template>
  <PageContainer>
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="ic i-heart"></i>
        友链
      </h1>
      <p class="page-subtitle">感谢这些优秀的朋友们</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="friendsStore.loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="friendsStore.error" class="error">
      <h2>加载失败</h2>
      <p>{{ friendsStore.error }}</p>
    </div>

    <!-- 友链内容 -->
    <div v-if="!friendsStore.loading && !friendsStore.error" class="friends-content">
      <!-- 友链分类 -->
      <div class="friends-categories">
        <div v-for="category in filteredFriends" :key="category.category" class="category-section">
          <!-- 分类标题 -->
          <div class="category-header">
            <h2 class="category-title">
              <i class="ic i-star"></i>
              {{ category.category }}
            </h2>
            <p class="category-description">{{ category.description }}</p>
            <div class="category-count">{{ category.items.length }} 位朋友</div>
          </div>

          <!-- 友链卡片 -->
          <div class="friends-grid">
            <div
              v-for="friend in category.items"
              :key="friend.name"
              class="friend-card"
              :style="getFriendCardStyle(friend)"
              @click="openFriendLink(friend.url)"
            >
              <!-- 头像 -->
              <div class="friend-avatar">
                <img :src="friend.avatar" :alt="friend.name" @error="handleAvatarError" />
              </div>

              <!-- 信息 -->
              <div class="friend-info">
                <h3 class="friend-name">{{ friend.name }}</h3>
                <p class="friend-description">{{ friend.description }}</p>

                <!-- 标签 -->
                <div class="friend-tags">
                  <span v-for="tag in friend.tags" :key="tag" class="tag-badge">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- 访问按钮 -->
              <div class="friend-action">
                <button class="visit-btn">
                  <i class="ic i-external-link"></i>
                  访问
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useFriendsStore } from '@/stores/friends'
import { useThemeStore } from '@/stores/theme'
import PageContainer from '@/components/PageContainer.vue'

const friendsStore = useFriendsStore()
const themeStore = useThemeStore()

// 过滤后的友链数据
const filteredFriends = computed(() => {
  return friendsStore.allFriends
})

// 打开友链链接
const openFriendLink = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// 处理头像加载错误
const handleAvatarError = (event) => {
  // 使用默认头像
  event.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
}

// 获取友链卡片样式
const getFriendCardStyle = (friend) => {
  const backgroundColor = friend.backgroundColor || '#f8f9fa'
  return {
    background: backgroundColor,
    backgroundImage: backgroundColor.includes('linear-gradient') ? backgroundColor : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
}

// 更新友链卡片背景样式
const updateFriendCardStyles = () => {
  setTimeout(() => {
    const friendCards = document.querySelectorAll('.friend-card')
    friendCards.forEach((card, index) => {
      const friend = friendsStore.allFriends.flatMap((cat) => cat.items)[index]
      if (friend && friend.backgroundColor) {
        let finalBackground = friend.backgroundColor

        // 在暗色主题下添加半透明深色蒙版使颜色变暗
        if (themeStore.isDark) {
          finalBackground = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), ${friend.backgroundColor}`
        }

        card.style.setProperty('background', finalBackground, 'important')
        card.style.setProperty('background-image', finalBackground, 'important')
      }
    })
  }, 100)
}

onMounted(() => {
  friendsStore.loadFriends()

  // 等待数据加载后更新卡片样式
  setTimeout(() => {
    updateFriendCardStyles()
  }, 1000)
})

// 监听主题变化，重新应用样式
watch(
  () => themeStore.isDark,
  () => {
    updateFriendCardStyles()
  },
)
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #38a1db 0%, #ed6ea0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.page-title i {
  font-size: 2.2rem;
  color: #ed6ea0;
  -webkit-text-fill-color: #ed6ea0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading {
  color: #666;
}

.error {
  text-align: center;
  color: #e9546b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ed6ea0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.friends-categories {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.category-section {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(56, 161, 219, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.category-header {
  margin-bottom: 2rem;
  text-align: center;
}

.category-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.category-title i {
  color: #ed6ea0;
  font-size: 1.5rem;
}

.category-description {
  font-size: 1rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.category-count {
  font-size: 0.9rem;
  color: #999;
  font-weight: 500;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.friend-card {
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
}

.friend-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.friend-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.friend-card:hover::before {
  opacity: 1;
}

.friend-avatar {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.friend-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.friend-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.8rem 0;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.friend-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag-badge {
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.friend-action {
  flex-shrink: 0;
}

.visit-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  backdrop-filter: blur(4px);
  position: relative;
  z-index: 1;
}

.visit-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-title i {
    font-size: 1.8rem;
  }

  .friends-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .friend-card {
    padding: 1rem;
  }

  .friend-avatar {
    width: 50px;
    height: 50px;
  }

  .friend-name {
    font-size: 1rem;
  }

  .friend-description {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .page-title i {
    font-size: 1.6rem;
  }

  .category-section {
    padding: 1.5rem;
  }

  .category-title {
    font-size: 1.5rem;
  }

  .friend-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .friend-tags {
    justify-content: center;
  }
}

/* 暗色主题样式 */
html.dark-theme .page-title {
  color: #abb2bf;
}

html.dark-theme .page-title i {
  color: #ed6ea0 !important;
  -webkit-text-fill-color: #ed6ea0 !important;
}

html.dark-theme .page-subtitle {
  color: #7f848e;
}

html.dark-theme .loading {
  color: #abb2bf;
}

html.dark-theme .category-section {
  background: #2c313c !important;
  border-color: #3e4451 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

html.dark-theme .category-title {
  color: #abb2bf !important;
}

html.dark-theme .category-title i {
  color: #ed6ea0 !important;
}

html.dark-theme .category-description {
  color: #7f848e !important;
}

html.dark-theme .category-count {
  color: #5c6370 !important;
}

/* 友链卡片背景由JavaScript动态设置 */

html.dark-theme .friends-content .friend-card .friend-name {
  color: #fff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

html.dark-theme .friends-content .friend-card .friend-description {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

html.dark-theme .friends-content .friend-card .tag-badge {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

html.dark-theme .friends-content .friend-card .visit-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

html.dark-theme .friends-content .friend-card .visit-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}
</style>
