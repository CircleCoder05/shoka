<template>
  <div class="archives-page">
    <div class="archives-container">
      <!-- 时间轴 -->
      <div class="timeline-wrapper">
        <div class="timeline">
          <div class="timeline-line"></div>

          <!-- 所有文章列表 -->
          <div class="articles-container">
            <template v-for="(article, index) in statisticsStore.archives" :key="article.slug">
              <!-- 年份标记（独立item） -->
              <div v-if="shouldShowYear(article, index)" class="article-timeline-item year-item">
                <div class="timeline-node">
                  <div class="node-dot"></div>
                  <div class="node-line"></div>
                </div>
                <div class="year-marker">
                  <h2 class="year-text">{{ new Date(article.date).getFullYear() }}</h2>
                  <button
                    class="collapse-btn year-collapse-btn"
                    @click="toggleYearCollapse(new Date(article.date).getFullYear())"
                    :class="{ collapsed: isYearCollapsed(new Date(article.date).getFullYear()) }"
                  >
                    <i
                      class="ic i-arrow-down"
                      :class="{ rotated: !isYearCollapsed(new Date(article.date).getFullYear()) }"
                    ></i>
                  </button>
                </div>
              </div>

              <!-- 月份标记（独立item） -->
              <transition name="month-fade" mode="out-in">
                <div
                  v-if="
                    shouldShowMonth(article, index) &&
                    !isYearCollapsed(new Date(article.date).getFullYear())
                  "
                  class="article-timeline-item month-item"
                  key="month-visible"
                >
                  <div class="timeline-node">
                    <div class="node-dot"></div>
                    <div class="node-line"></div>
                  </div>
                  <div class="month-marker">
                    <span class="month-text">{{
                      getMonthName(new Date(article.date).getMonth() + 1)
                    }}</span>
                    <button
                      class="collapse-btn month-collapse-btn"
                      @click="
                        toggleMonthCollapse(
                          new Date(article.date).getFullYear(),
                          new Date(article.date).getMonth() + 1,
                        )
                      "
                      :class="{
                        collapsed: isMonthCollapsed(
                          new Date(article.date).getFullYear(),
                          new Date(article.date).getMonth() + 1,
                        ),
                      }"
                    >
                      <i
                        class="ic i-arrow-down"
                        :class="{
                          rotated: !isMonthCollapsed(
                            new Date(article.date).getFullYear(),
                            new Date(article.date).getMonth() + 1,
                          ),
                        }"
                      ></i>
                    </button>
                  </div>
                </div>
              </transition>

              <!-- 文章卡片（独立item） -->
              <div
                class="article-timeline-item article-item"
                :class="{
                  collapsed: isArticleCollapsed(article),
                  'year-collapsed': isYearCollapsed(new Date(article.date).getFullYear()),
                  'month-collapsed': isMonthCollapsed(
                    new Date(article.date).getFullYear(),
                    new Date(article.date).getMonth() + 1,
                  ),
                }"
              >
                <div class="timeline-node">
                  <div class="node-dot"></div>
                  <div class="node-line"></div>
                </div>
                <TimelineArticleCard :article="article" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import TimelineArticleCard from '@/components/TimelineArticleCard.vue'

const statisticsStore = useStatisticsStore()

const getMonthName = (month) => {
  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ]
  return monthNames[month - 1]
}

// 判断是否应该显示年份标记
const shouldShowYear = (article, index) => {
  if (index === 0) return true // 第一个文章一定是年份标记
  const currentYear = new Date(article.date).getFullYear()
  const previousYear = new Date(statisticsStore.archives[index - 1].date).getFullYear()
  return currentYear !== previousYear
}

