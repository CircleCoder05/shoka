import { createRouter, createWebHistory } from 'vue-router'
import Archives from '../views/Archives.vue'
import Categories from '../views/Categories.vue'
import Category from '../views/Category.vue'
import Tags from '../views/Tags.vue'
import Tag from '../views/Tag.vue'
import Post from '../views/Post.vue'
import Friends from '../views/Friends.vue'
import Statistics from '../views/Statistics.vue'
import Home from '../views/HomeView.vue'
import About from '../views/AboutView.vue'

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
      path: '/post/:slug',
      name: 'post',
      component: Post,
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

export default router
