<template>
  <footer class="footer">
    <div class="footer-content">
      <p>© {{ currentYear }} {{ siteName }}</p>
      <p class="icp">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          {{ icpNumber }}
        </a>
      </p>
      <p class="runtime">本站已稳定运行 {{ runtime }}</p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useConfigStore } from '@/stores/config'

const configStore = useConfigStore()
const runtime = ref('')
let timer = null

// 计算运行时间
const calculateRuntime = () => {
  const startDate = new Date(configStore.footer.startDate || '2024-11-01T00:00:00')
  const now = new Date()
  const diff = now - startDate

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  runtime.value = `${days}天${hours}时${minutes}分${seconds}秒`
}

const icpNumber = computed(() => configStore.footer?.icp || '京ICP备2025135091号')
const siteName = computed(() => configStore.footer?.name || '碼農書架')
const currentYear = computed(() => new Date().getFullYear())

onMounted(async () => {
  await configStore.loadConfig()
  calculateRuntime()
  // 每秒更新一次
  timer = setInterval(calculateRuntime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss" src="@/styles/sfc/components/Footer.scss"></style>
