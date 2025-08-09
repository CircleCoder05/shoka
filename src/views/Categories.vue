<template>
  <PageContainer>
    <div class="page-header">
      <h1 class="page-title">文章分类</h1>
      <p class="page-subtitle">按主题分类整理的文章</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else class="categories-content">
      <!-- 图表展示区域 -->
      <div class="charts-section">
        <div class="chart-container">
          <div class="chart-header">
            <h3>分类分布</h3>
            <p>各分类文章数量占比</p>
          </div>
          <div ref="pieChartRef" class="chart"></div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <h3>分类排行</h3>
            <p>按文章数量排序</p>
          </div>
          <div ref="barChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 分类卡片网格 -->
      <div class="categories-section">
        <div class="section-header">
          <h3>所有分类</h3>
          <p>点击查看详细文章</p>
        </div>

        <div class="categories-grid">
          <div
            v-for="category in sortedCategories"
            :key="category.slug"
            class="category-card"
            @click="selectCategory(category.name)"
          >
            <div class="category-icon">
              <i class="ic i-flag"></i>
            </div>
            <div class="category-info">
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-count">{{ category.count }} 篇文章</p>
              <div class="category-progress">
                <div
                  class="progress-bar"
                  :style="{ width: getProgressPercentage(category.count) + '%' }"
                ></div>
              </div>
            </div>
            <div class="category-arrow">
              <i class="ic i-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStatisticsStore } from '@/stores/statistics'
import { useThemeStore } from '@/stores/theme'
import PageContainer from '@/components/PageContainer.vue'
import * as echarts from 'echarts'

const router = useRouter()
const statisticsStore = useStatisticsStore()
const themeStore = useThemeStore()

const loading = computed(() => statisticsStore.loading)
const error = computed(() => statisticsStore.error)

// 主题配置
const getThemeConfig = computed(() => {
  if (themeStore.isDark) {
    return {
      textColor: '#abb2bf',
      backgroundColor: '#2c313c',
      borderColor: '#3e4451',
      tooltipBg: '#2c313c',
      tooltipBorder: '#3e4451',
      splitLineColor: '#3e4451',
      axisLineColor: '#3e4451',
    }
  } else {
    return {
      textColor: '#666',
      backgroundColor: '#fff',
      borderColor: '#ddd',
      tooltipBg: '#fff',
      tooltipBorder: '#ddd',
      splitLineColor: '#f0f0f0',
      axisLineColor: '#ddd',
    }
  }
})

// 处理分类数据，将uncategorized改为未分类，并按数量排序
const sortedCategories = computed(() => {
  const categories = statisticsStore.categoriesWithCount.map((category) => ({
    ...category,
    name: category.name === 'uncategorized' ? '未分类' : category.name,
  }))

  return categories.sort((a, b) => b.count - a.count)
})

// 图表引用
const pieChartRef = ref(null)
const barChartRef = ref(null)
let pieChart = null
let barChart = null

const getProgressPercentage = (count) => {
  const maxCount = Math.max(...sortedCategories.value.map((c) => c.count))
  return (count / maxCount) * 100
}

const selectCategory = (categoryName) => {
  router.push(`/category/${categoryName}`)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)

  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  const themeConfig = getThemeConfig.value

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: themeConfig.tooltipBg,
      borderColor: themeConfig.tooltipBorder,
      textStyle: {
        color: themeConfig.textColor,
      },
    },
    legend: {
      orient: isMobile ? 'horizontal' : 'vertical',
      left: isMobile ? 'center' : 'left',
      top: isMobile ? 'bottom' : 'middle',
      textStyle: {
        fontSize: isSmallMobile ? 10 : 12,
        color: themeConfig.textColor,
      },
      type: 'scroll',
      pageButtonPosition: 'end',
      pageButtonGap: 5,
      pageButtonItemGap: 5,
      pageIconColor: '#ed6ea0',
      pageIconInactiveColor: themeStore.isDark ? '#5c6370' : '#ccc',
      pageTextStyle: {
        color: themeConfig.textColor,
      },
    },
    series: [
      {
        name: '文章数量',
        type: 'pie',
        radius: isMobile ? ['30%', '60%'] : ['40%', '70%'],
        center: isMobile ? ['50%', '40%'] : ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: isSmallMobile ? '14' : '18',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: sortedCategories.value.map((category) => ({
          name: category.name,
          value: category.count,
        })),
      },
    ],
    color: [
      '#ed6ea0',
      '#ec8c69',
      '#f7186a',
      '#fbb03b',
      '#f39c12',
      '#e67e22',
      '#e74c3c',
      '#9b59b6',
      '#3498db',
      '#1abc9c',
    ],
  }

  pieChart.setOption(option)
}

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) return

  barChart = echarts.init(barChartRef.value)

  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  const themeConfig = getThemeConfig.value

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: themeConfig.tooltipBg,
      borderColor: themeConfig.tooltipBorder,
      textStyle: {
        color: themeConfig.textColor,
      },
    },
    grid: {
      left: isMobile ? '8%' : '3%',
      right: isMobile ? '8%' : '4%',
      bottom: isMobile ? '25%' : '15%',
      top: isMobile ? '15%' : '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: sortedCategories.value.map((c) => c.name),
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        rotate: isMobile ? 90 : 45,
        fontSize: isSmallMobile ? 10 : 12,
        interval: 0,
        textStyle: {
          color: themeConfig.textColor,
        },
      },
      axisLine: {
        lineStyle: {
          color: themeConfig.axisLineColor,
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '文章数量',
      nameTextStyle: {
        color: themeConfig.textColor,
        fontSize: isSmallMobile ? 10 : 12,
      },
      axisLabel: {
        fontSize: isSmallMobile ? 10 : 12,
        color: themeConfig.textColor,
      },
      axisLine: {
        lineStyle: {
          color: themeConfig.axisLineColor,
        },
      },
      splitLine: {
        lineStyle: {
          color: themeConfig.splitLineColor,
        },
      },
    },
    series: [
      {
        name: '文章数量',
        type: 'bar',
        barWidth: isMobile ? '50%' : '60%',
        data: sortedCategories.value.map((c) => ({
          value: c.count,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ed6ea0' },
              { offset: 1, color: '#ec8c69' },
            ]),
          },
        })),
      },
    ],
  }

  barChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  // 重新初始化图表以适应新的屏幕尺寸
  if (pieChart) {
    pieChart.dispose()
    initPieChart()
  }
  if (barChart) {
    barChart.dispose()
    initBarChart()
  }
}

