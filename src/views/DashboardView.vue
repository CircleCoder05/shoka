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
      <div class="studio-sidebar-actions"><button @click="logout">⇥ 登出</button></div>
    </aside>

    <div class="studio-workspace">
      <header class="studio-topbar">
        <div><button class="menu-button">☰</button><strong>{{ pageTitle }}</strong><button v-if="section==='profile'" class="primary" @click="saveProfile" style="margin-left:16px">保存个人档案</button><button v-if="section==='site'" class="primary" @click="saveSiteSettings" style="margin-left:16px">保存站点设置</button></div>
        <div class="topbar-actions"><router-link class="blog-return" to="/">← 返回博客</router-link></div>
      </header>

      <main :class="['studio-main', { 'taxonomy-page': section === 'taxonomy', 'posts-page': section === 'posts' }]">
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
                <div class="table-actions"><button class="icon-action" title="编辑文章" aria-label="编辑文章" @click="editPost(post)"><ActionIcon name="edit" /></button><button v-if="post.status !== 'published'" title="发布文章" aria-label="发布文章" @click="publishPost(post)">↑</button><button class="danger icon-action trash-action" title="删除文章" aria-label="删除文章" @click="removePost(post)"><ActionIcon /></button></div>
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
              <div class="editor-mode"><template v-if="postForm.kind === 'markdown'"><button :class="{ active: editorMode === 'write' }" @click="editorMode = 'write'">编辑</button><button :class="{ active: editorMode === 'preview' }" @click="editorMode = 'preview'">预览</button></template><el-select v-model="postForm.kind"><el-option label="Markdown" value="markdown" /><el-option label="PDF" value="pdf" /></el-select></div>
              <div v-if="postForm.kind === 'markdown'" :class="['writing-surface', `mode-${editorMode}`]">
                <textarea v-if="editorMode !== 'preview'" ref="sourceEditor" v-model="postForm.content" class="source-editor" spellcheck="false" placeholder="开始写下你的想法…&#10;&#10;支持 Markdown 与 LaTeX 语法。需要插入图片时可直接粘贴或拖入编辑区，文件会立即上传 OSS。" @paste="handleEditorPaste" @drop.prevent="handleEditorDrop"></textarea>
                <div v-if="editorMode !== 'write'" class="live-preview"><ArticleContent :html="previewHtml" /></div>
              </div>
              <el-upload v-else class="pdf-article-upload" drag :show-file-list="false" accept="application/pdf" :http-request="uploadPdfArticle"><div class="pdf-upload-icon">PDF</div><strong>{{ postForm.attachment_url ? 'PDF 已上传，点击可重新选择' : '点击或拖入 PDF 文件' }}</strong><span>文件选择后立即上传阿里云 OSS，不提供站内预览。</span><small v-if="postForm.attachment_url">{{ postForm.attachment_url }}</small></el-upload>
            </section>
            <aside class="editor-settings">
              <section class="editor-actions"><el-button @click="savePost('draft')">保存草稿</el-button><el-button type="primary" @click="savePost('published')">立即发布</el-button></section>
              <section class="studio-card"><h2>封面图</h2><label class="cover-uploader"><input type="file" accept="image/*" @change="uploadCover" /><div v-if="postForm.cover_url" class="img-upload-wrap" :class="{ 'is-uploading': isBlobUrl(postForm.cover_url) }"><img :src="postForm.cover_url" alt="" /><span class="upload-spinner"></span></div><span v-else>▧<b>点击上传封面图</b><small>支持 JPG、PNG、WebP</small></span></label></section>
              <section class="studio-card"><h2>文章摘要</h2><label class="excerpt-field"><textarea v-model="postForm.excerpt" rows="5" maxlength="300" placeholder="可选，将显示在文章列表中"></textarea><small>{{ postForm.excerpt.length }}/300</small></label></section>
              <section class="studio-card"><h2>发布设置</h2><label>分类<el-select v-model="postForm.category_id" placeholder="未分类" clearable><el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" /></el-select></label><label>标签<div class="tag-picker" @click="openTagPicker"><span v-if="!selectedPostTags.length">点击选择标签</span><b v-for="tag in selectedPostTags" :key="tag" :class="tagTone(tag)">{{ tag }}</b></div></label><div class="encryption-setting"><label class="switch-line"><span><strong>加密访问</strong><small>访客输入访问密钥后才能阅读</small></span><input v-model="postForm.password_enabled" type="checkbox" /></label><label v-if="postForm.password_enabled">访问密钥<input v-model="postForm.password" type="password" :placeholder="editingPostId && postForm.is_encrypted ? '留空则保持原密钥' : '设置访问密钥'" /></label></div></section>
              <section class="studio-card editor-stat"><h2>字数统计</h2><div><strong>{{ editorStats.characters }}</strong><span>字符</span><strong>{{ editorStats.minutes }}</strong><span>分钟</span></div><small>{{ editorStats.paragraphs }} 个段落 · {{ editorStats.images }} 张图片</small></section>
            </aside>
          </div>
        </template>

        <template v-else-if="section === 'taxonomy'">
          <div class="taxonomy-grid">
            <section class="studio-card taxonomy-panel taxonomy-table"><header><h2>♣ 分类列表</h2><div><el-button type="primary" @click="openCategoryDialog()">＋ 新建分类</el-button><el-button type="danger" plain :disabled="!selectedCategoryIds.length" @click="bulkRemoveCategories">批量删除</el-button><el-button @click="load">↻ 刷新</el-button></div></header><div class="taxonomy-table-head category-columns"><input type="checkbox" :checked="allPageCategoriesSelected" @change="togglePageCategories" /><span>分类名称</span><span>别名</span><span>文章数</span><span>描述</span><span>操作</span></div><div class="taxonomy-body"><article v-for="item in pagedCategories" :key="item.id" class="category-columns"><input v-model="selectedCategoryIds" type="checkbox" :value="item.id" /><div class="category-name"><img :src="item.cover_url || '/default-cover.jpg'" alt="" /><strong>{{ item.name }}</strong></div><span>{{ item.slug }}</span><b>{{ countCategory(item.id) }}</b><small>{{ item.description || '—' }}</small><div><button class="icon-action" title="编辑分类" aria-label="编辑分类" @click="openCategoryDialog(item)"><ActionIcon name="edit" /></button><button class="danger icon-action trash-action" title="删除分类" aria-label="删除分类" @click="removeCategory(item)"><ActionIcon /></button></div></article></div><footer><span>共 {{ categories.length }} 条</span><el-pagination v-model:current-page="categoryPage" :page-size="taxonomyPageSize" layout="prev, pager, next" :total="categories.length" background /></footer></section>
            <section class="studio-card taxonomy-panel taxonomy-table"><header><h2>◆ 标签列表</h2><div><el-button class="purple-button" @click="openTagEditDialog()">＋ 新建标签</el-button><el-button type="danger" plain :disabled="!selectedTagNames.length" @click="bulkRemoveTags">批量删除</el-button><el-button @click="load">↻ 刷新</el-button></div></header><div class="taxonomy-table-head tag-columns"><input type="checkbox" :checked="allPageTagsSelected" @change="togglePageTags" /><span>标签名称</span><span>颜色</span><span>文章数</span><span>说明</span><span>操作</span></div><div class="taxonomy-body"><article v-for="tag in pagedTags" :key="tag.name" class="tag-columns"><input v-model="selectedTagNames" type="checkbox" :value="tag.name" /><strong :class="['tag-name', tagTone(tag.name)]">{{ tag.name }}</strong><span class="tag-color"><i :class="tagTone(tag.name)"></i>{{ tag.color }}</span><b>{{ tag.post_count }}</b><small>{{ tag.description || '—' }}</small><div><button class="icon-action" title="编辑标签" aria-label="编辑标签" @click="openTagEditDialog(tag)"><ActionIcon name="edit" /></button><button class="danger icon-action trash-action" title="删除标签" aria-label="删除标签" @click="removeTag(tag)"><ActionIcon /></button></div></article></div><footer><span>共 {{ tags.length }} 条</span><el-pagination v-model:current-page="tagPage" :page-size="taxonomyPageSize" layout="prev, pager, next" :total="tags.length" background /></footer></section>
          </div>
        </template>

        <template v-else-if="section === 'profile'">
          <form class="profile-admin" @submit.prevent="saveProfile">
            <section class="studio-card profile-mode-switch"><div><h2>个人档案展示模式</h2><p>默认模式使用结构化卡片；Markdown 模式直接渲染自定义内容。</p></div><div class="profile-mode-actions"><el-radio-group v-model="profileForm.display_mode"><el-radio-button value="default">默认模式</el-radio-button><el-radio-button value="markdown">Markdown 模式</el-radio-button></el-radio-group></div></section>
            <template v-if="profileForm.display_mode === 'default'">
            <div class="profile-admin-columns">
              <div class="profile-admin-column">
                <section class="studio-card profile-admin-card portrait-admin-card"><header><div><h2>人物画像</h2><p>每项只填写一个最能代表你的特征值。</p></div><el-upload :show-file-list="false" accept="image/*" :http-request="uploadProfilePortrait"><el-button type="primary">上传人物图片</el-button></el-upload></header><div class="portrait-editor"><div v-if="profileForm.portrait_url" class="img-upload-wrap portrait-preview-wrap" :class="{ 'is-uploading': isBlobUrl(profileForm.portrait_url) }"><img class="profile-portrait-preview" :src="profileForm.portrait_url" alt="" /><span class="upload-spinner"></span></div><div class="repeat-grid"><label v-for="(item,index) in profileForm.traits" :key="index"><span>特质 {{ index+1 }}</span><input v-model="item.title" placeholder="如：慢热" /></label></div></div></section>
                <section class="studio-card profile-admin-card profile-skills"><h2>能力偏好</h2><div class="repeat-list"><label v-for="(item,index) in profileForm.skills" :key="index"><input v-model="item.name" placeholder="能力名称" /><input v-model.number="item.value" type="number" min="0" max="100" /><button type="button" class="danger icon-action trash-action" title="删除能力" aria-label="删除能力" @click="profileForm.skills.splice(index,1)"><ActionIcon /></button></label><el-button @click="profileForm.skills.push({name:'',value:80})">＋ 添加能力</el-button></div></section>
                <section class="studio-card profile-admin-card"><h2>联系与留言</h2><label>联系邮箱<input v-model="profileForm.contact_email" type="email" /></label><label>联系说明<textarea v-model="profileForm.contact_message" rows="4"></textarea></label></section>
              </div>
              <div class="profile-admin-column">
                <section class="studio-card profile-admin-card"><h2>自我陈述</h2><textarea v-model="profileForm.introduction" rows="9" placeholder="分段介绍自己"></textarea></section>
                <section class="studio-card profile-admin-card profile-timeline"><h2>人生时间线</h2><div class="repeat-list"><label v-for="(item,index) in profileForm.timeline" :key="index"><input v-model="item.title" placeholder="阶段标题" /><input v-model="item.description" placeholder="阶段描述" /><button type="button" class="danger icon-action trash-action" title="删除阶段" aria-label="删除阶段" @click="profileForm.timeline.splice(index,1)"><ActionIcon /></button></label><el-button @click="profileForm.timeline.push({title:'',description:''})">＋ 添加阶段</el-button></div></section>
              </div>
            </div>
            <section class="studio-card profile-admin-card profile-snapshots"><header><div><h2>精彩瞬间</h2><p>使用 3:4 竖图，每张图片只配一个标题。</p></div><el-upload :show-file-list="false" accept="image/*" :http-request="uploadProfileSnapshot"><el-button type="primary">＋ 上传图片</el-button></el-upload></header><div><article v-for="(item,index) in profileForm.snapshots" :key="item.url"><div class="img-upload-wrap snapshot-thumb" :class="{ 'is-uploading': isBlobUrl(item.url) }"><img :src="item.url" alt="" /><span class="upload-spinner"></span></div><input v-model="item.title" placeholder="精彩瞬间标题" /><button type="button" class="danger snapshot-remove icon-action trash-action" title="删除图片" aria-label="删除图片" @click="profileForm.snapshots.splice(index,1)"><ActionIcon /></button></article></div></section>
            </template>
            <section v-else class="studio-card profile-markdown-editor"><div class="profile-markdown-toolbar"><div><h2>Markdown 个人简介</h2><p>支持标题、列表、链接、图片、代码块和 LaTeX。</p></div><span>{{ profileForm.markdown_content.length }} 字符</span></div><textarea v-model="profileForm.markdown_content" spellcheck="false" placeholder="# 关于我&#10;&#10;在这里自由编写你的个人简介……"></textarea></section>
          </form>
        </template>

        <template v-else-if="section === 'friends'">
          <section class="studio-card friend-manager"><header><div><h2>友链列表</h2><p>按分组展示，编辑和新建均使用弹窗。</p></div><el-button type="primary" @click="newFriend">＋ 新增友链</el-button></header><div v-for="group in friendGroups" :key="group.name" class="friend-group"><h3>{{ group.name }}<span>{{ group.items.length }}</span></h3><article v-for="friend in group.items" :key="friend.id"><img :src="friend.avatar_url || fallbackAvatar" alt="" /><div><strong>{{ friend.name }}</strong><small>{{ friend.description || friend.url }}</small></div><span>{{ (friend.tags || []).join(' · ') || '—' }}</span><button @click="editFriend(friend)">编辑</button><button class="danger" @click="removeFriend(friend)">删除</button></article></div></section>
        </template>

        <template v-else-if="section === 'site' && blog">
          <form class="site-admin" @submit.prevent="saveSiteSettings">
            <div class="site-admin-column">
              <section class="studio-card site-identity"><div class="site-fields"><h2>资料卡</h2><label>昵称<input v-model="blog.author" /></label><label>个性签名<input v-model="blog.motto" /></label><label>站点标题（Banner 标题）<input v-model="blog.title" /></label><label>副标题<textarea v-model="typewriterText" rows="4" placeholder="输入 Banner 标题下方循环显示的文字"></textarea></label></div><aside class="avatar-settings"><div class="img-upload-wrap" :class="{ 'is-uploading': isBlobUrl(blog.avatar_url) }"><img :src="blog.avatar_url || fallbackAvatar" alt="" /><span class="upload-spinner"></span></div><el-upload :show-file-list="false" accept="image/*" :http-request="uploadAvatar"><el-button type="primary">更换头像</el-button></el-upload></aside></section>
              <section class="studio-card banner-settings">
                <label class="switch-line banner-toggle"><span><strong>使用系统默认横幅图</strong><small>开启后随机使用系统内置图片轮播；关闭则使用下方自定义横幅列表</small></span><input v-model="appearance.use_system_banners" type="checkbox" /></label>
                <template v-if="!appearance.use_system_banners">
                  <header><div><h2>自定义横幅列表</h2><p>上传的图片将作为前台 Banner 背景随机展示。</p></div><el-upload :show-file-list="false" accept="image/*" :http-request="uploadBanner"><el-button>＋ 上传 Banner</el-button></el-upload></header>
                  <div class="banner-list"><article v-for="(banner,index) in appearance.banners" :key="banner"><div class="banner-thumb"><img :src="banner" alt="" /><b>{{ String(index+1).padStart(2,'0') }}</b></div><span><strong>横幅图片 {{ index+1 }}</strong></span><button type="button" class="danger icon-action trash-action" title="删除横幅" aria-label="删除横幅" @click="removeBanner(index)"><ActionIcon /></button></article><p v-if="!appearance.banners.length" class="banner-empty">暂无自定义横幅，点击上方按钮上传。</p></div>
                </template>
              </section>
            </div>
            <div class="site-admin-column">
              <section class="studio-card social-settings"><header><div><h2>社交链接</h2><p>按列表维护前台侧边栏展示的链接。</p></div><el-button @click="openSocialDialog()">＋ 添加链接</el-button></header><div class="social-link-list"><article v-for="(item,index) in socialItems" :key="`${item.key}-${index}`"><span class="social-label"><i :class="['ic',socialIcon(item)]"></i><strong>{{ item.label }}</strong><small>{{ item.url }}</small></span><div><button type="button" class="icon-action" title="编辑链接" aria-label="编辑链接" @click="openSocialDialog(item,index)"><ActionIcon name="edit" /></button><button type="button" class="danger icon-action trash-action" title="删除链接" aria-label="删除链接" @click="removeSocialLink(index)"><ActionIcon /></button></div></article><p v-if="!socialItems.length" class="empty-inline">暂无社交链接，点击右上角添加。</p></div></section>
              <section class="studio-card pet-config-settings feature-settings">
                <header class="pet-card-header"><h2>AI 宠物设置</h2><label class="switch-line pet-toggle"><input v-model="petConfig.pet_enabled" type="checkbox" /></label></header>
                <div v-if="petConfig.pet_enabled" class="pet-card-body">
                  <div class="pet-current-row">
                    <span class="pet-current-preview" :style="petFrameStyle(activePetChar.image_url, 56)"></span>
                    <div class="pet-current-info">
                      <strong>{{ activePetChar.name }}</strong>
                      <small>{{ activePetChar.is_builtin ? '内置宠物' : '自定义宠物' }}</small>
                    </div>
                    <el-button type="primary" plain @click="openPetPicker">选择宠物</el-button>
                  </div>
                  <label class="switch-line"><span><strong>显示思考过程</strong></span><input v-model="petConfig.pet_thinking_enabled" type="checkbox" /></label>
                  <label>宠物名称<input v-model="petConfig.pet_name" placeholder="小助手" maxlength="20" /></label>
                  <label>风格<textarea v-model="petConfig.system_prompt" rows="6" placeholder="描述宠物的性格和说话风格，例如：&#10;你是一只傲娇的猫娘，说话带「喵~」尾音，喜欢吐槽但不讨厌读者。&#10;留空则使用默认风格。"></textarea><small>定义宠物的性格和说话方式，不要写身份描述。留空则使用该角色的默认风格。</small></label>
                </div>
              </section>
            </div>
          </form>
        </template>
      </main>
    </div>
    <el-dialog v-model="tagDialogVisible" title="选择文章标签" width="520px" append-to-body><el-checkbox-group v-model="selectedPostTags" class="tag-choice-grid"><el-checkbox v-for="tag in tags" :key="tag.name" :value="tag.name" border>{{ tag.name }}</el-checkbox></el-checkbox-group><template #footer><el-button @click="tagDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmTags">确定</el-button></template></el-dialog>
    <el-dialog v-model="categoryDialogVisible" :title="editingCategoryId ? '编辑分类' : '新建分类'" width="520px" append-to-body><form class="dialog-form" @submit.prevent="saveCategory"><label>分类名称<input v-model="categoryForm.name" required /></label><label>英文别名<input v-model="categoryForm.slug" placeholder="如 tech" required /></label><label>描述<textarea v-model="categoryForm.description" rows="3"></textarea></label><label>分类封面<el-upload :show-file-list="false" accept="image/*" :http-request="uploadCategoryCover"><div class="dialog-cover"><div v-if="categoryForm.cover_url" class="img-upload-wrap" :class="{ 'is-uploading': isBlobUrl(categoryForm.cover_url) }"><img :src="categoryForm.cover_url" alt="" /><span class="upload-spinner"></span></div><span v-else>点击选择图片，选中后立即上传 OSS</span></div></el-upload></label></form><template #footer><el-button @click="categoryDialogVisible=false">取消</el-button><el-button type="primary" @click="saveCategory">保存</el-button></template></el-dialog>
    <el-dialog v-model="tagEditDialogVisible" :title="editingTagName ? '编辑标签' : '新建标签'" width="480px" append-to-body><form class="dialog-form" @submit.prevent="saveTag"><label>标签名称<input v-model="tagForm.name" required /></label><label>颜色<div class="tag-color-editor"><input v-model="tagForm.color" type="color" /><input v-model="tagForm.color" type="text" maxlength="7" placeholder="#A78BFA" /><span :style="{backgroundColor:tagForm.color}"></span></div></label><label>说明<textarea v-model="tagForm.description" rows="3"></textarea></label></form><template #footer><el-button @click="tagEditDialogVisible=false">取消</el-button><el-button type="primary" @click="saveTag">保存</el-button></template></el-dialog>
    <el-dialog v-model="socialDialogVisible" :title="editingSocialIndex === null ? '添加社交链接' : '编辑社交链接'" width="520px" append-to-body><form class="dialog-form" @submit.prevent="saveSocialLink"><label>平台类型<el-select v-model="socialForm.key"><el-option v-for="network in socialNetworks" :key="network.key" :label="network.label" :value="network.key" /></el-select></label><label>显示名称<input v-model="socialForm.label" required placeholder="如 GitHub" /></label><label>链接地址<input v-model="socialForm.url" required placeholder="https://..." /></label></form><template #footer><el-button @click="socialDialogVisible=false">取消</el-button><el-button type="primary" @click="saveSocialLink">保存</el-button></template></el-dialog>
    <el-dialog v-model="friendDialogVisible" :title="editingFriendId ? '编辑友链' : '新增友链'" width="560px" append-to-body><form class="dialog-form" @submit.prevent="saveFriend"><label>名称<input v-model="friendForm.name" required /></label><label>分组<input v-model="friendForm.category" required /></label><label>网址<input v-model="friendForm.url" type="url" required /></label><label>头像 URL<input v-model="friendForm.avatar_url" /></label><label>简介<textarea v-model="friendForm.description" rows="3"></textarea></label><label>标签<input v-model="friendTagsText" placeholder="逗号分隔" /></label></form><template #footer><el-button @click="friendDialogVisible=false">取消</el-button><el-button type="primary" @click="saveFriend">保存</el-button></template></el-dialog>
    <el-dialog v-model="petPickerVisible" title="选择宠物" width="640px" append-to-body>
      <div class="pet-character-grid">
        <button
          v-for="char in petCharacters"
          :key="char.character_key"
          type="button"
          class="pet-character-item"
          :class="{ active: char.character_key === activePetChar.character_key }"
          @click="selectPetCharacter(char)"
        >
          <span class="pet-character-preview" :style="petFrameStyle(char.image_url, 72)"></span>
          <span class="pet-character-name">{{ char.name }}</span>
          <span v-if="!char.is_builtin" class="pet-character-edit" @click.stop="openPetEdit(char)">编辑</span>
          <span v-if="!char.is_builtin" class="pet-character-del" @click.stop="removePetCharacter(char)">删除</span>
        </button>
        <button type="button" class="pet-character-item pet-character-add" @click="openPetCreate">
          <span class="pet-add-icon">＋</span>
          <span class="pet-character-name">自定义</span>
        </button>
      </div>
    </el-dialog>
    <el-dialog v-model="petEditVisible" :title="petEditKey ? '编辑宠物' : '创建宠物'" width="560px" append-to-body>
      <form class="dialog-form" @submit.prevent="savePetCharacter">
        <label>宠物 ID<input v-model="petEditForm.character_key" :disabled="!!petEditKey" placeholder="如 my-dog（字母数字下划线连字符）" required /></label>
        <label>名称<input v-model="petEditForm.name" placeholder="如 狗子" required /></label>
        <label>精灵图<el-upload :show-file-list="false" accept="image/webp,image/*" :http-request="uploadPetSprite"><div class="dialog-cover"><div v-if="petEditForm.image_url" class="img-upload-wrap" :class="{ 'is-uploading': isBlobUrl(petEditForm.image_url) }"><img :src="petEditForm.image_url" alt="" /><span class="upload-spinner"></span></div><span v-else>点击上传 webp 精灵图，上传后自动保存到 OSS</span></div></el-upload></label>
        <label>性格提示词<textarea v-model="petEditForm.system_prompt" rows="4" placeholder="描述这个宠物的性格和说话风格"></textarea></label>
      </form>
      <template #footer><el-button @click="petEditVisible=false">取消</el-button><el-button type="primary" @click="savePetCharacter">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ElButton, ElCheckbox, ElCheckboxGroup, ElDialog, ElMessage, ElOption,
  ElPagination, ElRadioButton, ElRadioGroup, ElSelect, ElUpload,
} from 'element-plus'
import 'element-plus/es/components/base/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/checkbox/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/pagination/style/css'
import 'element-plus/es/components/radio-button/style/css'
import 'element-plus/es/components/radio-group/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/upload/style/css'
import { api, apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import { usePetStore } from '@/stores/pet'
import { renderMarkdown } from '@/utils/markdownRenderer'
import { petFrameStyle } from '@/utils/petSprite'
import ArticleContent from '@/components/ArticleContent.vue'
import ActionIcon from '@/components/dashboard/ActionIcon.vue'
import '@/styles/pages/dashboard.scss'

const router = useRouter(), route = useRoute(), auth = useAuthStore(), configStore = useConfigStore(), petStore = usePetStore()
const dashboardSections = new Set(['posts','editor','taxonomy','profile','friends','site'])
const section = ref(dashboardSections.has(route.params.section) ? route.params.section : 'posts'), editorMode = ref('write')
const blog = ref(null), profile = ref(null), posts = ref([]), categories = ref([]), tags = ref([]), friends = ref([])
const notice = ref(''), postQuery = ref(''), postStatus = ref(''), postCategory = ref(''), tagsText = ref(''), friendTagsText = ref(''), typewriterText = ref('')
const editingPostId = ref(null), editingCategoryId = ref(null), editingFriendId = ref(null)
const currentPage = ref(1), pageSize = ref(10), tagDialogVisible = ref(false), selectedPostTags = ref([]), sourceEditor = ref(null)
const categoryDialogVisible = ref(false), tagEditDialogVisible = ref(false), friendDialogVisible = ref(false), socialDialogVisible = ref(false), editingTagName = ref('')
const editingSocialIndex = ref(null)
const categoryPage = ref(1), tagPage = ref(1), taxonomyPageSize = ref(5)
const selectedCategoryIds = ref([]), selectedTagNames = ref([])
const fallbackAvatar = '/img/avatar.png'
const postDefaults = () => ({ title:'', excerpt:'', content:'', content_url:null, cover_url:null, attachment_url:null, kind:'markdown', tags:[], category_id:null, status:'draft', password_enabled:false, password:'', published_at:null })
const categoryDefaults = () => ({ name:'', slug:'', description:'', cover_url:null, sort_order:0 })
const tagDefaults = () => ({ name:'', color:'#a78bfa', description:'' })
const friendDefaults = () => ({ category:'朋友们', name:'', url:'', avatar_url:null, description:'', tags:[], background:null, sort_order:0, is_visible:true })
const postForm = reactive(postDefaults()), categoryForm = reactive(categoryDefaults()), tagForm = reactive(tagDefaults()), friendForm = reactive(friendDefaults())
const appearance = reactive({ accent:'#ed6ea0', banner_url:'', banners:[], use_system_banners:true, background_url:'', show_archives:true, show_friends:true })
const petConfig = reactive({ pet_name:'小助手', system_prompt:'', pet_enabled:true, pet_thinking_enabled:false, active_character:'ikun' })
const petCharacters = ref([])
const petPickerVisible = ref(false)
const petEditVisible = ref(false)
const petEditKey = ref(null)
const petEditForm = reactive({ character_key:'', name:'', image_url:'', system_prompt:'' })
const profileDefaults = () => ({display_mode:'default',markdown_content:'',portrait_url:null,introduction:'',traits:Array.from({length:6},()=>({title:''})),skills:[],timeline:[],snapshots:[],contact_email:'',contact_message:''})
const profileForm = reactive(profileDefaults())
const socialNetworks = [{key:'github',label:'GitHub',icon:'i-github',placeholder:'https://github.com/...'},{key:'music',label:'网易云音乐',icon:'i-cloud-music',placeholder:'https://music.163.com/...'},{key:'email',label:'邮箱',icon:'i-envelope',placeholder:'mailto:hello@example.com'},{key:'twitter',label:'Twitter',icon:'i-twitter',placeholder:'https://twitter.com/...'},{key:'facebook',label:'Facebook',icon:'i-facebook',placeholder:'https://facebook.com/...'},{key:'youtube',label:'YouTube',icon:'i-youtube',placeholder:'https://youtube.com/...'},{key:'weibo',label:'微博',icon:'i-weibo',placeholder:'https://weibo.com/...'},{key:'bilibili',label:'B站',icon:'i-tv',placeholder:'https://space.bilibili.com/...'}]
const socialItems = ref([])
const socialForm = reactive({ key:'github', label:'GitHub', url:'' })
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
    return renderMarkdown(postForm.content || '*预览会显示在这里…*')
  } catch {
    return '<p class="preview-error">公式语法有误，请检查 LaTeX 内容。</p>'
  }
})
const editorStats = computed(() => { const text=postForm.content||''; return {characters:text.replace(/\s/g,'').length,minutes:Math.max(1,Math.ceil(text.length/500)),paragraphs:text.split(/\n\s*\n/).filter(Boolean).length,images:(text.match(/!\[/g)||[]).length} })

async function load(){
  [blog.value,profile.value,categories.value,posts.value,tags.value,friends.value]=await Promise.all(['/api/dashboard/blog','/api/dashboard/profile','/api/dashboard/categories','/api/dashboard/posts','/api/dashboard/tags','/api/dashboard/friends'].map(apiGet))
  Object.assign(profileForm,profileDefaults(),profile.value)
  profileForm.traits=[...(profile.value.traits||[])].map(item=>({title:item.title||item.value||''}))
  while(profileForm.traits.length<6)profileForm.traits.push({title:''})
  profileForm.snapshots=[...(profile.value.snapshots||[])].map(item=>({url:item.url,title:item.title||item.description||''}))
  Object.assign(appearance,{...appearance,...(blog.value.settings?.appearance||{})})
  try {
    const cfg = await apiGet(`/api/pet/config/${blog.value.slug}`)
    if (cfg) {
      petConfig.pet_enabled = cfg.pet_enabled !== false
      petConfig.pet_thinking_enabled = cfg.pet_thinking_enabled === true
      petConfig.active_character = cfg.active_character || 'ikun'
      petCharacters.value = cfg.characters || []
      syncPetConfigFromActive()
    }
  } catch {}
  socialItems.value=normalizeSocialItems(blog.value.settings||{})
  typewriterText.value=(blog.value.settings?.typewriter_text?.length ? blog.value.settings.typewriter_text : [blog.value.subtitle]).filter(Boolean).join(' · ')
}
function flash(text,type='success'){ElMessage({message:text,type,plain:true,showClose:false,duration:2400})}
function isBlobUrl(url){return url && url.startsWith('blob:')}

// ---- AI 宠物：角色选择 / 自定义 ----
const activePetChar = computed(() =>
  petCharacters.value.find(c => c.character_key === petConfig.active_character) || petCharacters.value[0] || { name:'小助手', image_url:'', is_builtin:true }
)
function syncPetConfigFromActive(){
  const c = activePetChar.value
  petConfig.pet_name = c.name || '小助手'
  petConfig.system_prompt = c.system_prompt || ''
}
function openPetPicker(){ petPickerVisible.value = true }
function selectPetCharacter(char){
  petConfig.active_character = char.character_key
  syncPetConfigFromActive()
  petPickerVisible.value = false
}
function openPetCreate(){
  petEditKey.value = null
  Object.assign(petEditForm,{ character_key:'', name:'', image_url:'', system_prompt:'' })
  petEditVisible.value = true
}
function openPetEdit(char){
  petEditKey.value = char.character_key
  Object.assign(petEditForm,{ character_key:char.character_key, name:char.name, image_url:char.image_url, system_prompt:char.system_prompt })
  petEditVisible.value = true
}
async function savePetCharacter(){
  try {
    if (petEditKey.value) {
      await apiPatch(`/api/dashboard/pet-characters/${petEditKey.value}`,{ name:petEditForm.name, system_prompt:petEditForm.system_prompt, image_url:petEditForm.image_url })
    } else {
      await apiPost('/api/dashboard/pet-characters',{ ...petEditForm })
    }
    await reloadPetCharacters()
    petEditVisible.value = false
    flash('宠物已保存')
  } catch (err) { flash(err?.message || '保存失败','error') }
}
async function removePetCharacter(char){
  if(!confirm(`删除自定义宠物「${char.name}」？`)) return
  try {
    await apiDelete(`/api/dashboard/pet-characters/${char.character_key}`)
    await reloadPetCharacters()
    flash('宠物已删除')
  } catch (err) { flash(err?.message || '删除失败','error') }
}
async function reloadPetCharacters(){
  const cfg = await apiGet(`/api/pet/config/${blog.value.slug}`)
  if (cfg) {
    petConfig.pet_enabled = cfg.pet_enabled !== false
    petConfig.pet_thinking_enabled = cfg.pet_thinking_enabled === true
    petConfig.active_character = cfg.active_character || 'ikun'
    petCharacters.value = cfg.characters || []
    syncPetConfigFromActive()
  }
}
async function uploadPetSprite({ file }){
  const body = new FormData()
  body.append('file', file)
  const result = await api(`/api/dashboard/uploads?folder=pets`,{ method:'POST', body })
  petEditForm.image_url = result.url
  flash('精灵图已上传')
}
function navigateSection(key){section.value=key;if(route.params.section!==key)router.push(`/dashboard/${key}`)}
function openSection(key){ if(key==='editor') newPost(); else navigateSection(key) }
function newPost(){editingPostId.value=null;Object.assign(postForm,postDefaults());tagsText.value='';selectedPostTags.value=[];navigateSection('editor')}
function editPost(post){editingPostId.value=post.id;Object.assign(postForm,post,{password_enabled:!!post.is_encrypted,password:''});postForm.category_id=post.category?.id||null;selectedPostTags.value=[...(post.tags||[])];tagsText.value=selectedPostTags.value.join(', ');navigateSection('editor')}
async function savePost(status=postForm.status){if(postForm.kind==='pdf'&&!postForm.attachment_url){flash('请先上传 PDF 文件');return}if(postForm.password_enabled&&!postForm.password&&!postForm.is_encrypted){flash('请设置文章访问密钥');return}postForm.status=status;const payload={...postForm,tags:tagsText.value.split(',').map(x=>x.trim()).filter(Boolean)};await (editingPostId.value?apiPut(`/api/dashboard/posts/${editingPostId.value}`,payload):apiPost('/api/dashboard/posts',payload));posts.value=await apiGet('/api/dashboard/posts');tags.value=await apiGet('/api/dashboard/tags');navigateSection('posts');flash(status==='published'?'文章已发布':'草稿已保存')}
async function publishPost(post){await apiPost(`/api/dashboard/posts/${post.id}/publish`,{});posts.value=await apiGet('/api/dashboard/posts');flash('文章已发布')}
async function removePost(post){if(confirm(`删除文章“${post.title}”？`)){await apiDelete(`/api/dashboard/posts/${post.id}`);posts.value=posts.value.filter(x=>x.id!==post.id)}}
async function uploadCover(event){const file=event.target.files?.[0];if(!file)return;postForm.cover_url=localPreviewUrl(file);const body=new FormData();body.append('file',file);const result=await api('/api/dashboard/uploads?folder=covers',{method:'POST',body});postForm.cover_url=result.url;flash('封面已上传')}
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
async function uploadPdfArticle({file}){
  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){flash('请选择 PDF 文件');return}
  const body=new FormData();body.append('file',file)
  const result=await api('/api/dashboard/uploads?folder=attachments',{method:'POST',body})
  postForm.attachment_url=result.url
  postForm.content=''
  postForm.content_url=null
  flash('PDF 已上传')
}
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
async function uploadCategoryCover({file}){categoryForm.cover_url=localPreviewUrl(file);const body=new FormData();body.append('file',file);const result=await api('/api/dashboard/uploads?folder=covers',{method:'POST',body});categoryForm.cover_url=result.url;flash('分类封面已上传')}
async function removeCategory(item){if(confirm(`删除分类“${item.name}”？`)){await apiDelete(`/api/dashboard/categories/${item.id}`);categories.value=categories.value.filter(x=>x.id!==item.id)}}
async function removeTag(tag){if(confirm(`删除标签“${tag.name}”？`)){await apiDelete(`/api/dashboard/tags/${encodeURIComponent(tag.name)}`);tags.value=tags.value.filter(x=>x.name!==tag.name)}}
function openTagEditDialog(tag=null){editingTagName.value=tag?.name||'';Object.assign(tagForm,tag?{name:tag.name,color:tag.color,description:tag.description}:tagDefaults());tagEditDialogVisible.value=true}
async function saveTag(){tags.value=editingTagName.value?await apiPut(`/api/dashboard/tags/${encodeURIComponent(editingTagName.value)}`,tagForm):await apiPost('/api/dashboard/tags',tagForm);tagEditDialogVisible.value=false;editingTagName.value='';Object.assign(tagForm,tagDefaults());flash('标签已保存')}
async function bulkRemoveCategories(){if(!confirm(`删除选中的 ${selectedCategoryIds.value.length} 个分类？`))return;await Promise.all(selectedCategoryIds.value.map(id=>apiDelete(`/api/dashboard/categories/${id}`)));selectedCategoryIds.value=[];categories.value=await apiGet('/api/dashboard/categories')}
async function bulkRemoveTags(){if(!confirm(`删除选中的 ${selectedTagNames.value.length} 个标签？`))return;await Promise.all(selectedTagNames.value.map(name=>apiDelete(`/api/dashboard/tags/${encodeURIComponent(name)}`)));selectedTagNames.value=[];tags.value=await apiGet('/api/dashboard/tags')}
function openTagPicker(){selectedPostTags.value=tagsText.value.split(',').map(x=>x.trim()).filter(Boolean);tagDialogVisible.value=true}
function confirmTags(){tagsText.value=selectedPostTags.value.join(', ');tagDialogVisible.value=false}
async function saveProfile(){
  const payload={...profileForm,traits:profileForm.traits.map(item=>({title:item.title})),snapshots:profileForm.snapshots.map(item=>({url:item.url,title:item.title}))}
  profile.value=await apiPut('/api/dashboard/profile',payload)
  Object.assign(profileForm,profile.value)
  flash('个人档案已保存')
}
function normalizeSocialItems(settings){
  const fromList=Array.isArray(settings.social_links_list)?settings.social_links_list:[]
  if(fromList.length)return fromList.map(item=>({key:item.key||'link',label:item.label||socialNetwork(item.key)?.label||item.key||'链接',url:item.url||''})).filter(item=>item.url)
  const links=settings.social_links||{}
  return socialNetworks.map(network=>({key:network.key,label:network.label,url:links[network.key]||''})).filter(item=>item.url)
}
function socialNetwork(key){return socialNetworks.find(item=>item.key===key)}
function socialIcon(item){return socialNetwork(item.key)?.icon||'i-link'}
function openSocialDialog(item=null,index=null){editingSocialIndex.value=index;Object.assign(socialForm,item?{key:item.key,label:item.label,url:item.url}:{key:'github',label:'GitHub',url:''});socialDialogVisible.value=true}
function saveSocialLink(){
  if(!socialForm.label.trim()||!socialForm.url.trim()){flash('请填写名称和链接地址');return}
  const item={key:socialForm.key||'link',label:socialForm.label.trim(),url:socialForm.url.trim()}
  if(editingSocialIndex.value===null)socialItems.value.push(item)
  else socialItems.value.splice(editingSocialIndex.value,1,item)
  socialDialogVisible.value=false
}
function removeSocialLink(index){socialItems.value.splice(index,1)}
async function saveSiteSettings(){
  const normalizedSocialItems=socialItems.value.map(item=>({key:item.key||'link',label:item.label||socialNetwork(item.key)?.label||item.key||'链接',url:item.url||''})).filter(item=>item.url)
  const socialLinks=Object.fromEntries(normalizedSocialItems.map(item=>[item.key,item.url]))
  const subtitle=typewriterText.value.trim()
  blog.value.settings={...(blog.value.settings||{}),appearance:{...appearance},social_links:socialLinks,social_links_list:normalizedSocialItems,typewriter_text:subtitle?[subtitle]:[]}
  blog.value.subtitle=subtitle
  blog.value=await apiPatch('/api/dashboard/blog',blog.value)
  await apiPatch('/api/dashboard/pet-config',{
    pet_enabled: petConfig.pet_enabled,
    pet_thinking_enabled: petConfig.pet_thinking_enabled,
    active_character: petConfig.active_character,
    name: petConfig.pet_name,
    system_prompt: petConfig.system_prompt,
  })
  await petStore.loadPetConfig(blog.value.slug)
  configStore.invalidateConfig()
  await configStore.loadConfig()

  flash('站点设置已保存')
}
function localPreviewUrl(file){return file ? URL.createObjectURL(file) : ''}
async function uploadSettingImage(file,folder='covers'){const body=new FormData();body.append('file',file);return api(`/api/dashboard/uploads?folder=${folder}`,{method:'POST',body})}
async function uploadAvatar({file}){blog.value.avatar_url=localPreviewUrl(file);const result=await uploadSettingImage(file,'avatars');blog.value.avatar_url=result.url;flash('头像已上传，保存设置后生效')}
async function uploadBanner({file}){const localUrl=localPreviewUrl(file);appearance.banners.push(localUrl);appearance.banner_url=appearance.banners[0];const result=await uploadSettingImage(file,'covers');const idx=appearance.banners.indexOf(localUrl);if(idx!==-1)appearance.banners.splice(idx,1,result.url);appearance.banner_url=appearance.banners[0];flash('横幅已上传并加入列表')}
function removeBanner(index){appearance.banners.splice(index,1);appearance.banner_url=appearance.banners[0]||''}
async function uploadProfilePortrait({file}){profileForm.portrait_url=localPreviewUrl(file);const result=await uploadSettingImage(file,'profiles');profileForm.portrait_url=result.url;flash('人物图片已上传')}
async function uploadProfileSnapshot({file}){const localUrl=localPreviewUrl(file);profileForm.snapshots.push({url:localUrl,title:''});const result=await uploadSettingImage(file,'profiles');const item=profileForm.snapshots.find(s=>s.url===localUrl);if(item)item.url=result.url;flash('精彩瞬间已上传')}
function newFriend(){editingFriendId.value=null;Object.assign(friendForm,friendDefaults());friendTagsText.value='';friendDialogVisible.value=true}
function editFriend(item){editingFriendId.value=item.id;Object.assign(friendForm,item);friendTagsText.value=(item.tags||[]).join(', ');friendDialogVisible.value=true}
async function saveFriend(){const payload={...friendForm,tags:friendTagsText.value.split(',').map(x=>x.trim()).filter(Boolean)};await (editingFriendId.value?apiPut(`/api/dashboard/friends/${editingFriendId.value}`,payload):apiPost('/api/dashboard/friends',payload));friends.value=await apiGet('/api/dashboard/friends');friendDialogVisible.value=false;flash('友链已保存')}
async function removeFriend(item){if(confirm(`删除友链“${item.name}”？`)){await apiDelete(`/api/dashboard/friends/${item.id}`);friends.value=friends.value.filter(x=>x.id!==item.id)}}
function tagTone(value){let hash=0;for(const char of value)hash=(hash*31+char.codePointAt(0))%6;return `tag-tone-${hash}`}
function updateTaxonomyPageSize(){taxonomyPageSize.value=Math.max(5,Math.floor((window.innerHeight-260)/58));categoryPage.value=Math.min(categoryPage.value,Math.max(1,Math.ceil(categories.value.length/taxonomyPageSize.value)));tagPage.value=Math.min(tagPage.value,Math.max(1,Math.ceil(tags.value.length/taxonomyPageSize.value)))}
watch([postQuery,postStatus,postCategory,pageSize],()=>{currentPage.value=1})
watch(()=>route.params.section,(value)=>{if(dashboardSections.has(value))section.value=value})
watch(()=>postForm.kind,()=>{editorMode.value='write'})
watch(()=>socialForm.key,(key)=>{const network=socialNetwork(key);if(network&&(!socialForm.label||socialNetworks.some(item=>item.label===socialForm.label)))socialForm.label=network.label})
const formatDate=value=>new Date(value).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit',year:'numeric'})
function logout(){auth.logout();router.push('/')}
onMounted(()=>{load();updateTaxonomyPageSize();window.addEventListener('resize',updateTaxonomyPageSize)})
onBeforeUnmount(()=>window.removeEventListener('resize',updateTaxonomyPageSize))
</script>
