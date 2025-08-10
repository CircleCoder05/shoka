<template>
  <button
    @click="handleThemeToggle"
    class="theme-toggle-btn"
    :title="`切换到${themeStore.isDark ? '亮色' : '暗色'}模式`"
  >
    <i :class="themeStore.isDark ? 'ic i-sun' : 'ic i-moon'"></i>
    <span class="theme-text">{{ themeStore.isDark ? '亮色' : '暗色' }}</span>
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
  }, 3000)
}
</script>

<style scoped>
.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.theme-text {
  font-weight: 500;
  white-space: nowrap;
}

.ic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.i-sun::before {
  content: '☀️';
}

.i-moon::before {
  content: '🌙';
}

/* 移动端适配 */
@media (max-width: 768px) {
  .theme-toggle-btn {
    padding: 6px 10px;
    font-size: 13px;
  }

  .theme-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .theme-toggle-btn {
    padding: 6px;
    min-width: 32px;
    justify-content: center;
  }
}

/* 动画覆盖层 */
.theme-animation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
}

.animation-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 天空背景 */
.sky-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.sky-background.day {
  background: linear-gradient(
    180deg,
    #87ceeb 0%,
    #98d8e8 25%,
    #b0e0e6 50%,
    #f0e68c 75%,
    #ffb347 100%
  );
}

.sky-background.night {
  background: linear-gradient(
    180deg,
    #0c0c1e 0%,
    #1a1a2e 25%,
    #16213e 50%,
    #0f3460 75%,
    #0a1929 100%
  );
}

/* 白天到夜晚的动画背景 */
.sky-background.day-to-night-anim {
  --color1: #87ceeb;
  --color2: #98d8e8;
  --color3: #b0e0e6;
  --color4: #f0e68c;
  --color5: #ffb347;
  background: linear-gradient(
    180deg,
    var(--color1) 0%,
    var(--color2) 25%,
    var(--color3) 50%,
    var(--color4) 75%,
    var(--color5) 100%
  );
  animation: dayToNightVars 3s ease-in-out forwards;
}

/* 夜晚到白天的动画背景 */
.sky-background.night-to-day-anim {
  --color1: #0c0c1e;
  --color2: #1a1a2e;
  --color3: #16213e;
  --color4: #0f3460;
  --color5: #0a1929;
  background: linear-gradient(
    180deg,
    var(--color1) 0%,
    var(--color2) 25%,
    var(--color3) 50%,
    var(--color4) 75%,
    var(--color5) 100%
  );
  animation: nightToDayVars 3s ease-in-out forwards;
}

