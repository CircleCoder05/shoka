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

<style scoped>
.article-calendar {
  margin-bottom: 3rem;
}

.calendar-container {
  position: relative;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.calendar-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

/* 暗色主题下的标题 */
html.dark-theme .calendar-title {
  color: #abb2bf;
}

.year-selector {
  display: flex;
  align-items: center;
}

.year-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.year-btn {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 20px;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.year-btn:hover {
  background: #ed6ea0;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(237, 110, 160, 0.3);
}

.year-btn.active {
  background: #ed6ea0;
  color: #fff;
  border-color: #ed6ea0;
  box-shadow: 0 4px 12px rgba(237, 110, 160, 0.3);
}

/* 暗色主题下的年份按钮 */
html.dark-theme .year-btn {
  background: #3e4451;
  color: #abb2bf;
  border-color: #3e4451;
}

html.dark-theme .year-btn:hover {
  background: #ed6ea0;
  color: #fff;
  border-color: #ed6ea0;
}

html.dark-theme .year-btn.active {
  background: #ed6ea0 !important;
  color: #fff !important;
  border-color: #ed6ea0 !important;
  box-shadow: 0 4px 12px rgba(237, 110, 160, 0.3) !important;
}

.calendar-title i {
  color: #ed6ea0;
  font-size: 1.3rem;
}

.calendar-chart {
  width: 100%;
  height: 240px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar-container {
    padding: 1.5rem;
  }

  .calendar-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .calendar-title {
    font-size: 1.3rem;
    justify-content: center;
  }

  .year-selector {
    justify-content: center;
  }

  .year-buttons {
    justify-content: center;
  }

  .calendar-chart {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    padding: 1rem;
  }

  .calendar-title {
    font-size: 1.2rem;
  }

  .year-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .calendar-chart {
    height: 180px;
  }
}
</style>
