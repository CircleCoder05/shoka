<template>
  <div class="pdf-content">
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
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  pdfPath: {
    type: String,
    required: true,
  },
})

const loading = ref(true)
const error = ref('')
const pdfPages = ref([])
const loadedPages = ref(0)

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
    const loadingTask = pdfjsLib.getDocument(props.pdfPath)
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

// 监听pdfPath变化
watch(
  () => props.pdfPath,
  () => {
    if (props.pdfPath) {
      loading.value = true
      error.value = ''
      pdfPages.value = []
      renderPdfPages()
    }
  },
)

onMounted(() => {
  if (props.pdfPath) {
    renderPdfPages()
  }

  // 60秒后如果还在加载，就停止加载
  setTimeout(() => {
    if (loading.value) {
      loading.value = false
      error.value = 'PDF加载超时，请检查文件是否存在'
    }
  }, 60000)
})
</script>

<style scoped lang="scss" src="@/styles/sfc/views/articles/PdfContent.scss"></style>
