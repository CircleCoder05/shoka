<template>
  <footer class="footer">
    <div class="footer-content">
      <p>© 2024 CircleCoder 博客</p>
      <p class="icp">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          京ICP备2025135091号
        </a>
      </p>
      <p class="runtime">本站已稳定运行 {{ runtime }}</p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const runtime = ref('')
let timer = null

// 计算运行时间
const calculateRuntime = () => {
  const startDate = new Date('2024-11-01T00:00:00')
  const now = new Date()
  const diff = now - startDate

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  runtime.value = `${days}天${hours}时${minutes}分${seconds}秒`
}

onMounted(() => {
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

<style scoped>
.footer {
  background: transparent;
  border-top: 1px solid var(--color-divider);
  text-align: center;
  padding: 18px 0;
  color: var(--color-grey);
  font-size: 15px;
  margin-top: 32px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.footer-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content p {
  margin: 4px 0;
}

.icp {
  font-weight: bold;
  font-size: 16px;
}

.icp a {
  color: var(--color-grey);
  text-decoration: none;
  transition: color 0.3s ease;
}

.icp a:hover {
  color: #ed6ea0;
}

.runtime {
  font-size: 14px;
  color: #999;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .footer {
    padding: 16px 0;
    margin-top: 24px;
  }

  .footer-content {
    padding: 0 16px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .footer {
    padding: 14px 0;
    margin-top: 16px;
  }

  .footer-content {
    padding: 0 12px;
    font-size: 14px;
  }

  .icp {
    font-size: 15px;
  }

  .runtime {
    font-size: 13px;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .footer {
    padding: 12px 0;
    margin-top: 12px;
  }

  .footer-content {
    padding: 0 8px;
    font-size: 13px;
  }

  .icp {
    font-size: 14px;
  }

  .runtime {
    font-size: 12px;
  }
}
</style>
