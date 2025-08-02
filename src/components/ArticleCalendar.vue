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
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
})

const calendarChart = ref(null)
let chartInstance = null

// 年份切换相关
const currentYearIndex = ref(0)
const availableYears = ref([])

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

  const option = {
    tooltip: {
      position: 'top',
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
      pieces: [
        { min: 0, max: 0, color: '#ebedf0', label: '0' },
        { min: 1, max: 1, color: '#9be9a8', label: '1' },
        { min: 2, max: 2, color: '#40c463', label: '2' },
        { min: 3, max: 3, color: '#30a14e', label: '3' },
        { min: 4, max: 999, color: '#216e39', label: '≥4' },
      ],
      textStyle: {
        fontSize: 12,
        color: '#666',
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
        borderColor: '#fff',
      },
      yearLabel: { show: false },
      dayLabel: {
        nameMap: 'cn',
        fontSize: 11,
        color: '#666',
      },
      monthLabel: {
        nameMap: 'cn',
        fontSize: 12,
        color: '#666',
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
  background: linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%);
  color: #fff;
  border-color: #ed6ea0;
  box-shadow: 0 4px 12px rgba(237, 110, 160, 0.3);
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
