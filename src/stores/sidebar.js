import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  // 侧边栏状态
  const activePanel = ref('overview')
  const articleContent = ref('')

  // 切换面板
  const switchPanel = (panel) => {
    activePanel.value = panel
  }

  // 设置文章内容
  const setArticleContent = (content) => {
    articleContent.value = content
  }

  // 重置状态
  const reset = () => {
    activePanel.value = 'overview'
    articleContent.value = ''
  }

  return {
    // 状态
    activePanel,
    articleContent,

    // 方法
    switchPanel,
    setArticleContent,
    reset,
  }
})
