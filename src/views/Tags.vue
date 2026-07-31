<template>
  <PageContainer>
    <div class="page-header">
      <h1 class="page-title">文章标签</h1>
      <p class="page-subtitle">按标签分类整理的文章</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else class="tags-content">
      <!-- 图表展示区域 -->
      <div class="chart-section">
        <div class="chart-container">
          <div class="chart-header">
            <h3>标签词云</h3>
            <p>标签使用频率可视化</p>
          </div>
          <div ref="wordCloudRef" class="chart"></div>
        </div>
      </div>

      <!-- 标签列表 -->
      <div class="tags-section">
        <div class="section-header">
          <h3>所有标签</h3>
          <p>点击查看详细文章</p>
        </div>

        <div class="tags-list">
          <div
            v-for="(tag, index) in sortedTags"
            :key="tag.slug"
            class="tag-item"
            @click="selectTag(tag.name)"
          >
            <div class="tag-badge" :style="{ '--tag-color': getTagColor(index) }">
              <span class="tag-name">{{ tag.name }}</span>
              <span class="tag-count">{{ tag.count }}</span>
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
import 'echarts-wordcloud'

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
      tooltipBg: '#2c313c',
      tooltipBorder: '#3e4451',
    }
  } else {
    return {
      textColor: '#666',
      backgroundColor: '#fff',
      tooltipBg: '#fff',
      tooltipBorder: '#ddd',
    }
  }
})

// 处理标签数据，按数量排序
const sortedTags = computed(() => {
  return statisticsStore.tagsWithCount.sort((a, b) => b.count - a.count)
})

// 图表引用
const wordCloudRef = ref(null)
let wordCloudChart = null

// 标签颜色数组
const tagColors = [
  '#38a1db',
  '#ed6ea0',
  '#fbb03b',
  '#9b59b6',
  '#3498db',
  '#1abc9c',
  '#e67e22',
  '#e74c3c',
  '#f39c12',
  '#34495e',
  '#16a085',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
  '#c0392b',
  '#d35400',
  '#f39c12',
  '#e74c3c',
  '#9b59b6',
  '#3498db',
]

const getTagColor = (index) => {
  return tagColors[index % tagColors.length]
}

const selectTag = (tagName) => {
  router.push(`/tag/${tagName}`)
}

// 初始化词云图
const initWordCloudChart = () => {
  if (!wordCloudRef.value) return

  wordCloudChart = echarts.init(wordCloudRef.value)

  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  const themeConfig = getThemeConfig.value

  // 调整词云参数，让标签更密集
  const option = {
    tooltip: {
      show: true,
      formatter: function (params) {
        return `${params.data.name}: ${params.data.value} 篇文章`
      },
      backgroundColor: themeConfig.tooltipBg,
      borderColor: themeConfig.tooltipBorder,
      textStyle: {
        color: themeConfig.textColor,
      },
    },
    series: [
      {
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '90%',
        height: '90%',
        right: null,
        bottom: null,
        sizeRange: isSmallMobile ? [16, 40] : isMobile ? [18, 50] : [20, 60],
        rotationRange: [-45, 45],
        rotationStep: 15,
        gridSize: isSmallMobile ? 6 : isMobile ? 8 : 10,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function (params) {
            return tagColors[params.dataIndex % tagColors.length]
          },
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333',
          },
        },
        data: sortedTags.value.map((tag, index) => ({
          name: tag.name,
          value: tag.count,
          textStyle: {
            fontSize: Math.max(20, tag.count * 3),
            color: tagColors[index % tagColors.length],
          },
        })),
      },
    ],
  }

  wordCloudChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  // 重新初始化图表以适应新的屏幕尺寸
  if (wordCloudChart) {
    wordCloudChart.dispose()
    initWordCloudChart()
  }
}

// 更新图表数据
const updateCharts = () => {
  if (wordCloudChart) {
    const wordCloudOption = wordCloudChart.getOption()
    wordCloudOption.series[0].data = sortedTags.value.map((tag, index) => ({
      name: tag.name,
      value: tag.count,
      textStyle: {
        fontSize: Math.max(20, tag.count * 3),
        color: tagColors[index % tagColors.length],
      },
    }))
    wordCloudChart.setOption(wordCloudOption)
  }
}

// 监听数据变化
watch(
  sortedTags,
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
    if (wordCloudChart) {
      wordCloudChart.dispose()
      initWordCloudChart()
    }
  },
)

onMounted(async () => {
  if (statisticsStore.archives.length === 0) {
    await statisticsStore.loadStatistics()
  }

  // 等待DOM更新后初始化图表
  await nextTick()
  initWordCloudChart()

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (wordCloudChart) {
    wordCloudChart.dispose()
  }
})
</script>

<style scoped lang="scss" src="@/styles/sfc/views/Tags.scss"></style>