// 更新图表数据
const updateCharts = () => {
  if (pieChart) {
    const pieOption = pieChart.getOption()
    pieOption.series[0].data = sortedCategories.value.map((category) => ({
      name: category.name,
      value: category.count,
    }))
    pieChart.setOption(pieOption)
  }

  if (barChart) {
    const barOption = barChart.getOption()
    barOption.xAxis.data = sortedCategories.value.map((c) => c.name)
    barOption.series[0].data = sortedCategories.value.map((c) => ({
      value: c.count,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#ed6ea0' },
          { offset: 1, color: '#ec8c69' },
        ]),
      },
    }))
    barChart.setOption(barOption)
  }
}

// 监听数据变化
watch(
  sortedCategories,
  () => {
    updateCharts()
  },
  { deep: true },
)

// 监听主题变化
watch(
  () => themeStore.isDark,
  () => {
    // 重新初始化图表以应用新主题
    if (pieChart) {
      pieChart.dispose()
      initPieChart()
    }
    if (barChart) {
      barChart.dispose()
      initBarChart()
    }
  },
)

onMounted(async () => {
  if (statisticsStore.archives.length === 0) {
    await statisticsStore.loadStatistics()
  }

  // 等待DOM更新后初始化图表
  await nextTick()
  initPieChart()
  initBarChart()

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (pieChart) {
    pieChart.dispose()
  }
  if (barChart) {
    barChart.dispose()
  }
})
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
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  width: 100%;
  overflow: hidden;
}

.chart-container {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(237, 110, 160, 0.1);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.chart-header {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.chart-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.chart-header p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.chart {
  height: 300px;
  width: 100%;
  flex: 1;
  min-height: 0;
}

/* 分类区域 */
.categories-section {
  margin-bottom: 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(237, 110, 160, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(237, 110, 160, 0.15);
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-count {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.category-progress {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.category-arrow {
  color: #ccc;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.category-card:hover .category-arrow {
  color: #ed6ea0;
  transform: translateX(4px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-section {
    gap: 1.5rem;
  }

  .chart-container {
    min-height: 350px;
  }

  .chart {
    height: 280px;
  }
}

@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .chart-container {
    min-height: 320px;
  }

  .chart {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .charts-section {
    gap: 1rem;
    padding: 0;
    margin: 0 -0.5rem 3rem -0.5rem;
  }

  .chart-container {
    padding: 1rem;
    min-height: 300px;
    margin: 0 0.5rem;
    width: calc(100% - 1rem);
  }

  .chart-header h3 {
    font-size: 1.1rem;
  }

  .chart-header p {
    font-size: 0.85rem;
  }

  .chart {
    height: 220px;
    width: 100%;
    max-width: 100%;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .category-card {
    padding: 1rem;
  }

  .category-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .category-name {
    font-size: 1.1rem;
  }

  .modal-content {
    margin: 1rem;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .article-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .article-date {
    min-width: auto;
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .charts-section {
    margin: 0 -0.8rem 3rem -0.8rem;
  }

  .chart-container {
    padding: 0.8rem;
    min-height: 280px;
    margin: 0 0.8rem;
    width: calc(100% - 1.6rem);
  }

  .chart {
    height: 200px;
    width: 100%;
    max-width: 100%;
  }

  .chart-header h3 {
    font-size: 1rem;
  }

  .chart-header p {
    font-size: 0.8rem;
  }
}

@media (max-width: 360px) {
  .chart-container {
    min-height: 250px;
  }

  .chart {
    height: 180px;
  }
}

/* 暗色主题样式 */
html.dark-theme .page-title {
  color: #abb2bf;
}

html.dark-theme .page-subtitle {
  color: #7f848e;
}

html.dark-theme .chart-container {
  background: #2c313c !important;
  border-color: #3e4451 !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

html.dark-theme .chart-header h3 {
  color: #abb2bf !important;
}

html.dark-theme .chart-header p {
  color: #7f848e !important;
}

html.dark-theme .section-header h3 {
  color: #abb2bf !important;
}

html.dark-theme .section-header p {
  color: #7f848e !important;
}

html.dark-theme .category-card {
  background: linear-gradient(135deg, #2c313c 0%, #383e4a 100%) !important;
  border-color: #3e4451 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

html.dark-theme .category-card:hover {
  box-shadow: 0 8px 30px rgba(237, 110, 160, 0.3) !important;
}

html.dark-theme .category-name {
  color: #abb2bf !important;
}

html.dark-theme .category-count {
  color: #7f848e !important;
}

html.dark-theme .category-progress {
  background: #3e4451 !important;
}

html.dark-theme .category-arrow {
  color: #5c6370 !important;
}

html.dark-theme .category-card:hover .category-arrow {
  color: #ed6ea0 !important;
}

/* 分类卡片旗子图标改为白色 */
html.dark-theme .category-icon {
  color: #fff !important;
}
</style>
