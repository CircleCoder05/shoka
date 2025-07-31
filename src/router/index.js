import { createRouter, createWebHistory } from 'vue-router'
import Archives from '../views/Archives.vue'
import Categories from '../views/Categories.vue'
import Category from '../views/Category.vue'
import Tags from '../views/Tags.vue'
import Tag from '../views/Tag.vue'

import Friends from '../views/Friends.vue'
import Statistics from '../views/Statistics.vue'
import Home from '../views/HomeView.vue'
import About from '../views/AboutView.vue'
import PostView from '@/views/PostView.vue'

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
      path: '/categories/:name',
      name: 'category',
      component: Category,
    },
    {
      path: '/tags',
      name: 'tags',
      component: Tags,
    },
    {
      path: '/tags/:name',
      name: 'tag',
      component: Tag,
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
    {
      path: '/statistics',
      name: 'statistics',
      component: Statistics,
    },
  ],
})

// 添加路由守卫来调试和管理banner
router.beforeEach((to, from, next) => {
  console.log('🚨 路由跳转:', { from: from.path, to: to.path, params: to.params })

  // 如果不是文章详情页，设置默认banner
  if (to.name !== 'post') {
    // 动态导入banner store
    import('../stores/banner.js').then(({ useBannerStore }) => {
      const bannerStore = useBannerStore()
      bannerStore.setDefaultBanner()
    })
  }

  next()
})

export default router
