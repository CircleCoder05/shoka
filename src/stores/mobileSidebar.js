import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMobileSidebarStore = defineStore('mobileSidebar', () => {
  // 移动端侧边栏是否显示
  const isMobileSidebarOpen = ref(false)

  // 打开移动端侧边栏
  const openMobileSidebar = () => {
    isMobileSidebarOpen.value = true
    // 禁止body滚动
    document.body.style.overflow = 'hidden'
  }

  // 关闭移动端侧边栏
  const closeMobileSidebar = () => {
    isMobileSidebarOpen.value = false
    // 恢复body滚动
    document.body.style.overflow = ''
  }

  // 切换移动端侧边栏
  const toggleMobileSidebar = () => {
    if (isMobileSidebarOpen.value) {
      closeMobileSidebar()
    } else {
      openMobileSidebar()
    }
  }

  return {
    isMobileSidebarOpen,
    openMobileSidebar,
    closeMobileSidebar,
    toggleMobileSidebar,
  }
})
