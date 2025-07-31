import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBannerStore = defineStore('banner', () => {
  // 默认网站信息
  const siteTitle = ref('CircleCoder')
  const siteSubtitle = ref('= 仰望星空 =')
  const bannerImage = ref('https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943773.jpg')
  const bannerAlt = ref('banner')
  
  // 文章详情页信息
  const isArticlePage = ref(false)
  const articleTitle = ref('')
  const articleAuthor = ref('')
  const articleDate = ref('')
  const articleWordCount = ref(0)
  const articleReadTime = ref(0)
  const articleViews = ref(0)
  const articleCategories = ref([])
  
  // 设置默认网站 banner
  function setDefaultBanner() {
    isArticlePage.value = false
    articleTitle.value = ''
    articleAuthor.value = ''
    articleDate.value = ''
    articleWordCount.value = 0
    articleReadTime.value = 0
    articleViews.value = 0
    articleCategories.value = []
  }
  
  // 设置文章详情页 banner
  function setArticleBanner(article) {
    isArticlePage.value = true
    articleTitle.value = article.title || ''
    articleAuthor.value = article.author || 'CircleCoder'
    articleDate.value = article.date || ''
    articleWordCount.value = article.wordCount || 0
    articleReadTime.value = article.readTime || 0
    articleViews.value = article.views || 0
    articleCategories.value = article.categories || []
  }
  
  // 计算属性：banner props
  const bannerProps = computed(() => ({
    siteTitle: siteTitle.value,
    siteSubtitle: siteSubtitle.value,
    bannerImage: bannerImage.value,
    bannerAlt: bannerAlt.value,
    isArticlePage: isArticlePage.value,
    articleTitle: articleTitle.value,
    articleAuthor: articleAuthor.value,
    articleDate: articleDate.value,
    articleWordCount: articleWordCount.value,
    articleReadTime: articleReadTime.value,
    articleViews: articleViews.value,
    articleCategories: articleCategories.value
  }))
  
  return {
    // 状态
    siteTitle,
    siteSubtitle,
    bannerImage,
    bannerAlt,
    isArticlePage,
    articleTitle,
    articleAuthor,
    articleDate,
    articleWordCount,
    articleReadTime,
    articleViews,
    articleCategories,
    
    // 计算属性
    bannerProps,
    
    // 方法
    setDefaultBanner,
    setArticleBanner
  }
}) 