<template>
  <div class="article-calendar">
    <div class="calendar-container">
      <div class="calendar-header">
        <h2 class="calendar-title">
          <i class="ic i-calendar"></i>
          文章日历
        </h2>
        <div class="year-selector">
          <div class="year-buttons">
            <button
              v-for="(year, index) in availableYears"
              :key="year"
              @click="selectYear(index)"
              class="year-btn"
              :class="{ active: currentYearIndex === index }"
            >
              {{ year }}年
            </button>
          </div>
        </div>
      </div>
      <div ref="calendarChart" class="calendar-chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
})

const calendarChart = ref(null)
let chartInstance = null

// 主题相关
const themeStore = useThemeStore()

// 年份切换相关
const currentYearIndex = ref(0)
const availableYears = ref([])

// 根据主题获取图表配置
const getThemeConfig = computed(() => {
  if (themeStore.isDark) {
    return {
      // 暗色主题配置
      visualMapPieces: [
        { min: 0, max: 0, color: '#3e4451', label: '0' },
        { min: 1, max: 1, color: '#ed6ea0', label: '1' },
        { min: 2, max: 2, color: '#ec8c69', label: '2' },
        { min: 3, max: 3, color: '#d63384', label: '3' },
        { min: 4, max: 999, color: '#b02a5b', label: '≥4' },
      ],
      textColor: '#abb2bf',
      borderColor: '#3e4451',
      tooltipBg: '#2c313c',
    }
  } else {
    return {
      // 亮色主题配置
      visualMapPieces: [
        { min: 0, max: 0, color: '#ebedf0', label: '0' },
        { min: 1, max: 1, color: '#9be9a8', label: '1' },
        { min: 2, max: 2, color: '#40c463', label: '2' },
        { min: 3, max: 3, color: '#30a14e', label: '3' },
        { min: 4, max: 999, color: '#216e39', label: '≥4' },
      ],
      textColor: '#666',
      borderColor: '#fff',
      tooltipBg: '#fff',
    }
  }
})

// 获取可用年份列表
const getAvailableYears = () => {
  const years = new Set()
  props.articles.forEach((article) => {
    const year = new Date(article.date).getFullYear()
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a) // 降序排列
}

// 生成日历数据
const generateCalendarData = (year) => {
  const data = []
  const articleCounts = {}

  // 统计每天的文章数量
  props.articles.forEach((article) => {
    const date = new Date(article.date)
    const dateStr = date.toISOString().split('T')[0]
    articleCounts[dateStr] = (articleCounts[dateStr] || 0) + 1
  })

  // 生成指定年份的数据
  const startDate = new Date(`${year}-01-01`)
  const endDate = new Date(`${year}-12-31`)

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const count = articleCounts[dateStr] || 0
    data.push([dateStr, count])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return data
}

// 年份选择方法
const selectYear = (index) => {
  currentYearIndex.value = index
  updateChart()
}

// 初始化图表
const initChart = () => {
  if (!calendarChart.value) return

  // 获取可用年份
  availableYears.value = getAvailableYears()
  if (availableYears.value.length === 0) return

  chartInstance = echarts.init(calendarChart.value)

  const currentYear = availableYears.value[currentYearIndex.value]

  const themeConfig = getThemeConfig.value

  const option = {
    tooltip: {
      position: 'top',
      backgroundColor: themeConfig.tooltipBg,
      borderColor: themeConfig.borderColor,
      textStyle: {
        color: themeConfig.textColor,
      },
      formatter: function (p) {
        const date = new Date(p.data[0])
        const count = p.data[1]
        const dateStr = date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        return `${dateStr}<br/>发表了 ${count} 篇文章`
      },
    },
    visualMap: {
      type: 'piecewise',
      min: 0,
      max: 4,
      orient: 'horizontal',
      left: 'center',
      bottom: '15px',
      pieces: themeConfig.visualMapPieces,
      textStyle: {
        fontSize: 12,
        color: themeConfig.textColor,
      },
      itemWidth: 15,
      itemHeight: 15,
      itemGap: 8,
    },
    calendar: {
      top: 60,
      left: 30,
      right: 30,
      cellSize: ['auto', 13],
      range: currentYear.toString(),
      itemStyle: {
        borderWidth: 0.5,
        borderColor: themeConfig.borderColor,
      },
      yearLabel: { show: false },
      dayLabel: {
        nameMap: 'cn',
        fontSize: 11,
        color: themeConfig.textColor,
      },
      monthLabel: {
        nameMap: 'cn',
        fontSize: 12,
        color: themeConfig.textColor,
      },
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: generateCalendarData(currentYear),
      itemStyle: {
        borderRadius: 2,
      },
    },
  }

  chartInstance.setOption(option)
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || availableYears.value.length === 0) return

  const currentYear = availableYears.value[currentYearIndex.value]

  const option = {
    calendar: {
      range: currentYear.toString(),
    },
    series: {
      data: generateCalendarData(currentYear),
    },
  }

  chartInstance.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

// 监听数据变化
watch(
  () => props.articles,
  () => {
    // 重新获取可用年份并初始化
    availableYears.value = getAvailableYears()
    if (availableYears.value.length > 0) {
      currentYearIndex.value = 0 // 重置到最新年份
      initChart()
    }
  },
  { deep: true },
)

// 监听主题变化
watch(
  () => themeStore.isDark,
  () => {
    // 主题变化时重新初始化图表
    if (chartInstance) {
      initChart()
    }
  },
)

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss" src="@/styles/sfc/views/archives/ArticleCalendar.scss"></style>
