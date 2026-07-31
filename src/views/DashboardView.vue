<template>
  <div class="dashboard-page">
    <aside class="dashboard-nav">
      <p class="dashboard-brand">创作中心</p>
      <button v-for="item in sections" :key="item.key" :class="{ active: section === item.key }" @click="section = item.key">{{ item.label }}</button>
      <router-link to="/">返回博客</router-link>
      <button @click="logout">退出登录</button>
    </aside>

    <main class="dashboard-main">
      <div class="dashboard-title">
        <div><p>Dashboard</p><h1>{{ currentTitle }}</h1></div>
        <button v-if="section === 'posts'" class="primary" @click="newPost">新建文章</button>
        <button v-if="section === 'categories'" class="primary" @click="newCategory">新建分类</button>
      </div>
      <p v-if="notice" class="notice">{{ notice }}</p>

      <form v-if="section === 'profile' && blog" class="panel form-grid" @submit.prevent="saveBlog">
        <label>博客地址标识<input v-model="blog.slug" required /></label>
        <label>博客标题<input v-model="blog.title" required /></label>
        <label>作者<input v-model="blog.author" required /></label>
        <label>副标题<input v-model="blog.subtitle" /></label>
        <label class="wide">个人简介<textarea v-model="blog.description" rows="4"></textarea></label>
        <label class="wide">头像 URL<input v-model="blog.avatar_url" /></label>
        <label class="wide">格言<input v-model="blog.motto" /></label>
        <button class="primary">保存资料</button>
      </form>

      <section v-if="section === 'categories'" class="panel">
        <div v-for="category in categories" :key="category.id" class="data-row">
          <div><strong>{{ category.name }}</strong><small>/{{ category.slug }}</small></div>
          <div><button @click="editCategory(category)">编辑</button><button class="danger" @click="removeCategory(category)">删除</button></div>
        </div>
        <p v-if="!categories.length" class="empty">还没有分类。</p>
      </section>

      <section v-if="section === 'posts'" class="panel">
        <div v-for="post in posts" :key="post.id" class="data-row">
          <div><strong>{{ post.title }}</strong><small>{{ post.status === 'published' ? '已发布' : '草稿' }} · /{{ post.slug }}</small></div>
          <div><button @click="editPost(post)">编辑</button><button class="danger" @click="removePost(post)">删除</button></div>
        </div>
        <p v-if="!posts.length" class="empty">还没有文章。</p>
      </section>

      <form v-if="section === 'editor'" class="panel form-grid editor-form" @submit.prevent="savePost">
        <label class="wide">标题<input v-model="postForm.title" required /></label>
        <label>路径标识<input v-model="postForm.slug" required /></label>
        <label>分类<select v-model="postForm.category_id"><option :value="null">未分类</option><option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
        <label>状态<select v-model="postForm.status"><option value="draft">草稿</option><option value="published">发布</option></select></label>
        <label>标签（逗号分隔）<input v-model="tagsText" /></label>
        <label class="wide">摘要<textarea v-model="postForm.excerpt" rows="2"></textarea></label>
        <label class="wide">Markdown 正文<textarea v-model="postForm.content" rows="18" class="editor"></textarea></label>
        <label>封面 URL<input v-model="postForm.cover_url" /></label>
        <label>附件 URL<input v-model="postForm.attachment_url" /></label>
        <div class="wide actions"><button type="button" @click="section = 'posts'">取消</button><button class="primary">保存文章</button></div>
      </form>

      <form v-if="section === 'category-editor'" class="panel form-grid" @submit.prevent="saveCategory">
        <label>名称<input v-model="categoryForm.name" required /></label>
        <label>路径标识<input v-model="categoryForm.slug" required /></label>
        <label class="wide">描述<textarea v-model="categoryForm.description"></textarea></label>
        <label class="wide">封面 URL<input v-model="categoryForm.cover_url" /></label>
        <div class="wide actions"><button type="button" @click="section = 'categories'">取消</button><button class="primary">保存分类</button></div>
      </form>

      <section v-if="section === 'files'" class="panel upload-panel">
        <h2>上传到阿里云 OSS</h2>
        <input type="file" @change="uploadFile" />
        <p v-if="uploadedUrl"><a :href="uploadedUrl" target="_blank">{{ uploadedUrl }}</a></p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import '@/styles/pages/dashboard.scss'

