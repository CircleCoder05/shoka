<template>
  <div class="dashboard-page">
    <aside class="dashboard-nav">
      <div class="dashboard-brand"><span>S</span><div><strong>Shoka</strong><small>创作中心</small></div></div>
      <nav>
        <button v-for="item in sections" :key="item.key" :class="{ active: section === item.key }" @click="section = item.key">
          <span>{{ item.icon }}</span>{{ item.label }}<b v-if="item.count !== undefined">{{ item.count }}</b>
        </button>
      </nav>
      <div class="nav-footer"><router-link to="/">← 返回博客</router-link><button @click="logout">退出登录</button></div>
    </aside>

    <main class="dashboard-main">
      <header class="dashboard-title">
        <div><p>WORKSPACE</p><h1>{{ currentTitle }}</h1><span>{{ currentDescription }}</span></div>
        <button v-if="section === 'posts'" class="primary" @click="newPost">＋ 新建文章</button>
        <button v-if="section === 'categories'" class="primary" @click="newCategory">＋ 新建分类</button>
        <button v-if="section === 'friends'" class="primary" @click="newFriend">＋ 新建友链</button>
      </header>
      <p v-if="notice" class="notice">{{ notice }}</p>

      <section v-if="section === 'overview'" class="overview-grid">
        <article><span>文章</span><strong>{{ posts.length }}</strong><small>{{ publishedCount }} 篇已发布</small></article>
        <article><span>分类</span><strong>{{ categories.length }}</strong><small>内容结构</small></article>
        <article><span>友链</span><strong>{{ friends.length }}</strong><small>同行伙伴</small></article>
        <article><span>评论</span><strong>{{ comments.length }}</strong><small>等待交流</small></article>
      </section>

      <form v-if="section === 'profile' && blog" class="panel form-grid" @submit.prevent="saveBlog">
        <div class="panel-heading wide"><div><h2>公开资料</h2><p>首页和个人简介页会实时使用这些内容。</p></div></div>
        <label>博客地址标识<input v-model="blog.slug" required /></label>
        <label>博客标题<input v-model="blog.title" required /></label>
        <label>作者<input v-model="blog.author" required /></label>
        <label>副标题<input v-model="blog.subtitle" /></label>
        <label class="wide">一句话简介<textarea v-model="blog.description" rows="3"></textarea></label>
        <label class="wide">头像 URL<input v-model="blog.avatar_url" /></label>
        <label class="wide">格言<input v-model="blog.motto" /></label>
        <label class="wide">个人简介配置（JSON）<textarea v-model="profileText" rows="14" class="code-editor"></textarea><small>支持 profile、model3d 及信息卡片等现有结构。</small></label>
        <div class="wide actions"><button class="primary">保存资料</button></div>
      </form>

      <DataList v-if="section === 'categories'" :items="categories" empty="还没有分类">
        <template #default="{ item }"><div><strong>{{ item.name }}</strong><small>/{{ item.slug }}</small></div><RowActions @edit="editCategory(item)" @remove="removeCategory(item)" /></template>
      </DataList>
      <DataList v-if="section === 'posts'" :items="posts" empty="还没有文章">
        <template #default="{ item }"><div><strong>{{ item.title }}</strong><small>{{ item.status === 'published' ? '已发布' : '草稿' }} · /{{ item.slug }}</small></div><RowActions @edit="editPost(item)" @remove="removePost(item)" /></template>
      </DataList>
      <DataList v-if="section === 'friends'" :items="friends" empty="还没有友链">
        <template #default="{ item }"><div class="friend-row"><img :src="item.avatar_url || fallbackAvatar" alt="" /><div><strong>{{ item.name }}</strong><small>{{ item.category }} · {{ item.url }}</small></div></div><RowActions @edit="editFriend(item)" @remove="removeFriend(item)" /></template>
      </DataList>

      <section v-if="section === 'comments'" class="panel comment-admin">
        <article v-for="comment in comments" :key="comment.id">
          <div class="comment-admin-head"><strong>{{ comment.author_name }}</strong><time>{{ formatDate(comment.created_at) }}</time></div>
          <p>{{ comment.content }}</p>
          <div class="reply-compose"><input v-model="replyDrafts[comment.id]" placeholder="以博主身份回复…" /><button @click="replyComment(comment)">回复</button><button class="danger" @click="removeComment(comment)">删除</button></div>
        </article>
        <p v-if="!comments.length" class="empty">还没有评论。</p>
      </section>

      <form v-if="section === 'editor'" class="panel form-grid editor-form" @submit.prevent="savePost">
        <label class="wide">标题<input v-model="postForm.title" required /></label><label>路径标识<input v-model="postForm.slug" required /></label>
        <label>分类<select v-model="postForm.category_id"><option :value="null">未分类</option><option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
        <label>状态<select v-model="postForm.status"><option value="draft">草稿</option><option value="published">发布</option></select></label><label>标签（逗号分隔）<input v-model="tagsText" /></label>
        <label class="wide">摘要<textarea v-model="postForm.excerpt" rows="2"></textarea></label><label class="wide">Markdown 正文<textarea v-model="postForm.content" rows="18" class="code-editor"></textarea></label>
        <label>封面 URL<input v-model="postForm.cover_url" /></label><label>附件 URL<input v-model="postForm.attachment_url" /></label>
        <div class="wide actions"><button type="button" @click="section = 'posts'">取消</button><button class="primary">保存文章</button></div>
      </form>
      <form v-if="section === 'category-editor'" class="panel form-grid" @submit.prevent="saveCategory">
        <label>名称<input v-model="categoryForm.name" required /></label><label>路径标识<input v-model="categoryForm.slug" required /></label>
        <label class="wide">描述<textarea v-model="categoryForm.description"></textarea></label><label class="wide">封面 URL<input v-model="categoryForm.cover_url" /></label>
        <div class="wide actions"><button type="button" @click="section = 'categories'">取消</button><button class="primary">保存分类</button></div>
      </form>
      <form v-if="section === 'friend-editor'" class="panel form-grid" @submit.prevent="saveFriend">
        <label>名称<input v-model="friendForm.name" required /></label><label>分组<input v-model="friendForm.category" required /></label>
        <label class="wide">网址<input v-model="friendForm.url" type="url" required /></label><label class="wide">头像 URL<input v-model="friendForm.avatar_url" /></label>
        <label class="wide">简介<textarea v-model="friendForm.description"></textarea></label><label>标签（逗号分隔）<input v-model="friendTagsText" /></label><label>背景色/渐变<input v-model="friendForm.background" /></label>
        <div class="wide actions"><button type="button" @click="section = 'friends'">取消</button><button class="primary">保存友链</button></div>
      </form>
      <section v-if="section === 'files'" class="panel upload-panel"><h2>上传到阿里云 OSS</h2><p>图片、文章和附件统一存储到 OSS。</p><input type="file" @change="uploadFile" /><p v-if="uploadedUrl"><a :href="uploadedUrl" target="_blank">{{ uploadedUrl }}</a></p></section>
    </main>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import '@/styles/pages/dashboard.scss'

