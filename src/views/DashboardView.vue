<template>
  <div class="studio">
    <aside class="studio-sidebar">
      <div class="studio-profile">
        <img :src="blog?.avatar_url || fallbackAvatar" alt="" />
        <strong>{{ blog?.author || auth.user?.username }}</strong>
        <span>{{ blog?.motto || '记录、思考与创造' }}</span>
      </div>
      <nav>
        <button v-for="item in navigation" :key="item.key" :class="{ active: section === item.key }" @click="openSection(item.key)">
          <i>{{ item.icon }}</i><span>{{ item.label }}</span><b v-if="item.count !== undefined">{{ item.count }}</b>
        </button>
      </nav>
      <blockquote>写作是一场孤独的修行，也是自我对话的旅程。</blockquote>
      <div class="studio-sidebar-actions"><router-link to="/">↗ 查看博客</router-link><button @click="logout">⇥ 登出</button></div>
    </aside>

    <div class="studio-workspace">
      <header class="studio-topbar">
        <div><button class="menu-button">☰</button><strong>{{ pageTitle }}</strong></div>
        <div class="topbar-actions"><button @click="section = 'posts'">⌕ 搜索文章</button><img :src="blog?.avatar_url || fallbackAvatar" alt="" /><span>{{ blog?.author }}</span></div>
      </header>

      <main :class="['studio-main', { 'taxonomy-page': section === 'taxonomy' }]">
        <p v-if="notice" class="studio-notice">{{ notice }}</p>

        <template v-if="section === 'posts'">
          <section class="studio-card post-manager">
            <div class="filter-bar">
              <label>⌕<input v-model="postQuery" placeholder="搜索标题或摘要" /></label>
              <el-select v-model="postStatus" placeholder="全部状态" clearable><el-option label="已发布" value="published" /><el-option label="草稿" value="draft" /></el-select>
              <el-select v-model="postCategory" placeholder="全部分类" clearable><el-option v-for="item in categories" :key="item.id" :label="item.name" :value="String(item.id)" /></el-select>
              <el-button type="primary" @click="newPost">✎ 写新文章</el-button>
            </div>
            <div class="content-table">
              <div class="table-head"><span>文章</span><span>状态</span><span>分类</span><span>标签</span><span>更新时间</span><span>操作</span></div>
              <article v-for="post in paginatedPosts" :key="post.id">
                <div class="post-cell"><img :src="post.cover_url || '/default-cover.jpg'" alt="" /><div><strong>{{ post.title }}</strong><small>{{ post.excerpt || '暂无摘要' }}</small></div></div>
                <span :class="['status-pill', post.status]">{{ post.status === 'published' ? '已发布' : '草稿' }}</span>
                <span>{{ categoryName(post) }}</span>
                <div class="tag-stack"><b v-for="tag in post.tags?.slice(0, 2)" :key="tag" :class="tagTone(tag)">{{ tag }}</b></div>
                <time>{{ formatDate(post.updated_at) }}</time>
                <div class="table-actions"><button @click="editPost(post)">编辑</button><button v-if="post.status !== 'published'" @click="publishPost(post)">发布</button><button class="danger" @click="removePost(post)">删除</button></div>
              </article>
            </div>
            <p v-if="!filteredPosts.length" class="empty">没有符合条件的文章。</p>
            <footer v-else class="manager-pagination"><span>共 {{ filteredPosts.length }} 篇</span><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" layout="prev, pager, next, sizes" :page-sizes="[10, 20, 30]" :total="filteredPosts.length" background /></footer>
          </section>
        </template>

        <template v-else-if="section === 'editor'">
          <div class="editor-layout">
            <section class="editor-main studio-card">
              <label class="title-field"><span>文章标题</span><input v-model="postForm.title" placeholder="输入一个吸引人的标题" maxlength="255" /><small>{{ postForm.title.length }}/255</small></label>
              <div class="editor-mode"><button :class="{ active: editorMode === 'write' }" @click="editorMode = 'write'">编辑</button><button :class="{ active: editorMode === 'preview' }" @click="editorMode = 'preview'">预览</button><el-upload :show-file-list="false" accept="image/*" :http-request="requestImageUpload"><el-button text>插入图片</el-button></el-upload><el-upload :show-file-list="false" accept="application/pdf" :http-request="requestPdfUpload"><el-button text>插入 PDF</el-button></el-upload><el-select v-model="postForm.kind"><el-option label="Markdown" value="markdown" /><el-option label="Markdown + LaTeX" value="latex" /></el-select></div>
              <div :class="['writing-surface', `mode-${editorMode}`]">
                <textarea v-if="editorMode !== 'preview'" ref="sourceEditor" v-model="postForm.content" class="source-editor" spellcheck="false" placeholder="开始写下你的想法…&#10;&#10;可直接粘贴或拖入图片/PDF，系统会自动上传 OSS。&#10;LaTeX 示例：$E = mc^2$ 或 $$\\int_0^1 x^2 dx$$" @paste="handleEditorPaste" @drop.prevent="handleEditorDrop"></textarea>
                <article v-if="editorMode !== 'write'" class="live-preview post-content" v-html="previewHtml"></article>
              </div>
            </section>
            <aside class="editor-settings">
              <section class="studio-card"><h2>封面图</h2><label class="cover-uploader"><input type="file" accept="image/*" @change="uploadCover" /><img v-if="postForm.cover_url" :src="postForm.cover_url" alt="" /><span v-else>▧<b>点击上传封面图</b><small>支持 JPG、PNG、WebP</small></span></label></section>
              <section class="studio-card"><h2>文章摘要</h2><label class="excerpt-field"><textarea v-model="postForm.excerpt" rows="5" maxlength="300" placeholder="可选，将显示在文章列表中"></textarea><small>{{ postForm.excerpt.length }}/300</small></label></section>
              <section class="studio-card"><h2>发布设置</h2><label>发布状态<el-select v-model="postForm.status"><el-option label="草稿" value="draft" /><el-option label="立即发布" value="published" /></el-select></label><label>分类<el-select v-model="postForm.category_id" placeholder="未分类" clearable><el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" /></el-select></label><label>标签<div class="tag-picker" @click="openTagPicker"><span v-if="!selectedPostTags.length">点击选择标签</span><b v-for="tag in selectedPostTags" :key="tag" :class="tagTone(tag)">{{ tag }}</b></div></label></section>
              <section class="studio-card editor-stat"><h2>字数统计</h2><div><strong>{{ editorStats.characters }}</strong><span>字符</span><strong>{{ editorStats.minutes }}</strong><span>分钟</span></div><small>{{ editorStats.paragraphs }} 个段落 · {{ editorStats.images }} 张图片</small></section>
              <section class="editor-actions"><el-button @click="section = 'posts'">返回文章管理</el-button><el-button @click="savePost('draft')">保存草稿</el-button><el-button type="primary" @click="savePost('published')">发布文章</el-button></section>
            </aside>
          </div>
        </template>

        <template v-else-if="section === 'taxonomy'">
          <div class="taxonomy-grid">
            <section class="studio-card taxonomy-panel taxonomy-table"><header><h2>♣ 分类列表</h2><div><el-button type="primary" @click="openCategoryDialog()">＋ 新建分类</el-button><el-button type="danger" plain :disabled="!selectedCategoryIds.length" @click="bulkRemoveCategories">批量删除</el-button><el-button @click="load">↻ 刷新</el-button></div></header><div class="taxonomy-table-head category-columns"><input type="checkbox" :checked="allPageCategoriesSelected" @change="togglePageCategories" /><span>分类名称</span><span>别名</span><span>文章数</span><span>描述</span><span>操作</span></div><article v-for="item in pagedCategories" :key="item.id" class="category-columns"><input v-model="selectedCategoryIds" type="checkbox" :value="item.id" /><div class="category-name"><img :src="item.cover_url || '/default-cover.jpg'" alt="" /><strong>{{ item.name }}</strong></div><span>{{ item.slug }}</span><b>{{ countCategory(item.id) }}</b><small>{{ item.description || '—' }}</small><div><button @click="openCategoryDialog(item)">编辑</button><button class="danger" @click="removeCategory(item)">删除</button></div></article><footer><span>共 {{ categories.length }} 条</span><el-pagination v-model:current-page="categoryPage" :page-size="taxonomyPageSize" layout="prev, pager, next" :total="categories.length" background /></footer></section>
            <section class="studio-card taxonomy-panel taxonomy-table"><header><h2>◆ 标签列表</h2><div><el-button class="purple-button" @click="openTagEditDialog()">＋ 新建标签</el-button><el-button type="danger" plain :disabled="!selectedTagNames.length" @click="bulkRemoveTags">批量删除</el-button><el-button @click="load">↻ 刷新</el-button></div></header><div class="taxonomy-table-head tag-columns"><input type="checkbox" :checked="allPageTagsSelected" @change="togglePageTags" /><span>标签名称</span><span>颜色</span><span>文章数</span><span>说明</span><span>操作</span></div><article v-for="tag in pagedTags" :key="tag.name" class="tag-columns"><input v-model="selectedTagNames" type="checkbox" :value="tag.name" /><strong :class="['tag-name', tagTone(tag.name)]">{{ tag.name }}</strong><span class="tag-color"><i :class="tagTone(tag.name)"></i>{{ tag.color }}</span><b>{{ tag.post_count }}</b><small>{{ tag.description || '—' }}</small><div><button @click="openTagEditDialog(tag)">编辑</button><button class="danger" @click="removeTag(tag)">删除</button></div></article><footer><span>共 {{ tags.length }} 条</span><el-pagination v-model:current-page="tagPage" :page-size="taxonomyPageSize" layout="prev, pager, next" :total="tags.length" background /></footer></section>
          </div>
        </template>

        <template v-else-if="section === 'profile'">
          <form class="profile-admin" @submit.prevent="saveProfile">
            <section class="studio-card profile-admin-card"><header><div><h2>人物画像</h2><p>维护前台个人档案的特质与人物图片。</p></div><el-upload :show-file-list="false" accept="image/*" :http-request="uploadProfilePortrait"><el-button type="primary">上传人物图片</el-button></el-upload></header><img v-if="profileForm.portrait_url" class="profile-portrait-preview" :src="profileForm.portrait_url" alt="" /><div class="repeat-grid"><label v-for="(item,index) in profileForm.traits" :key="index">特质 {{ index+1 }}<input v-model="item.title" placeholder="如：慢热" /><input v-model="item.subtitle" placeholder="补充说明" /></label></div></section>
            <section class="studio-card profile-admin-card"><h2>自我陈述</h2><textarea v-model="profileForm.introduction" rows="9" placeholder="分段介绍自己"></textarea></section>
            <section class="studio-card profile-admin-card"><h2>能力偏好</h2><div class="repeat-list"><label v-for="(item,index) in profileForm.skills" :key="index"><input v-model="item.name" placeholder="能力名称" /><input v-model.number="item.value" type="number" min="0" max="100" /><button type="button" class="danger" @click="profileForm.skills.splice(index,1)">删除</button></label><el-button @click="profileForm.skills.push({name:'',value:80})">＋ 添加能力</el-button></div></section>
            <section class="studio-card profile-admin-card"><h2>人生时间线</h2><div class="repeat-list"><label v-for="(item,index) in profileForm.timeline" :key="index"><input v-model="item.title" placeholder="阶段标题" /><input v-model="item.description" placeholder="阶段描述" /><button type="button" class="danger" @click="profileForm.timeline.splice(index,1)">删除</button></label><el-button @click="profileForm.timeline.push({title:'',description:''})">＋ 添加阶段</el-button></div></section>
            <section class="studio-card profile-admin-card profile-snapshots"><header><div><h2>理想生活碎片</h2><p>图片选择后立即上传 OSS。</p></div><el-upload :show-file-list="false" accept="image/*" :http-request="uploadProfileSnapshot"><el-button>＋ 上传图片</el-button></el-upload></header><div><article v-for="(item,index) in profileForm.snapshots" :key="item.url"><img :src="item.url" alt="" /><input v-model="item.title" placeholder="标题" /><input v-model="item.description" placeholder="描述" /><button type="button" class="danger" @click="profileForm.snapshots.splice(index,1)">删除</button></article></div></section>
            <section class="studio-card profile-admin-card"><h2>联系与留言</h2><label>联系邮箱<input v-model="profileForm.contact_email" type="email" /></label><label>联系说明<textarea v-model="profileForm.contact_message" rows="4"></textarea></label></section>
            <el-button class="profile-save" type="primary" native-type="submit">保存个人档案</el-button>
          </form>
        </template>

        <template v-else-if="section === 'friends'">
          <section class="studio-card friend-manager"><header><div><h2>友链列表</h2><p>按分组展示，编辑和新建均使用弹窗。</p></div><el-button type="primary" @click="newFriend">＋ 新增友链</el-button></header><div v-for="group in friendGroups" :key="group.name" class="friend-group"><h3>{{ group.name }}<span>{{ group.items.length }}</span></h3><article v-for="friend in group.items" :key="friend.id"><img :src="friend.avatar_url || fallbackAvatar" alt="" /><div><strong>{{ friend.name }}</strong><small>{{ friend.description || friend.url }}</small></div><span>{{ (friend.tags || []).join(' · ') || '—' }}</span><button @click="editFriend(friend)">编辑</button><button class="danger" @click="removeFriend(friend)">删除</button></article></div></section>
        </template>

        <template v-else-if="section === 'site' && blog">
          <form class="site-admin" @submit.prevent="saveSiteSettings">
            <section class="studio-card site-identity"><div class="site-fields"><h2>侧边栏资料</h2><label>昵称<input v-model="blog.author" /></label><label>个性签名<input v-model="blog.motto" /></label><label>站点标题<input v-model="blog.title" /></label><label>Banner 标题<input v-model="blog.subtitle" /></label><label>打字机文字（每行一条）<textarea v-model="typewriterText" rows="5"></textarea></label></div><aside class="avatar-settings"><h2>头像实时预览</h2><img :src="blog.avatar_url || fallbackAvatar" alt="" /><el-upload :show-file-list="false" accept="image/*" :http-request="uploadAvatar"><el-button type="primary">更换头像</el-button></el-upload></aside></section>
            <section class="studio-card social-settings"><h2>社交链接</h2><label v-for="network in socialNetworks" :key="network.key">{{ network.label }}<input v-model="socialLinks[network.key]" :placeholder="network.placeholder" /></label></section>
            <section class="studio-card banner-settings"><header><div><h2>Banner 图片列表</h2><p>未配置时自动使用系统现有随机图。</p></div><el-upload :show-file-list="false" accept="image/*" :http-request="uploadBanner"><el-button>＋ 上传 Banner</el-button></el-upload></header><div class="banner-list"><article v-for="(banner,index) in appearance.banners" :key="banner"><img :src="banner" alt="" /><span>Banner {{ index+1 }}</span><button type="button" class="danger" @click="removeBanner(index)">删除</button></article><p v-if="!appearance.banners.length">当前使用系统随机图片。</p></div></section>
            <section class="studio-card theme-settings"><h2>全站主题色</h2><p>统一应用到按钮、链接、标签与强调元素。</p><div class="color-options"><button v-for="color in accentColors" :key="color" type="button" :style="{background:color}" :class="{ selected: appearance.accent === color }" @click="appearance.accent = color"></button><input v-model="appearance.accent" type="color" /></div></section>
            <el-button class="settings-save" type="primary" native-type="submit">保存站点设置</el-button>
          </form>
        </template>
      </main>
    </div>
    <el-dialog v-model="tagDialogVisible" title="选择文章标签" width="520px" append-to-body><el-checkbox-group v-model="selectedPostTags" class="tag-choice-grid"><el-checkbox v-for="tag in tags" :key="tag.name" :value="tag.name" border>{{ tag.name }}</el-checkbox></el-checkbox-group><template #footer><el-button @click="tagDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmTags">确定</el-button></template></el-dialog>
    <el-dialog v-model="categoryDialogVisible" :title="editingCategoryId ? '编辑分类' : '新建分类'" width="520px" append-to-body><form class="dialog-form" @submit.prevent="saveCategory"><label>分类名称<input v-model="categoryForm.name" required /></label><label>英文别名<input v-model="categoryForm.slug" placeholder="如 tech" required /></label><label>描述<textarea v-model="categoryForm.description" rows="3"></textarea></label><label>分类封面<el-upload :show-file-list="false" accept="image/*" :http-request="uploadCategoryCover"><div class="dialog-cover"><img v-if="categoryForm.cover_url" :src="categoryForm.cover_url" alt="" /><span v-else>点击选择图片，选中后立即上传 OSS</span></div></el-upload></label></form><template #footer><el-button @click="categoryDialogVisible=false">取消</el-button><el-button type="primary" @click="saveCategory">保存</el-button></template></el-dialog>
    <el-dialog v-model="tagEditDialogVisible" :title="editingTagName ? '编辑标签' : '新建标签'" width="480px" append-to-body><form class="dialog-form" @submit.prevent="saveTag"><label>标签名称<input v-model="tagForm.name" required /></label><label>颜色<input v-model="tagForm.color" type="color" /></label><label>说明<textarea v-model="tagForm.description" rows="3"></textarea></label></form><template #footer><el-button @click="tagEditDialogVisible=false">取消</el-button><el-button type="primary" @click="saveTag">保存</el-button></template></el-dialog>
    <el-dialog v-model="friendDialogVisible" :title="editingFriendId ? '编辑友链' : '新增友链'" width="560px" append-to-body><form class="dialog-form" @submit.prevent="saveFriend"><label>名称<input v-model="friendForm.name" required /></label><label>分组<input v-model="friendForm.category" required /></label><label>网址<input v-model="friendForm.url" type="url" required /></label><label>头像 URL<input v-model="friendForm.avatar_url" /></label><label>简介<textarea v-model="friendForm.description" rows="3"></textarea></label><label>标签<input v-model="friendTagsText" placeholder="逗号分隔" /></label></form><template #footer><el-button @click="friendDialogVisible=false">取消</el-button><el-button type="primary" @click="saveFriend">保存</el-button></template></el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import hljs from 'highlight.js'