// 判断是否应该显示月份标记
const shouldShowMonth = (article, index) => {
  if (index === 0) return true // 第一个文章一定是月份标记
  const currentDate = new Date(article.date)
  const previousDate = new Date(statisticsStore.archives[index - 1].date)
  const currentYear = currentDate.getFullYear()
  const previousYear = previousDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const previousMonth = previousDate.getMonth() + 1

  // 如果是新的一年，或者同一年但月份不同
  return (
    currentYear !== previousYear || (currentYear === previousYear && currentMonth !== previousMonth)
  )
}

// 折叠状态
const yearCollapseState = ref({})
const monthCollapseState = ref({})
const articleCollapseState = ref({})

const toggleYearCollapse = (year) => {
  yearCollapseState.value[year] = !yearCollapseState.value[year]
}

const isYearCollapsed = (year) => {
  return yearCollapseState.value[year] ?? false
}

const toggleMonthCollapse = (year, month) => {
  monthCollapseState.value[`${year}-${month}`] = !monthCollapseState.value[`${year}-${month}`]
}

const isMonthCollapsed = (year, month) => {
  return monthCollapseState.value[`${year}-${month}`] ?? false
}

const isArticleCollapsed = (article) => {
  return articleCollapseState.value[article.slug] ?? false
}

onMounted(async () => {
  if (statisticsStore.archives.length === 0) {
    await statisticsStore.loadStatistics()
  }
})
</script>

<style scoped>
.archives-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.archives-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
}

.archives-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ed6ea0 0%, #ec8c69 100%);
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

/* 文章容器动画 */
.articles-container {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* 时间轴容器 */
.timeline-wrapper {
  position: relative;
  padding: 2rem 0;
}

/* 时间轴样式优化 */
.timeline {
  position: relative;
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.timeline-line {
  position: absolute;
  left: 80px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, transparent 0%, #ed6ea0 20%, #ed6ea0 80%, transparent 100%);
  border-radius: 2px;
  box-shadow: 0 0 20px rgba(237, 110, 160, 0.3);
  animation: timelineGlow 3s ease-in-out infinite alternate;
}

@keyframes timelineGlow {
  0% {
    box-shadow: 0 0 20px rgba(237, 110, 160, 0.3);
  }
  100% {
    box-shadow: 0 0 30px rgba(237, 110, 160, 0.6);
  }
}

.timeline-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #ed6ea0;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(237, 110, 160, 0.5);
  animation: particlePulse 2s ease-in-out infinite;
}

.timeline-line::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #ed6ea0;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(237, 110, 160, 0.5);
  animation: particlePulse 2s ease-in-out infinite 1s;
}

@keyframes particlePulse {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) scale(1.5);
    opacity: 0.7;
  }
}

/* 年份标记 */
.year-marker {
  width: 100%;
  max-width: 100%;
  padding: 1rem 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  justify-content: space-between;
}

.year-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: titleGlow 3s ease-in-out infinite alternate;
}

/* 月份标记 */
.month-marker {
  width: 100%;
  max-width: 100%;
  padding: 0.8rem 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  justify-content: space-between;
}

.month-text {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ed6ea0;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* 文章时间轴项目 */
.article-timeline-item {
  position: relative;
  margin-bottom: 3rem;
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding-left: 140px;
  padding-right: 2rem;
  box-sizing: border-box;
}

.timeline-node {
  position: absolute;
  left: 80px;
  top: 50px;
  transform: translateX(-50%);
  z-index: 10;
  width: 20px;
  height: 20px;
}

.node-dot {
  width: 16px;
  height: 16px;
  background: #fff;
  border: 3px solid #ed6ea0;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(237, 110, 160, 0.4);
  position: relative;
  animation: nodePulse 3s ease-in-out infinite;
}

@keyframes nodePulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba(237, 110, 160, 0.4);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 25px rgba(237, 110, 160, 0.7);
  }
}

.node-dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: #ed6ea0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.node-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 120px;
  background: linear-gradient(180deg, #ed6ea0 0%, transparent 100%);
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px rgba(237, 110, 160, 0.3);
  animation: nodeLineGlow 2s ease-in-out infinite;
}

