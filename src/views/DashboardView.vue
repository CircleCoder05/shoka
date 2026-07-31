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

        <template v-if="section === 'overview'">
          <section class="welcome-banner">
            <div><span>晚上好，{{ blog?.author }} ☾</span><p>每一次记录，都是向世界留下的思考。</p><button @click="newPost">继续创作吧 →</button></div>
          </section>
          <section class="metric-grid">
            <article v-for="metric in metrics" :key="metric.label"><i :class="metric.tone">{{ metric.icon }}</i><div><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.note }}</small></div></article>
          </section>
          <div class="overview-columns">
            <section class="studio-card recent-panel">
              <header><div><h2>最近文章</h2><p>近期更新的内容</p></div><button @click="section = 'posts'">查看全部 →</button></header>
              <div v-for="post in posts.slice(0, 5)" :key="post.id" class="recent-row">
                <img :src="post.cover_url || '/default-cover.jpg'" alt="" />
                <div><strong>{{ post.title }}</strong><small>{{ categoryName(post) }} · {{ formatDate(post.updated_at) }}</small></div>
                <span :class="['status-pill', post.status]">{{ post.status === 'published' ? '已发布' : '草稿' }}</span>
                <button @click="editPost(post)">•••</button>
              </div>
            </section>
            <aside class="overview-side">
              <section class="studio-card quick-panel"><h2>快速操作</h2><button @click="newPost"><i>✎</i><span>写文章<small>开始创作新内容</small></span></button><button @click="section = 'taxonomy'"><i>▰</i><span>分类管理<small>管理文章分类</small></span></button><button @click="openSettings('appearance')"><i>◉</i><span>主题外观<small>设置颜色与背景</small></span></button></section>
            </aside>
          </div>
        </template>

        <template v-else-if="section === 'posts'">
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
          <header class="editor-topline"><button @click="section = 'posts'">← 返回文章管理</button><div><button @click="savePost('draft')">保存草稿</button><button class="primary" @click="savePost('published')">发布文章</button></div></header>
          <div class="editor-layout">
            <section class="editor-main studio-card">
              <label class="title-field"><span>文章标题</span><input v-model="postForm.title" placeholder="输入一个吸引人的标题" maxlength="255" /><small>{{ postForm.title.length }}/255</small></label>
              <div class="editor-mode"><button :class="{ active: editorMode === 'write' }" @click="editorMode = 'write'">编辑</button><button :class="{ active: editorMode === 'split' }" @click="editorMode = 'split'">分栏预览</button><button :class="{ active: editorMode === 'preview' }" @click="editorMode = 'preview'">仅预览</button><el-upload :show-file-list="false" accept="image/*" :http-request="requestImageUpload"><el-button text>插入图片</el-button></el-upload><el-upload :show-file-list="false" accept="application/pdf" :http-request="requestPdfUpload"><el-button text>插入 PDF</el-button></el-upload><el-select v-model="postForm.kind"><el-option label="Markdown" value="markdown" /><el-option label="Markdown + LaTeX" value="latex" /></el-select></div>
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
            </aside>
          </div>
        </template>

        <template v-else-if="section === 'taxonomy'">
          <header class="taxonomy-heading"><div><h1>分类 / 标签</h1><p>管理文章的分类与标签，让内容组织更清晰，查找更高效 ✨</p></div><div class="taxonomy-metrics"><span>分类总数 <b>{{ categories.length }}</b></span><span>标签总数 <b>{{ tags.length }}</b></span></div></header>
          <div class="taxonomy-grid">
            <section class="studio-card taxonomy-create"><header><h2>新增分类</h2></header><form class="inline-form" @submit.prevent="saveCategory"><label>分类名称<input v-model="categoryForm.name" placeholder="请输入分类名称" required /></label><label>别名<input v-model="categoryForm.slug" placeholder="如：tech，建议使用小写字母" required /></label><label>描述<input v-model="categoryForm.description" placeholder="请输入分类描述（可选）" /></label><el-button type="primary" native-type="submit">{{ editingCategoryId ? '保存修改' : '新增分类 ＋' }}</el-button></form></section>
            <section class="studio-card taxonomy-create"><header><h2>新增标签</h2></header><form class="inline-form" @submit.prevent="createTag"><label>标签名称<input v-model="tagForm.name" placeholder="请输入标签名称" required /></label><label>颜色<input v-model="tagForm.color" type="color" /></label><label>说明<input v-model="tagForm.description" placeholder="请输入标签说明（可选）" /></label><el-button class="purple-button" native-type="submit">新增标签 ＋</el-button></form></section>
            <section class="studio-card taxonomy-panel"><header><h2>分类列表</h2><span>共 {{ categories.length }} 条</span></header><div class="taxonomy-scroll"><article v-for="item in categories" :key="item.id"><span class="taxonomy-icon">▦</span><div><strong>{{ item.name }}</strong><small>{{ item.slug }} · {{ item.description }}</small></div><b>{{ countCategory(item.id) }} 篇</b><button @click="editCategory(item)">编辑</button><button class="danger" @click="removeCategory(item)">删除</button></article></div></section>
            <section class="studio-card taxonomy-panel"><header><h2>标签列表</h2><span>共 {{ tags.length }} 条</span></header><div class="taxonomy-scroll"><article v-for="tag in tags" :key="tag.name"><span :class="['taxonomy-icon', 'tag-icon', tagTone(tag.name)]">◆</span><div><strong :class="['tag-name', tagTone(tag.name)]">{{ tag.name }}</strong><small>{{ tag.description || `用于 ${tag.post_count} 篇文章` }}</small></div><b>{{ tag.post_count }} 篇</b><button @click="renameTag(tag)">编辑</button><button class="danger" @click="removeTag(tag)">删除</button></article><p v-if="!tags.length" class="empty">还没有标签。</p></div></section>
          </div>
        </template>

        <template v-else-if="section === 'settings' && blog">
          <nav class="settings-tabs"><button v-for="tab in settingTabs" :key="tab.key" :class="{ active: settingsTab === tab.key }" @click="settingsTab = tab.key">{{ tab.label }}</button></nav>
          <form v-if="settingsTab === 'basic'" class="settings-layout" @submit.prevent="saveBlog">
            <section class="studio-card settings-form"><h2>站点信息</h2><label>博客标题<input v-model="blog.title" /></label><label>个性签名<input v-model="blog.subtitle" /></label><label>博客简介<textarea v-model="blog.description" rows="4"></textarea></label><label>博客地址标识<input v-model="blog.slug" /></label><button class="primary">保存设置</button></section>
            <aside class="studio-card profile-preview"><span>站点预览</span><div class="preview-cover"></div><img :src="blog.avatar_url || fallbackAvatar" alt="" /><h3>{{ blog.title }}</h3><p>{{ blog.subtitle }}</p><small>{{ blog.description }}</small></aside>
          </form>
          <form v-else-if="settingsTab === 'profile'" class="settings-layout" @submit.prevent="saveBlog">
            <section class="studio-card settings-form"><h2>个人资料</h2><label>显示名称<input v-model="blog.author" /></label><label>个人格言<input v-model="blog.motto" /></label><label>头像 URL<input v-model="blog.avatar_url" /></label><label>关于页面配置（JSON）<textarea v-model="profileText" class="json-editor" rows="14"></textarea></label><button class="primary">保存资料</button></section>
            <aside class="studio-card profile-preview"><span>个人资料卡片预览</span><div class="preview-cover"></div><img :src="blog.avatar_url || fallbackAvatar" alt="" /><h3>{{ blog.author }}</h3><p>{{ blog.motto }}</p><small>{{ blog.description }}</small></aside>
          </form>
          <form v-else-if="settingsTab === 'appearance'" class="studio-card appearance-settings" @submit.prevent="saveAppearance">
            <h2>主题与首页外观</h2><label>主题强调色<div class="color-options"><button v-for="color in accentColors" :key="color" type="button" :class="{ selected: appearance.accent === color }" @click="appearance.accent = color"></button><input v-model="appearance.accent" type="color" /></div></label><label>首页横幅 URL<input v-model="appearance.banner_url" placeholder="OSS 图片地址" /></label><label>页面背景 URL<input v-model="appearance.background_url" placeholder="留空使用默认背景" /></label><label class="toggle-label"><span>首页展示归档入口</span><input v-model="appearance.show_archives" type="checkbox" /></label><label class="toggle-label"><span>首页展示友链入口</span><input v-model="appearance.show_friends" type="checkbox" /></label><div class="appearance-preview"><span>按钮</span><b>标签</b><a>链接文本</a></div><button class="primary">保存外观设置</button>
          </form>
          <section v-else class="studio-card friend-settings"><header><div><h2>友链管理</h2><p>公开展示在友链页面的站点。</p></div><button class="primary" @click="newFriend">＋ 新增友链</button></header><article v-for="friend in friends" :key="friend.id"><img :src="friend.avatar_url || fallbackAvatar" alt="" /><div><strong>{{ friend.name }}</strong><small>{{ friend.category }} · {{ friend.url }}</small></div><button @click="editFriend(friend)">编辑</button><button class="danger" @click="removeFriend(friend)">删除</button></article></section>
        </template>

        <form v-else-if="section === 'friend-editor'" class="studio-card friend-editor" @submit.prevent="saveFriend"><header><button type="button" @click="openSettings('friends')">← 返回友链管理</button></header><div><label>名称<input v-model="friendForm.name" required /></label><label>分组<input v-model="friendForm.category" required /></label><label>网址<input v-model="friendForm.url" type="url" required /></label><label>头像 URL<input v-model="friendForm.avatar_url" /></label><label>简介<textarea v-model="friendForm.description"></textarea></label><label>标签<input v-model="friendTagsText" placeholder="逗号分隔" /></label></div><button class="primary">保存友链</button></form>
      </main>
    </div>
    <el-dialog v-model="tagDialogVisible" title="选择文章标签" width="520px" append-to-body><el-checkbox-group v-model="selectedPostTags" class="tag-choice-grid"><el-checkbox v-for="tag in tags" :key="tag.name" :value="tag.name" border>{{ tag.name }}</el-checkbox></el-checkbox-group><template #footer><el-button @click="tagDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmTags">确定</el-button></template></el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
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