/* 天体基础样式 */
.celestial-body {
  position: absolute;
  transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 太阳样式 */
.sun {
  width: 120px;
  height: 120px;
  left: 50%;
  top: 20%;
  transform: translate(-50%, 0%);
}

.sun.hidden {
  left: -100px;
  opacity: 0;
}

.sun.rising {
  left: 50%;
  top: 20%;
  opacity: 1;
  animation: sunRise 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sun.setting {
  left: 100%;
  top: 50%;
  opacity: 0;
  animation: sunSet 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sun-core {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #ffd700 0%, #ffa500 100%);
  border-radius: 50%;
  position: relative;
  animation: sunPulse 3s ease-in-out infinite;
}

.sun-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
}

.sun-rays::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 4px;
  height: 120px;
  background: linear-gradient(to bottom, #ffd700, transparent);
  transform: translateX(-50%);
  border-radius: 2px;
  box-shadow:
    0 0 0 0 #ffd700,
    60px 0 0 0 #ffd700,
    -60px 0 0 0 #ffd700,
    42px 42px 0 0 #ffd700,
    -42px 42px 0 0 #ffd700,
    42px -42px 0 0 #ffd700,
    -42px -42px 0 0 #ffd700,
    0 60px 0 0 #ffd700,
    0 -60px 0 0 #ffd700;
  animation: sunRaysRotate 10s linear infinite;
}

.sun-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: sunGlow 3s ease-in-out infinite;
}

/* 月亮样式 */
.moon {
  width: 100px;
  height: 100px;
  left: 50%;
  top: 20%;
  transform: translate(-50%, 0%);
}

.moon.hidden {
  left: -100px;
  opacity: 0;
}

.moon.rising {
  left: 50%;
  top: 20%;
  opacity: 1;
  animation: moonRise 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.moon.setting {
  left: 100%;
  top: 50%;
  opacity: 0;
  animation: moonSet 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.moon-core {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, #f8f8ff 0%, #e6e6fa 100%);
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 30px rgba(248, 248, 255, 0.6);
}

.moon-craters {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.crater {
  position: absolute;
  background: #d3d3d3;
  border-radius: 50%;
}

.crater-1 {
  width: 18px;
  height: 18px;
  top: 20%;
  left: 40%;
}

.crater-2 {
  width: 12px;
  height: 12px;
  top: 35%;
  right: 25%;
}

.crater-3 {
  width: 15px;
  height: 15px;
  bottom: 25%;
  left: 30%;
}

.moon-glow {
  position: absolute;
  top: -15px;
  left: -15px;
  width: 130px;
  height: 130px;
  background: radial-gradient(circle, rgba(248, 248, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
}

/* 云朵 */
.clouds-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50px;
  opacity: 0.8;
  animation: cloudFloat 20s ease-in-out infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50px;
}

.cloud-1 {
  width: 100px;
  height: 50px;
  top: 30%;
  left: 15%;
  animation-delay: 0s;
}

.cloud-1::before {
  width: 60px;
  height: 60px;
  top: -30px;
  left: 15px;
}

.cloud-1::after {
  width: 70px;
  height: 50px;
  top: -20px;
  right: 15px;
}

.cloud-2 {
  width: 80px;
  height: 40px;
  top: 45%;
  right: 20%;
  animation-delay: 5s;
}

.cloud-2::before {
  width: 50px;
  height: 50px;
  top: -25px;
  left: 10px;
}

.cloud-2::after {
  width: 60px;
  height: 40px;
  top: -15px;
  right: 10px;
}

.cloud-3 {
  width: 90px;
  height: 45px;
  top: 60%;
  left: 25%;
  animation-delay: 10s;
}

.cloud-3::before {
  width: 55px;
  height: 55px;
  top: -27px;
  left: 12px;
}

.cloud-3::after {
  width: 65px;
  height: 45px;
  top: -18px;
  right: 12px;
}

/* 星星 */
.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.stars-container.visible {
  opacity: 1;
}

.star {
  position: absolute;
  background: #fff;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  animation: starTwinkle 2s ease-in-out infinite;
}

/* 地平线 */
.horizon {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20%;
  background: linear-gradient(
    to top,
    rgba(139, 69, 19, 0.8) 0%,
    rgba(160, 82, 45, 0.6) 50%,
    transparent 100%
  );
  opacity: 0.7;
}

/* 动画关键帧 */
@keyframes sunRise {
  0% {
    left: -100px;
    top: 50%;
    opacity: 0;
    transform: translate(0, -50%);
  }
  100% {
    left: 50%;
    top: 20%;
    opacity: 1;
    transform: translate(-50%, 0%);
  }
}

@keyframes sunSet {
  0% {
    left: 50%;
    top: 20%;
    opacity: 1;
    transform: translate(-50%, 0%);
  }
  100% {
    left: 100%;
    top: 50%;
    opacity: 0;
    transform: translate(0, -50%);
  }
}

@keyframes moonRise {
  0% {
    left: -100px;
    top: 50%;
    opacity: 0;
    transform: translate(0, -50%);
  }
  100% {
    left: 50%;
    top: 20%;
    opacity: 1;
    transform: translate(-50%, 0%);
  }
}

@keyframes moonSet {
  0% {
    left: 50%;
    top: 20%;
    opacity: 1;
    transform: translate(-50%, 0%);
  }
  100% {
    left: 100%;
    top: 50%;
    opacity: 0;
    transform: translate(0, -50%);
  }
}

@keyframes sunPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes sunRaysRotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes sunGlow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

@keyframes cloudFloat {
  0%,
  100% {
    transform: translateX(0px);
  }
  50% {
    transform: translateX(40px);
  }
}

@keyframes starTwinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

/* 白天到夜晚的CSS变量动画 */
@keyframes dayToNightVars {
  0% {
    --color1: #87ceeb;
    --color2: #98d8e8;
    --color3: #b0e0e6;
    --color4: #f0e68c;
    --color5: #ffb347;
  }
  100% {
    --color1: #0c0c1e;
    --color2: #1a1a2e;
    --color3: #16213e;
    --color4: #0f3460;
    --color5: #0a1929;
  }
}

/* 夜晚到白天的CSS变量动画 */
@keyframes nightToDayVars {
  0% {
    --color1: #0c0c1e;
    --color2: #1a1a2e;
    --color3: #16213e;
    --color4: #0f3460;
    --color5: #0a1929;
  }
  100% {
    --color1: #87ceeb;
    --color2: #98d8e8;
    --color3: #b0e0e6;
    --color4: #f0e68c;
    --color5: #ffb347;
  }
}
</style>
