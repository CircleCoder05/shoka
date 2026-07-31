<template>
  <PageContainer>
    <!-- 文章日历 -->
    <ArticleCalendar :articles="statisticsStore.archives" />

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
  </PageContainer>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import TimelineArticleCard from '@/views/archives/TimelineArticleCard.vue'
import ArticleCalendar from '@/views/archives/ArticleCalendar.vue'
import PageContainer from '@/components/PageContainer.vue'

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

<style scoped lang="scss" src="@/styles/sfc/views/archives/ArchivesView.scss"></style>
