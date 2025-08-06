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

      <!-- 标签详情弹窗 -->
      <div v-if="selectedTag" class="tag-modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedTag.name }}</h2>
            <button class="close-btn" @click="closeModal">
              <i class="ic i-close"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="articles-list">
              <div v-for="article in selectedTagArticles" :key="article.slug" class="article-item">
                <div class="article-date">
                  {{ formatDate(article.date) }}
                </div>
                <div class="article-info">
                  <h3 class="article-title">
                    <router-link :to="`/post/${article.slug}`" @click="closeModal">
                      {{ article.title }}
                    </router-link>
                  </h3>
                  <div class="article-meta">
                    <span v-if="article.categories && article.categories.length" class="category">
                      <i class="ic i-flag"></i>
                      {{ getCategoryString(article.categories) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import PageContainer from '@/components/PageContainer.vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

const statisticsStore = useStatisticsStore()

const loading = computed(() => statisticsStore.loading)
const error = computed(() => statisticsStore.error)

// 处理标签数据，按数量排序
const sortedTags = computed(() => {
  return statisticsStore.tagsWithCount.sort((a, b) => b.count - a.count)
})

const selectedTag = ref(null)
const selectedTagArticles = ref([])

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

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  })
}

const getCategoryName = (category) => {
  if (!category) return '未分类'
  if (Array.isArray(category)) {
    return category[0] || '未分类'
  }
  if (typeof category === 'string') {
    return category
  }
  return '未分类'
}

const getCategoryString = (categories) => {
  if (!categories) return ''
  if (Array.isArray(categories)) {
    const categoryNames = categories
      .map((cat) => getCategoryName(cat))
      .filter((name) => name && name !== '未分类')
    return categoryNames.join(', ')
  }
  return ''
}

const selectTag = (tagName) => {
  selectedTag.value = { name: tagName }
  selectedTagArticles.value = statisticsStore.getArticlesByTag(tagName)
}

const closeModal = () => {
  selectedTag.value = null
  selectedTagArticles.value = []
}

// 初始化词云图
const initWordCloudChart = () => {
  if (!wordCloudRef.value) return

  wordCloudChart = echarts.init(wordCloudRef.value)

  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  // 调整词云参数，让标签更密集
  const option = {
    tooltip: {
      show: true,
      formatter: function (params) {
        return `${params.data.name}: ${params.data.value} 篇文章`
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
import { watch } from 'vue'
watch(
  sortedTags,
  () => {
    updateCharts()
  },
  { deep: true },
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
  background: linear-gradient(135deg, #38a1db 0%, #ed6ea0 100%);
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
.chart-section {
  margin-bottom: 3rem;
  width: 100%;
  overflow: hidden;
}

.chart-container {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(56, 161, 219, 0.1);
  min-height: 500px;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(56, 161, 219, 0.15);
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
  height: 400px;
  width: 100%;
  flex: 1;
  min-height: 0;
}

/* 标签区域 */
.tags-section {
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

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.tag-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: var(--tag-color);
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-item:hover .tag-badge {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.tag-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.tag-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

/* 弹窗样式 */
.tag-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.article-item:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(56, 161, 219, 0.2);
}

.article-date {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.article-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.article-title a:hover {
  color: #38a1db;
}

.article-meta {
  font-size: 0.85rem;
  color: #666;
}

.category {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.category i {
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-container {
    min-height: 450px;
  }

  .chart {
    height: 350px;
  }
}

@media (max-width: 1024px) {
  .chart-container {
    min-height: 400px;
  }

  .chart {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .chart-container {
    padding: 1rem;
    min-height: 350px;
  }

  .chart-header h3 {
    font-size: 1.1rem;
  }

  .chart-header p {
    font-size: 0.85rem;
  }

  .chart {
    height: 250px;
    width: 100%;
    max-width: 100%;
  }

  .tags-list {
    gap: 0.8rem;
  }

  .tag-badge {
    padding: 0.6rem 1rem;
  }

  .tag-name {
    font-size: 0.85rem;
  }

  .tag-count {
    font-size: 0.75rem;
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

  .chart-container {
    padding: 0.8rem;
    min-height: 300px;
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

  .tags-list {
    gap: 0.6rem;
  }

  .tag-badge {
    padding: 0.5rem 0.8rem;
  }

  .tag-name {
    font-size: 0.8rem;
  }

  .tag-count {
    font-size: 0.7rem;
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
</style>