import 'katex/dist/katex.min.css'
import {
  ElButton, ElCheckbox, ElCheckboxGroup, ElDialog, ElOption,
  ElPagination, ElSelect, ElUpload,
} from 'element-plus'
import 'element-plus/es/components/base/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/checkbox/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/pagination/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/upload/style/css'
import { api, apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import '@/styles/pages/dashboard.scss'

const markdownUtils = new MarkdownIt().utils
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(code, language) {
    const value = language && hljs.getLanguage(language)
      ? hljs.highlight(code, { language }).value
      : markdownUtils.escapeHtml(code)
    return `<pre><code class="hljs${language ? ` language-${language}` : ''}">${value}</code></pre>`
  },
}).use(texmath, { engine: katex, delimiters: 'dollars' })
const router = useRouter(), auth = useAuthStore()
const section = ref('posts'), editorMode = ref('write')
const blog = ref(null), profile = ref(null), posts = ref([]), categories = ref([]), tags = ref([]), friends = ref([])
const notice = ref(''), postQuery = ref(''), postStatus = ref(''), postCategory = ref(''), tagsText = ref(''), friendTagsText = ref(''), typewriterText = ref('')
const editingPostId = ref(null), editingCategoryId = ref(null), editingFriendId = ref(null)
const currentPage = ref(1), pageSize = ref(10), tagDialogVisible = ref(false), selectedPostTags = ref([]), sourceEditor = ref(null)
const categoryDialogVisible = ref(false), tagEditDialogVisible = ref(false), friendDialogVisible = ref(false), editingTagName = ref('')
const categoryPage = ref(1), tagPage = ref(1), taxonomyPageSize = ref(5)
const selectedCategoryIds = ref([]), selectedTagNames = ref([])
const fallbackAvatar = '/img/avatar.png'
const postDefaults = () => ({ title:'', excerpt:'', content:'', content_url:null, cover_url:null, attachment_url:null, kind:'markdown', tags:[], category_id:null, status:'draft', password:null, published_at:null })
const categoryDefaults = () => ({ name:'', slug:'', description:'', cover_url:null, sort_order:0 })
const tagDefaults = () => ({ name:'', color:'#a78bfa', description:'' })
const friendDefaults = () => ({ category:'朋友们', name:'', url:'', avatar_url:null, description:'', tags:[], background:null, sort_order:0, is_visible:true })
const postForm = reactive(postDefaults()), categoryForm = reactive(categoryDefaults()), tagForm = reactive(tagDefaults()), friendForm = reactive(friendDefaults())
const appearance = reactive({ accent:'#ed6ea0', banner_url:'', banners:[], use_system_banners:true, background_url:'', show_archives:true, show_friends:true })
const profileDefaults = () => ({portrait_url:null,introduction:'',traits:Array.from({length:6},()=>({title:'',subtitle:''})),skills:[],timeline:[],snapshots:[],contact_email:'',contact_message:''})
const profileForm = reactive(profileDefaults())
const socialLinks = reactive({github:'',weibo:'',bilibili:'',email:''})
const socialNetworks = [{key:'github',label:'GitHub',placeholder:'https://github.com/...'},{key:'weibo',label:'微博',placeholder:'https://weibo.com/...'},{key:'bilibili',label:'B站',placeholder:'https://space.bilibili.com/...'},{key:'email',label:'邮箱',placeholder:'mailto:hello@example.com'}]
const accentColors = ['#ed6ea0','#ff9f43','#f7c948','#42b883','#22b8cf','#5b7cfa','#9b6df5']
const systemBanners = ['/default-cover.jpg','/system-banners/web.jpg','/system-banners/os.jpg','/system-banners/oo.jpg','/system-banners/co.jpg']
const navigation = computed(() => [{key:'posts',label:'文章管理',icon:'▤',count:posts.value.length},{key:'taxonomy',label:'分类 / 标签',icon:'▦'},{key:'profile',label:'个人档案',icon:'♙'},{key:'friends',label:'友链',icon:'♡'},{key:'site',label:'站点设置',icon:'⚙'}])
const pageTitle = computed(() => navigation.value.find(item => item.key === section.value)?.label || '写文章')
const filteredPosts = computed(() => posts.value.filter(post => (!postQuery.value || `${post.title} ${post.excerpt}`.toLowerCase().includes(postQuery.value.toLowerCase())) && (!postStatus.value || post.status === postStatus.value) && (!postCategory.value || String(post.category?.id || '') === postCategory.value)))
const paginatedPosts = computed(() => filteredPosts.value.slice((currentPage.value-1)*pageSize.value,currentPage.value*pageSize.value))
const pagedCategories = computed(() => categories.value.slice((categoryPage.value-1)*taxonomyPageSize.value,categoryPage.value*taxonomyPageSize.value))
const pagedTags = computed(() => tags.value.slice((tagPage.value-1)*taxonomyPageSize.value,tagPage.value*taxonomyPageSize.value))
const friendGroups = computed(() => Object.values(friends.value.reduce((groups,item)=>{const name=item.category||'朋友们';(groups[name]??={name,items:[]}).items.push(item);return groups},{})))
const allPageCategoriesSelected = computed(() => pagedCategories.value.length > 0 && pagedCategories.value.every(item => selectedCategoryIds.value.includes(item.id)))
const allPageTagsSelected = computed(() => pagedTags.value.length > 0 && pagedTags.value.every(tag => selectedTagNames.value.includes(tag.name)))
function togglePageCategories(event){const ids=pagedCategories.value.map(item=>item.id);selectedCategoryIds.value=event.target.checked?[...new Set([...selectedCategoryIds.value,...ids])]:selectedCategoryIds.value.filter(id=>!ids.includes(id))}
function togglePageTags(event){const names=pagedTags.value.map(tag=>tag.name);selectedTagNames.value=event.target.checked?[...new Set([...selectedTagNames.value,...names])]:selectedTagNames.value.filter(name=>!names.includes(name))}
const previewHtml = computed(() => {
  try {
    return md.render(postForm.content || '*预览会显示在这里…*')
  } catch {
    return '<p class="preview-error">公式语法有误，请检查 LaTeX 内容。</p>'
  }
})
const editorStats = computed(() => { const text=postForm.content||''; return {characters:text.replace(/\s/g,'').length,minutes:Math.max(1,Math.ceil(text.length/500)),paragraphs:text.split(/\n\s*\n/).filter(Boolean).length,images:(text.match(/!\[/g)||[]).length} })

async function load(){
  [blog.value,profile.value,categories.value,posts.value,tags.value,friends.value]=await Promise.all(['/api/dashboard/blog','/api/dashboard/profile','/api/dashboard/categories','/api/dashboard/posts','/api/dashboard/tags','/api/dashboard/friends'].map(apiGet))
  Object.assign(profileForm,profileDefaults(),profile.value)
  profileForm.traits=[...(profile.value.traits||[])]
  while(profileForm.traits.length<6)profileForm.traits.push({title:'',subtitle:''})
  Object.assign(appearance,{...appearance,...(blog.value.settings?.appearance||{})})
  Object.assign(socialLinks,blog.value.settings?.social_links||{})
  typewriterText.value=(blog.value.settings?.typewriter_text||[]).join('\n')
}
function flash(text){notice.value=text;setTimeout(()=>notice.value='',2400)}
function openSection(key){ if(key==='editor') newPost(); else section.value=key }
function newPost(){editingPostId.value=null;Object.assign(postForm,postDefaults());tagsText.value='';selectedPostTags.value=[];section.value='editor'}
function editPost(post){editingPostId.value=post.id;Object.assign(postForm,post);postForm.category_id=post.category?.id||null;selectedPostTags.value=[...(post.tags||[])];tagsText.value=selectedPostTags.value.join(', ');section.value='editor'}
async function savePost(status=postForm.status){postForm.status=status;const payload={...postForm,tags:tagsText.value.split(',').map(x=>x.trim()).filter(Boolean)};await (editingPostId.value?apiPut(`/api/dashboard/posts/${editingPostId.value}`,payload):apiPost('/api/dashboard/posts',payload));posts.value=await apiGet('/api/dashboard/posts');tags.value=await apiGet('/api/dashboard/tags');section.value='posts';flash(status==='published'?'文章已发布':'草稿已保存')}
async function publishPost(post){await apiPost(`/api/dashboard/posts/${post.id}/publish`,{});posts.value=await apiGet('/api/dashboard/posts');flash('文章已发布')}
async function removePost(post){if(confirm(`删除文章“${post.title}”？`)){await apiDelete(`/api/dashboard/posts/${post.id}`);posts.value=posts.value.filter(x=>x.id!==post.id)}}
async function uploadCover(event){const file=event.target.files?.[0];if(!file)return;const body=new FormData();body.append('file',file);const result=await api('/api/dashboard/uploads?folder=covers',{method:'POST',body});postForm.cover_url=result.url;flash('封面已上传')}
async function uploadEditorFile(file, type){
  if(!file)return
  const isImage=file.type.startsWith('image/')
  const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')
  if(!isImage&&!isPdf){flash('只支持图片或 PDF 文件');return}
  const body=new FormData();body.append('file',file)
  const result=await api(`/api/dashboard/uploads?folder=${isImage?'articles':'attachments'}`,{method:'POST',body})
  if(isPdf)postForm.attachment_url=result.url
  const safeName=(file.name||type||'附件').replace(/[\[\]]/g,'')
  await insertAtCursor(isImage?`![${safeName}](${result.url})`:`[📎 ${safeName}](${result.url})`)
  flash(`${isImage?'图片':'PDF'}已上传并插入`)
}
const requestImageUpload=({file})=>uploadEditorFile(file,'图片')
const requestPdfUpload=({file})=>uploadEditorFile(file,'PDF')
async function insertAtCursor(markdown){
  const textarea=sourceEditor.value
  const start=textarea?.selectionStart??postForm.content.length
  const end=textarea?.selectionEnd??start
  postForm.content=`${postForm.content.slice(0,start)}\n${markdown}\n${postForm.content.slice(end)}`
  await nextTick()
  textarea?.focus()
  textarea?.setSelectionRange(start+markdown.length+2,start+markdown.length+2)
}
function handleEditorPaste(event){const file=[...(event.clipboardData?.files||[])].find(item=>item.type.startsWith('image/')||item.type==='application/pdf');if(file){event.preventDefault();uploadEditorFile(file,'粘贴文件')}}
function handleEditorDrop(event){const file=[...(event.dataTransfer?.files||[])].find(item=>item.type.startsWith('image/')||item.type==='application/pdf');if(file)uploadEditorFile(file,'拖入文件')}
function categoryName(post){return post.category?.name||'未分类'} function countCategory(id){return posts.value.filter(post=>post.category?.id===id).length}
function openCategoryDialog(item=null){editingCategoryId.value=item?.id||null;Object.assign(categoryForm,item||categoryDefaults());categoryDialogVisible.value=true}
async function saveCategory(){await (editingCategoryId.value?apiPut(`/api/dashboard/categories/${editingCategoryId.value}`,categoryForm):apiPost('/api/dashboard/categories',categoryForm));categories.value=await apiGet('/api/dashboard/categories');categoryDialogVisible.value=false;editingCategoryId.value=null;Object.assign(categoryForm,categoryDefaults());flash('分类已保存')}
async function uploadCategoryCover({file}){const body=new FormData();body.append('file',file);const result=await api('/api/dashboard/uploads?folder=covers',{method:'POST',body});categoryForm.cover_url=result.url;flash('分类封面已上传')}
async function removeCategory(item){if(confirm(`删除分类“${item.name}”？`)){await apiDelete(`/api/dashboard/categories/${item.id}`);categories.value=categories.value.filter(x=>x.id!==item.id)}}
async function removeTag(tag){if(confirm(`删除标签“${tag.name}”？`)){await apiDelete(`/api/dashboard/tags/${encodeURIComponent(tag.name)}`);tags.value=tags.value.filter(x=>x.name!==tag.name)}}
function openTagEditDialog(tag=null){editingTagName.value=tag?.name||'';Object.assign(tagForm,tag?{name:tag.name,color:tag.color,description:tag.description}:tagDefaults());tagEditDialogVisible.value=true}
async function saveTag(){tags.value=editingTagName.value?await apiPut(`/api/dashboard/tags/${encodeURIComponent(editingTagName.value)}`,tagForm):await apiPost('/api/dashboard/tags',tagForm);tagEditDialogVisible.value=false;editingTagName.value='';Object.assign(tagForm,tagDefaults());flash('标签已保存')}
async function bulkRemoveCategories(){if(!confirm(`删除选中的 ${selectedCategoryIds.value.length} 个分类？`))return;await Promise.all(selectedCategoryIds.value.map(id=>apiDelete(`/api/dashboard/categories/${id}`)));selectedCategoryIds.value=[];categories.value=await apiGet('/api/dashboard/categories')}
async function bulkRemoveTags(){if(!confirm(`删除选中的 ${selectedTagNames.value.length} 个标签？`))return;await Promise.all(selectedTagNames.value.map(name=>apiDelete(`/api/dashboard/tags/${encodeURIComponent(name)}`)));selectedTagNames.value=[];tags.value=await apiGet('/api/dashboard/tags')}
function openTagPicker(){selectedPostTags.value=tagsText.value.split(',').map(x=>x.trim()).filter(Boolean);tagDialogVisible.value=true}
function confirmTags(){tagsText.value=selectedPostTags.value.join(', ');tagDialogVisible.value=false}
async function saveProfile(){profile.value=await apiPut('/api/dashboard/profile',profileForm);Object.assign(profileForm,profile.value);flash('个人档案已保存')}
async function saveSiteSettings(){blog.value.settings={...(blog.value.settings||{}),appearance:{...appearance,use_system_banners:!appearance.banners.length},social_links:{...socialLinks},typewriter_text:typewriterText.value.split('\n').map(item=>item.trim()).filter(Boolean)};blog.value=await apiPatch('/api/dashboard/blog',blog.value);flash('站点设置已保存')}
async function uploadSettingImage(file,folder='covers'){const body=new FormData();body.append('file',file);return api(`/api/dashboard/uploads?folder=${folder}`,{method:'POST',body})}
async function uploadAvatar({file}){const result=await uploadSettingImage(file,'avatars');blog.value.avatar_url=result.url;flash('头像已上传，保存设置后生效')}
async function uploadBanner({file}){const result=await uploadSettingImage(file,'covers');appearance.banners.push(result.url);appearance.use_system_banners=false;flash('横幅已上传并加入列表')}
function removeBanner(index){appearance.banners.splice(index,1);if(!appearance.banners.length)appearance.use_system_banners=true}
async function uploadProfilePortrait({file}){const result=await uploadSettingImage(file,'profiles');profileForm.portrait_url=result.url;flash('人物图片已上传')}
async function uploadProfileSnapshot({file}){const result=await uploadSettingImage(file,'profiles');profileForm.snapshots.push({url:result.url,title:'',description:''});flash('生活碎片已上传')}
function newFriend(){editingFriendId.value=null;Object.assign(friendForm,friendDefaults());friendTagsText.value='';friendDialogVisible.value=true}
function editFriend(item){editingFriendId.value=item.id;Object.assign(friendForm,item);friendTagsText.value=(item.tags||[]).join(', ');friendDialogVisible.value=true}
async function saveFriend(){const payload={...friendForm,tags:friendTagsText.value.split(',').map(x=>x.trim()).filter(Boolean)};await (editingFriendId.value?apiPut(`/api/dashboard/friends/${editingFriendId.value}`,payload):apiPost('/api/dashboard/friends',payload));friends.value=await apiGet('/api/dashboard/friends');friendDialogVisible.value=false;flash('友链已保存')}
async function removeFriend(item){if(confirm(`删除友链“${item.name}”？`)){await apiDelete(`/api/dashboard/friends/${item.id}`);friends.value=friends.value.filter(x=>x.id!==item.id)}}
function tagTone(value){let hash=0;for(const char of value)hash=(hash*31+char.codePointAt(0))%6;return `tag-tone-${hash}`}
function updateTaxonomyPageSize(){taxonomyPageSize.value=Math.max(5,Math.floor((window.innerHeight-260)/58));categoryPage.value=Math.min(categoryPage.value,Math.max(1,Math.ceil(categories.value.length/taxonomyPageSize.value)));tagPage.value=Math.min(tagPage.value,Math.max(1,Math.ceil(tags.value.length/taxonomyPageSize.value)))}
watch([postQuery,postStatus,postCategory,pageSize],()=>{currentPage.value=1})
const formatDate=value=>new Date(value).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit',year:'numeric'})
function logout(){auth.logout();router.push('/')}
onMounted(()=>{load();updateTaxonomyPageSize();window.addEventListener('resize',updateTaxonomyPageSize)})
onBeforeUnmount(()=>window.removeEventListener('resize',updateTaxonomyPageSize))
</script>
