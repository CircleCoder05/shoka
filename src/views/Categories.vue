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

<style scoped lang="scss" src="@/styles/sfc/views/Categories.scss"></style>
