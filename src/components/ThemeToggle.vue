<template>
  <button
    @click="handleThemeToggle"
    class="theme-toggle-btn"
    :class="{ simple }"
    :title="`切换到${themeStore.isDark ? '亮色' : '暗色'}模式`"
  >
    <i :class="themeStore.isDark ? 'ic i-moon' : 'ic i-sun'"></i>
  </button>

  <!-- 主题切换动画覆盖层 -->
  <div v-if="showAnimation" class="theme-animation-overlay">
    <div class="animation-container">
      <!-- 天空渐变背景 -->
      <div class="sky-background" :class="currentSkyClass"></div>

      <!-- 太阳 -->
      <div class="celestial-body sun" :class="sunClass">
        <div class="sun-core"></div>
        <div class="sun-rays"></div>
        <div class="sun-glow"></div>
      </div>

      <!-- 月亮 -->
      <div class="celestial-body moon" :class="moonClass">
        <div class="moon-core"></div>
        <div class="moon-craters">
          <div class="crater crater-1"></div>
          <div class="crater crater-2"></div>
          <div class="crater crater-3"></div>
        </div>
        <div class="moon-glow"></div>
      </div>

      <!-- 云朵装饰 -->
      <div class="clouds-container">
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
        <div class="cloud cloud-3"></div>
      </div>

      <!-- 星星 -->
      <div class="stars-container" :class="{ visible: targetIsDark }">
        <div class="star" v-for="i in 20" :key="i" :style="getStarStyle(i)"></div>
      </div>

      <!-- 地平线 -->
      <div class="horizon"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

defineProps({
  simple: {
    type: Boolean,
    default: false,
  },
})

const themeStore = useThemeStore()
const showAnimation = ref(false)
const targetIsDark = ref(false)
const animationPhase = ref('idle') // idle, rising, setting, complete

// 计算天空背景类名
const currentSkyClass = computed(() => {
  let skyClass

  if (animationPhase.value === 'idle') {
    // 静止状态：根据当前主题显示
    skyClass = themeStore.isDark ? 'night' : 'day'
  } else if (animationPhase.value === 'rising') {
    // 动画开始：使用过渡动画类
    if (targetIsDark.value) {
      skyClass = 'day-to-night-anim' // 白天到夜晚的动画
    } else {
      skyClass = 'night-to-day-anim' // 夜晚到白天的动画
    }
  } else if (animationPhase.value === 'setting') {
    // 动画继续：保持过渡动画类
    if (targetIsDark.value) {
      skyClass = 'day-to-night-anim'
    } else {
      skyClass = 'night-to-day-anim'
    }
  } else {
    // 动画完成：显示最终主题的背景色
    skyClass = themeStore.isDark ? 'night' : 'day'
  }

  // 输出天空背景变化
  console.log('🌅 天空背景变化:', {
    phase: animationPhase.value,
    currentTheme: themeStore.isDark ? 'dark' : 'light',
    targetTheme: targetIsDark.value ? 'dark' : 'light',
    skyClass: skyClass,
    description: `背景: ${skyClass === 'night' ? '夜晚深色' : '白天蓝天'}`,
  })

  return skyClass
})

// 计算太阳类名
const sunClass = computed(() => {
  let sunClassValue
  if (animationPhase.value === 'idle') {
    sunClassValue = themeStore.isDark ? 'hidden' : 'visible'
  } else if (animationPhase.value === 'rising') {
    sunClassValue = targetIsDark.value ? 'setting' : 'rising'
  } else if (animationPhase.value === 'setting') {
    sunClassValue = targetIsDark.value ? 'setting' : 'rising'
  } else {
    sunClassValue = 'hidden'
  }

  // 输出太阳状态变化
  console.log('☀️ 太阳状态变化:', {
    phase: animationPhase.value,
    sunClass: sunClassValue,
    position:
      sunClassValue === 'rising'
        ? '从左侧进入'
        : sunClassValue === 'setting'
          ? '向右侧退出'
          : sunClassValue === 'visible'
            ? '居中显示'
            : '隐藏',
  })

  return sunClassValue
})

// 计算月亮类名
const moonClass = computed(() => {
  let moonClassValue
  if (animationPhase.value === 'idle') {
    moonClassValue = themeStore.isDark ? 'visible' : 'hidden'
  } else if (animationPhase.value === 'rising') {
    moonClassValue = targetIsDark.value ? 'rising' : 'setting'
  } else if (animationPhase.value === 'setting') {
    moonClassValue = targetIsDark.value ? 'rising' : 'setting'
  } else {
    moonClassValue = 'hidden'
  }

  // 输出月亮状态变化
  console.log('🌙 月亮状态变化:', {
    phase: animationPhase.value,
    moonClass: moonClassValue,
    position:
      moonClassValue === 'rising'
        ? '从左侧进入'
        : moonClassValue === 'setting'
          ? '向右侧退出'
          : moonClassValue === 'visible'
            ? '居中显示'
            : '隐藏',
  })

  return moonClassValue
})

// 生成星星样式
const getStarStyle = () => {
  const size = Math.random() * 4 + 2
  const top = Math.random() * 60 + 10
  const left = Math.random() * 100
  const delay = Math.random() * 2
  const duration = Math.random() * 1 + 1.5

  return {
    width: `${size}px`,
    height: `${size}px`,
    top: `${top}%`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

// 处理主题切换
const handleThemeToggle = async () => {
  targetIsDark.value = !themeStore.isDark
  showAnimation.value = true
  animationPhase.value = 'rising'

  // 动画开始时禁用滚动
  document.body.style.overflow = 'hidden'

  console.log('🌅 开始主题切换动画:', {
    currentTheme: themeStore.isDark ? 'dark' : 'light',
    targetTheme: targetIsDark.value ? 'dark' : 'light',
    phase: 'rising',
    description: '太阳/月亮开始移动',
  })

  // 等待动画进行到一半时切换主题
  setTimeout(() => {
    console.log('🔄 执行主题切换:', {
      phase: 'setting',
      description: '主题已切换，太阳/月亮继续移动',
      newTheme: !themeStore.isDark ? 'dark' : 'light',
    })
    themeStore.toggleDark()
    animationPhase.value = 'setting'
  }, 1500)

  // 动画完成后清理
  setTimeout(() => {
    console.log('✅ 动画完成:', {
      phase: 'complete',
      description: '动画结束，清理状态',
      finalTheme: themeStore.isDark ? 'dark' : 'light',
    })
    animationPhase.value = 'complete'
    showAnimation.value = false

    // 动画结束时开启滚动
    document.body.style.overflow = ''
  }, 3000)
}
</script>

<style scoped lang="scss" src="@/styles/sfc/components/ThemeToggle.scss"></style>
