import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCommentsStore = defineStore('comments', () => {
  // 评论配置状态
  const commentConfig = ref({})
  const loading = ref(false)
  const error = ref(null)

  // 加载评论配置
  const loadCommentConfig = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch('/comment-config.json')
      if (response.ok) {
        commentConfig.value = await response.json()
      } else {
        throw new Error('评论配置加载失败')
      }
    } catch (err) {
      error.value = err.message
      console.error('加载评论配置失败:', err)
      // 使用默认配置
      commentConfig.value = {
        type: 'gitalk',
        enabled: true,
      }
    } finally {
      loading.value = false
    }
  }

  // 获取评论配置
  const getCommentConfig = () => commentConfig.value

  // 获取特定评论系统配置
  const getCommentSystemConfig = (type) => {
    if (!commentConfig.value || commentConfig.value.type !== type) {
      return null
    }
    return commentConfig.value[type] || {}
  }

  // 获取当前启用的评论系统类型
  const getCurrentCommentType = () => {
    return commentConfig.value?.type || 'gitalk'
  }

  // 检查评论系统是否启用
  const isCommentEnabled = () => {
    return commentConfig.value?.enabled !== false
  }

  return {
    commentConfig,
    loading,
    error,
    loadCommentConfig,
    getCommentConfig,
    getCommentSystemConfig,
    getCurrentCommentType,
    isCommentEnabled,
  }
})