const DataList = defineComponent({ props: { items: Array, empty: String }, setup(props,{slots}) { return () => h('section',{class:'panel data-list'}, props.items?.length ? props.items.map(item=>h('div',{class:'data-row',key:item.id},slots.default({item}))) : h('p',{class:'empty'},props.empty)) } })
const RowActions = defineComponent({ emits:['edit','remove'], setup(_,{emit}) { return () => h('div',{class:'row-actions'},[h('button',{onClick:()=>emit('edit')},'编辑'),h('button',{class:'danger',onClick:()=>emit('remove')},'删除')]) } })
const router=useRouter(), auth=useAuthStore(), section=ref('overview'), blog=ref(null), categories=ref([]), posts=ref([]), friends=ref([]), comments=ref([])
const notice=ref(''), uploadedUrl=ref(''), editingPostId=ref(null), editingCategoryId=ref(null), editingFriendId=ref(null), tagsText=ref(''), friendTagsText=ref(''), profileText=ref('{}'), replyDrafts=reactive({})
const fallbackAvatar='https://api.dicebear.com/7.x/initials/svg?seed=friend'
const sections=computed(()=>[
  {key:'overview',label:'概览',icon:'◫'}, {key:'profile',label:'个人简介',icon:'○'}, {key:'posts',label:'文章管理',icon:'▤',count:posts.value.length},
  {key:'categories',label:'分类管理',icon:'◇',count:categories.value.length}, {key:'friends',label:'友链管理',icon:'∞',count:friends.value.length},
  {key:'comments',label:'评论管理',icon:'◌',count:comments.value.length}, {key:'files',label:'文件中心',icon:'↑'},
])
const titles={overview:['数据概览','快速掌握博客内容状态。'],profile:['个人简介','编辑博客身份与关于页面内容。'],posts:['文章管理','创建、发布并维护内容。'],categories:['分类管理','组织你的知识结构。'],friends:['友链管理','维护公开展示的伙伴链接。'],comments:['评论管理','回复读者或清理不合适的讨论。'],files:['文件中心','管理 OSS 上传资源。'],editor:['文章编辑器','专注写作与发布。'],'category-editor':['分类编辑','完善分类信息。'],'friend-editor':['友链编辑','维护伙伴资料。']}
const currentTitle=computed(()=>titles[section.value]?.[0]), currentDescription=computed(()=>titles[section.value]?.[1]), publishedCount=computed(()=>posts.value.filter(p=>p.status==='published').length)
const postDefaults=()=>({title:'',slug:'',excerpt:'',content:'',content_url:null,cover_url:null,attachment_url:null,kind:'markdown',tags:[],category_id:null,status:'draft',password:null,published_at:null})
const categoryDefaults=()=>({name:'',slug:'',description:'',cover_url:null,sort_order:0}), friendDefaults=()=>({category:'朋友们',name:'',url:'',avatar_url:null,description:'',tags:[],background:null,sort_order:0,is_visible:true})
const postForm=reactive(postDefaults()), categoryForm=reactive(categoryDefaults()), friendForm=reactive(friendDefaults())
async function load(){[blog.value,categories.value,posts.value,friends.value,comments.value]=await Promise.all(['/api/dashboard/blog','/api/dashboard/categories','/api/dashboard/posts','/api/dashboard/friends','/api/dashboard/comments'].map(apiGet));profileText.value=JSON.stringify(blog.value.profile||{},null,2)}
function flash(t){notice.value=t;setTimeout(()=>notice.value='',2400)}
async function saveBlog(){try{blog.value.profile=JSON.parse(profileText.value||'{}')}catch{flash('个人简介 JSON 格式不正确');return}blog.value=await apiPatch('/api/dashboard/blog',blog.value);flash('资料已保存')}
function newPost(){editingPostId.value=null;Object.assign(postForm,postDefaults());tagsText.value='';section.value='editor'} function editPost(p){editingPostId.value=p.id;Object.assign(postForm,p);postForm.category_id=p.category?.id||null;tagsText.value=p.tags.join(', ');section.value='editor'}
async function savePost(){const payload={...postForm,tags:tagsText.value.split(',').map(x=>x.trim()).filter(Boolean)};await (editingPostId.value?apiPut(`/api/dashboard/posts/${editingPostId.value}`,payload):apiPost('/api/dashboard/posts',payload));posts.value=await apiGet('/api/dashboard/posts');section.value='posts';flash('文章已保存')}
async function removePost(p){if(confirm(`删除文章“${p.title}”？`)){await apiDelete(`/api/dashboard/posts/${p.id}`);posts.value=posts.value.filter(x=>x.id!==p.id)}}
function newCategory(){editingCategoryId.value=null;Object.assign(categoryForm,categoryDefaults());section.value='category-editor'} function editCategory(x){editingCategoryId.value=x.id;Object.assign(categoryForm,x);section.value='category-editor'}
async function saveCategory(){await (editingCategoryId.value?apiPut(`/api/dashboard/categories/${editingCategoryId.value}`,categoryForm):apiPost('/api/dashboard/categories',categoryForm));categories.value=await apiGet('/api/dashboard/categories');section.value='categories';flash('分类已保存')}
async function removeCategory(x){if(confirm(`删除分类“${x.name}”？`)){await apiDelete(`/api/dashboard/categories/${x.id}`);categories.value=categories.value.filter(i=>i.id!==x.id)}}
function newFriend(){editingFriendId.value=null;Object.assign(friendForm,friendDefaults());friendTagsText.value='';section.value='friend-editor'} function editFriend(x){editingFriendId.value=x.id;Object.assign(friendForm,x);friendTagsText.value=(x.tags||[]).join(', ');section.value='friend-editor'}
async function saveFriend(){const payload={...friendForm,tags:friendTagsText.value.split(',').map(x=>x.trim()).filter(Boolean)};await (editingFriendId.value?apiPut(`/api/dashboard/friends/${editingFriendId.value}`,payload):apiPost('/api/dashboard/friends',payload));friends.value=await apiGet('/api/dashboard/friends');section.value='friends';flash('友链已保存')}
async function removeFriend(x){if(confirm(`删除友链“${x.name}”？`)){await apiDelete(`/api/dashboard/friends/${x.id}`);friends.value=friends.value.filter(i=>i.id!==x.id)}}
async function replyComment(x){const content=replyDrafts[x.id]?.trim();if(!content)return;await apiPost(`/api/dashboard/comments/${x.id}/reply`,{content});replyDrafts[x.id]='';comments.value=await apiGet('/api/dashboard/comments');flash('回复已发送')}
async function removeComment(x){if(confirm('删除这条评论及其回复？')){await apiDelete(`/api/dashboard/comments/${x.id}`);comments.value=comments.value.filter(i=>i.id!==x.id)}}
async function uploadFile(e){const file=e.target.files?.[0];if(!file)return;const body=new FormData();body.append('file',file);const result=await api('/api/dashboard/uploads?folder=files',{method:'POST',body});uploadedUrl.value=result.url;flash('文件已上传')}
const formatDate=v=>new Date(v).toLocaleString('zh-CN'); function logout(){auth.logout();router.push('/')} onMounted(load)
</script>
