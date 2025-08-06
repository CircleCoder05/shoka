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

      <!-- 分类详情弹窗 -->
      <div v-if="selectedCategory" class="category-modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedCategory.name }}</h2>
            <button class="close-btn" @click="closeModal">
              <i class="ic i-close"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="articles-list">
              <div
                v-for="article in selectedCategoryArticles"
                :key="article.slug"
                class="article-item"
              >
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
                    <span v-if="article.tags && article.tags.length" class="tags">
                      <i class="ic i-tags"></i>
                      {{ getTagsString(article.tags) }}
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

const statisticsStore = useStatisticsStore()

const loading = computed(() => statisticsStore.loading)
const error = computed(() => statisticsStore.error)

// 处理分类数据，将uncategorized改为未分类，并按数量排序
const sortedCategories = computed(() => {
  const categories = statisticsStore.categoriesWithCount.map((category) => ({
    ...category,
    name: category.name === 'uncategorized' ? '未分类' : category.name,
  }))

  return categories.sort((a, b) => b.count - a.count)
})

const selectedCategory = ref(null)
const selectedCategoryArticles = ref([])

// 图表引用
const pieChartRef = ref(null)
const barChartRef = ref(null)
let pieChart = null
let barChart = null

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  })
}

const getTagsString = (tags) => {
  if (!tags) return ''
  if (Array.isArray(tags)) {
    return tags.filter((tag) => typeof tag === 'string' && tag).join(', ')
  }
  if (typeof tags === 'string') {
    return tags
  }
  return ''
}

const getProgressPercentage = (count) => {
  const maxCount = Math.max(...sortedCategories.value.map((c) => c.count))
  return (count / maxCount) * 100
}

const selectCategory = (categoryName) => {
  // 处理未分类的特殊情况
  const actualCategoryName = categoryName === '未分类' ? 'uncategorized' : categoryName
  selectedCategory.value = { name: categoryName }
  selectedCategoryArticles.value = statisticsStore.getArticlesByCategory(actualCategoryName)
}

const closeModal = () => {
  selectedCategory.value = null
  selectedCategoryArticles.value = []
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)

  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: isMobile ? 'horizontal' : 'vertical',
      left: isMobile ? 'center' : 'left',
      top: isMobile ? 'bottom' : 'middle',
      textStyle: {
        fontSize: isSmallMobile ? 10 : 12,
      },
      type: 'scroll',
      pageButtonPosition: 'end',
      pageButtonGap: 5,
      pageButtonItemGap: 5,
      pageIconColor: '#ed6ea0',
      pageIconInactiveColor: '#ccc',
      pageTextStyle: {
        color: '#666',
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

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
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
          color: '#666',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '文章数量',
      nameTextStyle: {
        color: '#666',
        fontSize: isSmallMobile ? 10 : 12,
      },
      axisLabel: {
        fontSize: isSmallMobile ? 10 : 12,
        color: '#666',
      },
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
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
import { watch } from 'vue'
watch(
  sortedCategories,
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

/* 弹窗样式 */
.category-modal {
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
  border-color: rgba(237, 110, 160, 0.2);
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
  color: #ed6ea0;
}

.article-meta {
  font-size: 0.85rem;
  color: #666;
}

.tags {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tags i {
  font-size: 0.8rem;
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
</style>