const router = useRouter()
const auth = useAuthStore()
const section = ref('profile')
const blog = ref(null)
const categories = ref([])
const posts = ref([])
const notice = ref('')
const uploadedUrl = ref('')
const editingPostId = ref(null)
const editingCategoryId = ref(null)
const tagsText = ref('')
const sections = [
  { key: 'profile', label: '博客资料' }, { key: 'categories', label: '分类管理' },
  { key: 'posts', label: '文章管理' }, { key: 'files', label: '文件中心' },
]
const currentTitle = computed(() => ({ profile: '博客资料', categories: '分类管理', posts: '文章管理', editor: '文章编辑器', 'category-editor': '分类编辑', files: '文件中心' })[section.value])
const postDefaults = () => ({ title: '', slug: '', excerpt: '', content: '', content_url: null, cover_url: null, attachment_url: null, kind: 'markdown', tags: [], category_id: null, status: 'draft', password: null, published_at: null })
const categoryDefaults = () => ({ name: '', slug: '', description: '', cover_url: null, sort_order: 0 })
const postForm = reactive(postDefaults())
const categoryForm = reactive(categoryDefaults())

async function load() {
  ;[blog.value, categories.value, posts.value] = await Promise.all([
    apiGet('/api/dashboard/blog'), apiGet('/api/dashboard/categories'), apiGet('/api/dashboard/posts'),
  ])
}
function flash(text) { notice.value = text; window.setTimeout(() => (notice.value = ''), 2500) }
async function saveBlog() { blog.value = await apiPatch('/api/dashboard/blog', blog.value); flash('博客资料已保存') }
function newPost() { editingPostId.value = null; Object.assign(postForm, postDefaults()); tagsText.value = ''; section.value = 'editor' }
function editPost(post) { editingPostId.value = post.id; Object.assign(postForm, post); postForm.category_id = post.category?.id || null; tagsText.value = post.tags.join(', '); section.value = 'editor' }
async function savePost() {
  const payload = { ...postForm, tags: tagsText.value.split(',').map((item) => item.trim()).filter(Boolean) }
  if (editingPostId.value) await apiPut(`/api/dashboard/posts/${editingPostId.value}`, payload)
  else await apiPost('/api/dashboard/posts', payload)
  posts.value = await apiGet('/api/dashboard/posts'); section.value = 'posts'; flash('文章已保存')
}
async function removePost(post) { if (!window.confirm(`删除文章“${post.title}”？`)) return; await apiDelete(`/api/dashboard/posts/${post.id}`); posts.value = posts.value.filter((item) => item.id !== post.id) }
function newCategory() { editingCategoryId.value = null; Object.assign(categoryForm, categoryDefaults()); section.value = 'category-editor' }
function editCategory(item) { editingCategoryId.value = item.id; Object.assign(categoryForm, item); section.value = 'category-editor' }
async function saveCategory() {
  if (editingCategoryId.value) await apiPut(`/api/dashboard/categories/${editingCategoryId.value}`, categoryForm)
  else await apiPost('/api/dashboard/categories', categoryForm)
  categories.value = await apiGet('/api/dashboard/categories'); section.value = 'categories'; flash('分类已保存')
}
async function removeCategory(item) { if (!window.confirm(`删除分类“${item.name}”？`)) return; await apiDelete(`/api/dashboard/categories/${item.id}`); categories.value = categories.value.filter((row) => row.id !== item.id) }
async function uploadFile(event) {
  const file = event.target.files?.[0]; if (!file) return
  const body = new FormData(); body.append('file', file)
  const result = await api('/api/dashboard/uploads?folder=files', { method: 'POST', body })
  uploadedUrl.value = result.url; flash('文件已上传')
}
function logout() { auth.logout(); router.push('/') }
onMounted(load)
</script>