const md = new MarkdownIt({ html: false, linkify: true, breaks: true }).use(texmath, { engine: katex, delimiters: 'dollars' })
const router = useRouter(), auth = useAuthStore()
const section = ref('overview'), settingsTab = ref('basic'), editorMode = ref('split')
const blog = ref(null), posts = ref([]), categories = ref([]), tags = ref([]), friends = ref([])
const notice = ref(''), postQuery = ref(''), postStatus = ref(''), postCategory = ref(''), tagsText = ref(''), profileText = ref('{}'), friendTagsText = ref('')
const editingPostId = ref(null), editingCategoryId = ref(null), editingFriendId = ref(null)
const currentPage = ref(1), pageSize = ref(10), tagDialogVisible = ref(false), selectedPostTags = ref([]), sourceEditor = ref(null)
const fallbackAvatar = '/img/avatar.png'
const postDefaults = () => ({ title:'', excerpt:'', content:'', content_url:null, cover_url:null, attachment_url:null, kind:'markdown', tags:[], category_id:null, status:'draft', password:null, published_at:null })
const categoryDefaults = () => ({ name:'', slug:'', description:'', cover_url:null, sort_order:0 })
const tagDefaults = () => ({ name:'', color:'#a78bfa', description:'' })
const friendDefaults = () => ({ category:'朋友们', name:'', url:'', avatar_url:null, description:'', tags:[], background:null, sort_order:0, is_visible:true })
const postForm = reactive(postDefaults()), categoryForm = reactive(categoryDefaults()), tagForm = reactive(tagDefaults()), friendForm = reactive(friendDefaults())
const appearance = reactive({ accent:'#ed6ea0', banner_url:'', background_url:'', show_archives:true, show_friends:true })
const accentColors = ['#ed6ea0','#ff9f43','#f7c948','#42b883','#22b8cf','#5b7cfa','#9b6df5']
const settingTabs = [{key:'basic',label:'基本信息'},{key:'profile',label:'个人资料'},{key:'appearance',label:'主题外观'},{key:'friends',label:'友链管理'}]
const navigation = computed(() => [{key:'overview',label:'仪表盘',icon:'⌂'},{key:'posts',label:'文章管理',icon:'▤',count:posts.value.length},{key:'taxonomy',label:'分类 / 标签',icon:'▦'},{key:'settings',label:'博客设置',icon:'⚙'}])
const pageTitle = computed(() => navigation.value.find(item => item.key === section.value)?.label || (section.value === 'friend-editor' ? '友链编辑' : '写文章'))
const metrics = computed(() => [{label:'文章总数',value:posts.value.length,note:`${publishedCount.value} 篇已发布`,icon:'▤',tone:'pink'},{label:'草稿数',value:posts.value.length-publishedCount.value,note:'继续完成创作',icon:'✎',tone:'orange'},{label:'分类数',value:categories.value.length,note:'内容组织清晰',icon:'▦',tone:'purple'},{label:'标签数',value:tags.value.length,note:'知识关联网络',icon:'◆',tone:'blue'}])
const publishedCount = computed(() => posts.value.filter(post => post.status === 'published').length)
const filteredPosts = computed(() => posts.value.filter(post => (!postQuery.value || `${post.title} ${post.excerpt}`.toLowerCase().includes(postQuery.value.toLowerCase())) && (!postStatus.value || post.status === postStatus.value) && (!postCategory.value || String(post.category?.id || '') === postCategory.value)))
const paginatedPosts = computed(() => filteredPosts.value.slice((currentPage.value-1)*pageSize.value,currentPage.value*pageSize.value))
const previewHtml = computed(() => {
  try {
    return md.render(postForm.content || '*预览会显示在这里…*')
  } catch {
    return '<p class="preview-error">公式语法有误，请检查 LaTeX 内容。</p>'
  }
})
const editorStats = computed(() => { const text=postForm.content||''; return {characters:text.replace(/\s/g,'').length,minutes:Math.max(1,Math.ceil(text.length/500)),paragraphs:text.split(/\n\s*\n/).filter(Boolean).length,images:(text.match(/!\[/g)||[]).length} })

async function load(){ [blog.value,categories.value,posts.value,tags.value,friends.value]=await Promise.all(['/api/dashboard/blog','/api/dashboard/categories','/api/dashboard/posts','/api/dashboard/tags','/api/dashboard/friends'].map(apiGet)); profileText.value=JSON.stringify(blog.value.profile||{},null,2);Object.assign(appearance,{...appearance,...(blog.value.settings?.appearance||{})}) }
function flash(text){notice.value=text;setTimeout(()=>notice.value='',2400)}
function openSection(key){ if(key==='editor') newPost(); else section.value=key }
function openSettings(tab){settingsTab.value=tab;section.value='settings'}
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
function editCategory(item){editingCategoryId.value=item.id;Object.assign(categoryForm,item)}
async function saveCategory(){await (editingCategoryId.value?apiPut(`/api/dashboard/categories/${editingCategoryId.value}`,categoryForm):apiPost('/api/dashboard/categories',categoryForm));categories.value=await apiGet('/api/dashboard/categories');editingCategoryId.value=null;Object.assign(categoryForm,categoryDefaults());flash('分类已保存')}
async function removeCategory(item){if(confirm(`删除分类“${item.name}”？`)){await apiDelete(`/api/dashboard/categories/${item.id}`);categories.value=categories.value.filter(x=>x.id!==item.id)}}
async function renameTag(tag){const name=prompt('新的标签名称',tag.name)?.trim();if(name&&name!==tag.name)tags.value=await apiPut(`/api/dashboard/tags/${encodeURIComponent(tag.name)}`,{name})}
async function removeTag(tag){if(confirm(`删除标签“${tag.name}”？`)){await apiDelete(`/api/dashboard/tags/${encodeURIComponent(tag.name)}`);tags.value=tags.value.filter(x=>x.name!==tag.name)}}
async function createTag(){tags.value=await apiPost('/api/dashboard/tags',tagForm);Object.assign(tagForm,tagDefaults());flash('标签已创建')}
function openTagPicker(){selectedPostTags.value=tagsText.value.split(',').map(x=>x.trim()).filter(Boolean);tagDialogVisible.value=true}
function confirmTags(){tagsText.value=selectedPostTags.value.join(', ');tagDialogVisible.value=false}
async function saveBlog(){try{blog.value.profile=JSON.parse(profileText.value||'{}')}catch{flash('关于页面 JSON 格式不正确');return}blog.value=await apiPatch('/api/dashboard/blog',blog.value);flash('设置已保存')}
async function saveAppearance(){blog.value.settings={...(blog.value.settings||{}),appearance:{...appearance}};await saveBlog()}
function newFriend(){editingFriendId.value=null;Object.assign(friendForm,friendDefaults());friendTagsText.value='';section.value='friend-editor'}
function editFriend(item){editingFriendId.value=item.id;Object.assign(friendForm,item);friendTagsText.value=(item.tags||[]).join(', ');section.value='friend-editor'}
async function saveFriend(){const payload={...friendForm,tags:friendTagsText.value.split(',').map(x=>x.trim()).filter(Boolean)};await (editingFriendId.value?apiPut(`/api/dashboard/friends/${editingFriendId.value}`,payload):apiPost('/api/dashboard/friends',payload));friends.value=await apiGet('/api/dashboard/friends');openSettings('friends');flash('友链已保存')}
async function removeFriend(item){if(confirm(`删除友链“${item.name}”？`)){await apiDelete(`/api/dashboard/friends/${item.id}`);friends.value=friends.value.filter(x=>x.id!==item.id)}}
function tagTone(value){let hash=0;for(const char of value)hash=(hash*31+char.codePointAt(0))%6;return `tag-tone-${hash}`}
watch([postQuery,postStatus,postCategory,pageSize],()=>{currentPage.value=1})
const formatDate=value=>new Date(value).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit',year:'numeric'})
function logout(){auth.logout();router.push('/')}
onMounted(load)
</script>
