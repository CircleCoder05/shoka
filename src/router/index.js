import { createRouter, createWebHistory } from 'vue-router'
import Archives from '@/views/archives/ArchivesView.vue'
import Categories from '@/views/Categories.vue'
import Tags from '@/views/Tags.vue'
import ArticleList from '@/views/ArticleList.vue'

import Friends from '@/views/Friends.vue'
import Home from '@/views/home/HomeView.vue'
import About from '@/views/about/AboutView.vue'
import PostView from '@/views/articles/PostView.vue'
import AuthView from '@/views/AuthView.vue'
import DashboardView from '@/views/DashboardView.vue'

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
    { path: '/login', name: 'login', component: AuthView, meta: { plainLayout: true } },
    { path: '/register', name: 'register', component: AuthView, meta: { plainLayout: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true, plainLayout: true } },
  ],
})

// 添加路由守卫来调试和管理banner
router.beforeEach(async (to, from, next) => {
  console.log('🚨 路由跳转:', { from: from.path, to: to.path, params: to.params })

  if (to.meta.requiresAuth) {
    const [{ useAuthStore }] = await Promise.all([import('../stores/auth.js')])
    const auth = useAuthStore()
    if (!auth.ready) await auth.restore()
    if (!auth.authenticated) return next({ name: 'login', query: { redirect: to.fullPath } })
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

// 标题不阻塞路由渲染，避免首次访问时出现旧页面/白屏闪烁。
router.afterEach(async (to) => {
  if (to.name === 'post') return
  try {
    const { useBlogStore } = await import('../stores/blog.js')
    const data = await useBlogStore().load()
    const baseTitle = data.blog.title || '碼農書架'
    const labels = {
      home: '首页',
      about: '关于',
      archives: '归档',
      categories: '分类',
      tags: '标签',
      friends: '友链',
      login: '登录',
      register: '注册',
      dashboard: '管理后台',
    }
    document.title = labels[to.name] ? `${labels[to.name]} - ${baseTitle}` : baseTitle
  } catch {
    document.title = '碼農書架'
  }
})

export default router
