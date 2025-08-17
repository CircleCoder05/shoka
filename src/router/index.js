import { createRouter, createWebHistory } from 'vue-router'
import Archives from '@/views/archives/ArchivesView.vue'
import Categories from '@/views/Categories.vue'
import Tags from '@/views/Tags.vue'
import ArticleList from '@/views/ArticleList.vue'

import Friends from '@/views/Friends.vue'
import Home from '@/views/home/HomeView.vue'
import About from '@/views/about/AboutView.vue'
import PostView from '@/views/articles/PostView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/archives',
      name: 'archives',
      component: Archives,
    },
    {
      path: '/categories',
      name: 'categories',
      component: Categories,
    },
    {
      path: '/category/:name',
      name: 'category',
      component: ArticleList,
      props: (route) => ({ type: 'category', name: route.params.name }),
    },
    {
      path: '/tags',
      name: 'tags',
      component: Tags,
    },
    {
      path: '/tag/:name',
      name: 'tag',
      component: ArticleList,
      props: (route) => ({ type: 'tag', name: route.params.name }),
    },
    {
      path: '/post-demo',
      name: 'post-demo',
      component: PostView,
    },
    {
      path: '/post/:slug(.*)',
      name: 'post',
      component: PostView,
    },
    {
      path: '/friends',
      name: 'friends',
      component: Friends,
    },
  ],
})

// 添加路由守卫来调试和管理banner
router.beforeEach(async (to, from, next) => {
  console.log('🚨 路由跳转:', { from: from.path, to: to.path, params: to.params })

  // 动态获取网站配置
  try {
    const response = await fetch('/config.json')
    if (response.ok) {
      const config = await response.json()
      const siteName = config.footer?.name || '碼農書架'
      const baseTitle = siteName

      let pageTitle = baseTitle

      switch (to.name) {
        case 'home':
          pageTitle = '首页 - ' + baseTitle
          break
        case 'about':
          pageTitle = '关于 - ' + baseTitle
          break
        case 'archives':
          pageTitle = '归档 - ' + baseTitle
          break
        case 'categories':
          pageTitle = '分类 - ' + baseTitle
          break
        case 'tags':
          pageTitle = '标签 - ' + baseTitle
          break
        case 'friends':
          pageTitle = '友链 - ' + baseTitle
          break
        case 'post':
          // 文章页面的标题会在组件中动态设置
          break
        default:
          pageTitle = baseTitle
      }

      document.title = pageTitle
    }
  } catch (error) {
    console.warn('Failed to load config for title:', error)
    // 使用默认标题
    document.title = '碼農書架'
  }

  // 如果不是文章详情页，设置默认banner和侧边栏
  if (to.name !== 'post') {
    // 动态导入stores
    Promise.all([import('../stores/banner.js'), import('../stores/sidebar.js')]).then(
      ([{ useBannerStore }, { useSidebarStore }]) => {
        const bannerStore = useBannerStore()
        const sidebarStore = useSidebarStore()
        bannerStore.setDefaultBanner()
        sidebarStore.reset()
      },
    )
  }

  next()
})

export default router
