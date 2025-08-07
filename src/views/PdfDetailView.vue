<template>
  <PageContainer>
    <!-- PDF 标题区域 -->
    <div class="pdf-header">
      <h1>{{ pdfInfo.name }}</h1>
      <div class="pdf-meta">
        <span class="pdf-size">{{ pdfInfo.size }}</span>
        <span class="pdf-date">{{ pdfInfo.date }}</span>
      </div>
    </div>

    <!-- PDF 渲染区域 -->
    <div class="pdf-render-container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载PDF中...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <div v-else class="pdf-pages">
        <div v-for="(page, index) in pdfPages" :key="index" class="pdf-page">
          <div class="page-header">
            <span class="page-number">第 {{ index + 1 }} 页</span>
          </div>
          <img
            :src="page"
            :alt="`第 ${index + 1} 页`"
            class="page-image"
            @load="onPageLoad(index)"
            @error="onPageError(index)"
          />
        </div>
      </div>
    </div>

    <!-- PDF 信息 -->
    <div class="pdf-info">
      <div class="info-section">
        <h3>文档信息</h3>
        <p>{{ pdfInfo.description }}</p>
        <p v-if="pdfPages.length > 0">总页数：{{ pdfPages.length }} 页</p>
      </div>

      <div class="info-section">
        <h3>下载</h3>
        <a :href="pdfUrl" download class="download-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" class="download-icon">
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
          下载PDF
        </a>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import PageContainer from '@/components/PageContainer.vue'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const pdfInfo = ref({})
const pdfPages = ref([])
const loadedPages = ref(0)

// 从路由参数获取PDF文件名
const pdfName = computed(() => route.params.name)

// PDF URL
const pdfUrl = computed(() => `/pdf/${pdfName.value}`)

// 加载PDF.js
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      resolve(window.pdfjsLib)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// 渲染PDF页面
const renderPdfPages = async () => {
  try {
    const pdfjsLib = await loadPdfJs()

    // 加载PDF文档
    const loadingTask = pdfjsLib.getDocument(pdfUrl.value)
    const pdf = await loadingTask.promise

    console.log('PDF加载成功，总页数:', pdf.numPages)

    const pages = []
    const scale = 1.5 // 缩放比例

    // 渲染每一页
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })

      // 创建canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      // 渲染页面到canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // 将canvas转换为图片URL
      const imageUrl = canvas.toDataURL('image/png')
      pages.push(imageUrl)

      // 更新加载进度
      loadedPages.value = pageNum
    }

    pdfPages.value = pages
    loading.value = false
  } catch (err) {
    console.error('PDF渲染失败:', err)
    error.value = 'PDF渲染失败: ' + err.message
    loading.value = false
  }
}

// 页面加载完成
const onPageLoad = (index) => {
  console.log(`第 ${index + 1} 页加载完成`)
}

// 页面加载错误
const onPageError = (index) => {
  console.error(`第 ${index + 1} 页加载失败`)
}

// 加载PDF信息
const loadPdfInfo = async () => {
  try {
    // 从JSON文件获取PDF信息
    const response = await fetch('/pdf-files.json')
    if (response.ok) {
      const pdfFiles = await response.json()
      const currentPdf = pdfFiles.find((pdf) => pdf.path === pdfUrl.value)

      if (currentPdf) {
        pdfInfo.value = {
          name: currentPdf.name,
          size: currentPdf.size,
          description: currentPdf.description,
          date: new Date().toLocaleDateString('zh-CN'),
        }
      } else {
        // 如果找不到PDF信息，使用默认信息
        pdfInfo.value = {
          name: pdfName.value,
          size: '未知大小',
          description: 'PDF文档',
          date: new Date().toLocaleDateString('zh-CN'),
        }
      }
    } else {
      throw new Error('无法加载PDF文件信息')
    }
  } catch (err) {
    console.error('加载PDF信息失败:', err)
    error.value = '加载PDF信息失败'

    // 使用默认信息
    pdfInfo.value = {
      name: pdfName.value,
      size: '未知大小',
      description: 'PDF文档',
      date: new Date().toLocaleDateString('zh-CN'),
    }
  }
}

onMounted(async () => {
  await loadPdfInfo()
  await renderPdfPages()

  // 10秒后如果还在加载，就停止加载
  setTimeout(() => {
    if (loading.value) {
      loading.value = false
      error.value = 'PDF加载超时，请检查文件是否存在'
    }
  }, 10000)
})
</script>

<style scoped>
.pdf-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
  margin: -2rem -2rem 2rem -2rem;
  border-radius: 12px 12px 0 0;
}

.pdf-header h1 {
  margin: 0 0 15px 0;
  font-size: 2.5rem;
  font-weight: 600;
}

.pdf-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 1rem;
  opacity: 0.9;
}

.pdf-size,
.pdf-date {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
}

.pdf-render-container {
  margin-bottom: 2rem;
  min-height: 600px;
  position: relative;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  color: #e74c3c;
  padding: 40px;
}

.pdf-pages {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.pdf-page {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header {
  background: #f8f9fa;
  padding: 10px 20px;
  border-bottom: 1px solid #e9ecef;
}

.page-number {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.page-image {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
}

.pdf-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
}

.info-section {
  margin-bottom: 30px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.info-section p {
  margin: 0 0 10px 0;
  color: #666;
  line-height: 1.6;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #667eea;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.download-icon {
  width: 20px;
  height: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-header {
    padding: 30px 20px;
    margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  }

  .pdf-header h1 {
    font-size: 2rem;
  }

  .pdf-meta {
    flex-direction: column;
    gap: 10px;
  }

  .pdf-render-container {
    margin-bottom: 1.5rem;
  }

  .pdf-pages {
    gap: 1.5rem;
  }

  .pdf-info {
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
}

@media (max-width: 480px) {
  .pdf-header {
    padding: 20px 15px;
    margin: -0.75rem -0.75rem 0.75rem -0.75rem;
  }

  .pdf-info {
    padding: 1rem;
    margin-top: 1rem;
  }
}
</style>
