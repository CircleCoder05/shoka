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

<style scoped lang="scss" src="@/styles/sfc/views/Friends.scss"></style>