@keyframes nodeLineGlow {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(237, 110, 160, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(237, 110, 160, 0.6);
  }
}

/* 文章内容区域 */
.article-content {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  flex: 1;
  max-width: calc(100% - 1rem);
}

/* 时间轴节点折叠动画 */
.timeline-node {
  position: absolute;
  left: 80px;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  width: 20px;
  height: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-timeline-item.collapsed .timeline-node,
.article-timeline-item.year-collapsed .timeline-node,
.article-timeline-item.month-collapsed .timeline-node {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}

/* 节点圆点折叠动画 */
.node-dot {
  width: 16px;
  height: 16px;
  background: #fff;
  border: 3px solid #ed6ea0;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(237, 110, 160, 0.4);
  position: relative;
  animation: nodePulse 3s ease-in-out infinite;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-timeline-item.collapsed .node-dot,
.article-timeline-item.year-collapsed .node-dot,
.article-timeline-item.month-collapsed .node-dot {
  border-color: rgba(237, 110, 160, 0.3);
  box-shadow: 0 0 5px rgba(237, 110, 160, 0.2);
  transform: scale(0.8);
}

/* 节点连接线折叠动画 */
.node-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 120px;
  background: linear-gradient(180deg, #ed6ea0 0%, transparent 100%);
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px rgba(237, 110, 160, 0.3);
  animation: nodeLineGlow 2s ease-in-out infinite;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-timeline-item.collapsed .node-line,
.article-timeline-item.year-collapsed .node-line,
.article-timeline-item.month-collapsed .node-line {
  height: 0;
  opacity: 0;
  box-shadow: 0 0 2px rgba(237, 110, 160, 0.1);
}

/* 折叠按钮样式 */
.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
  color: #ed6ea0;
  font-size: 1.2rem;
}

.collapse-btn:hover {
  background: rgba(237, 110, 160, 0.1);
  transform: scale(1.1);
}

.collapse-btn i {
  transition: transform 0.3s ease;
}

.collapse-btn i.rotated {
  transform: rotate(180deg);
}

.year-collapse-btn {
  font-size: 1.5rem;
}

.month-collapse-btn {
  font-size: 1.2rem;
}

/* 折叠动画 */
.article-timeline-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform-origin: top;
  position: relative;
  margin-bottom: 2rem;
}

.article-timeline-item.collapsed,
.article-timeline-item.year-collapsed,
.article-timeline-item.month-collapsed {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding: 0;
  transform: scaleY(0) translateY(-20px);
  transform-origin: top;
  pointer-events: none;
}

/* 年份item样式 */
.year-item {
  min-height: 80px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.year-item.collapsed,
.year-item.year-collapsed {
  min-height: 0;
  margin-bottom: 0;
}

.year-item .timeline-node {
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 月份item样式 */
.month-item {
  min-height: 60px;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.month-item.collapsed,
.month-item.month-collapsed {
  min-height: 0;
  margin-bottom: 0;
}

.month-item .timeline-node {
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 文章item样式 */
.article-item {
  margin-bottom: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-item.collapsed,
.article-item.year-collapsed,
.article-item.month-collapsed {
  margin-bottom: 0;
}

/* 月份淡入淡出动画 */
.month-fade-enter-active,
.month-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.month-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.8);
  max-height: 0;
}

.month-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.8);
  max-height: 0;
}

.month-fade-enter-to,
.month-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
  max-height: 80px;
}

/* 年份和月份标记的折叠按钮位置调整 */
.year-marker {
  width: 100%;
  max-width: 100%;
  padding: 1rem 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  justify-content: space-between;
}

.year-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: titleGlow 3s ease-in-out infinite alternate;
}

/* 月份标记 */
.month-marker {
  width: 100%;
  max-width: 100%;
  padding: 0.8rem 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  justify-content: space-between;
}

.month-text {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ed6ea0;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
