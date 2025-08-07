<template>
  <div class="pdf-view-container">
    <div class="pdf-content">
      <div class="pdf-header">
        <h1>PDF 文档</h1>
        <p>浏览 PDF 文件</p>
      </div>

      <div class="pdf-list">
        <div v-for="pdf in pdfFiles" :key="pdf.name" class="pdf-item" @click="viewPdf(pdf.path)">
          <div class="pdf-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
              />
            </svg>
          </div>
          <div class="pdf-info">
            <h3>{{ pdf.name }}</h3>
            <p>{{ pdf.size }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pdfFiles = ref([])

// 获取PDF文件列表
const loadPdfFiles = async () => {
  try {
    // 从JSON文件加载PDF列表
    const response = await fetch('/pdf-files.json')
    if (response.ok) {
      pdfFiles.value = await response.json()
    } else {
      // 如果JSON文件不可用，使用硬编码的列表
      pdfFiles.value = [
        {
          name: '示例文档.pdf',
          path: '/pdf/sample.pdf',
          size: '1.3 MB',
        },
      ]
    }
  } catch (error) {
    console.error('加载PDF文件列表失败:', error)
    // 使用硬编码的列表作为fallback
    pdfFiles.value = [
      {
        name: '示例文档.pdf',
        path: '/pdf/sample.pdf',
        size: '1.3 MB',
      },
    ]
  }
}

// 查看PDF
const viewPdf = (pdfPath) => {
  // 从路径中提取文件名
  const fileName = pdfPath.split('/').pop()
  router.push(`/pdf/${fileName}`)
}

onMounted(() => {
  loadPdfFiles()
})
</script>

<style scoped>
.pdf-view-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.pdf-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pdf-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.pdf-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 600;
}

.pdf-header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.pdf-list {
  padding: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.pdf-item {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.pdf-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.pdf-icon {
  width: 50px;
  height: 50px;
  background: #667eea;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.pdf-icon svg {
  width: 30px;
  height: 30px;
}

.pdf-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.pdf-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-view-container {
    padding: 10px;
  }

  .pdf-header {
    padding: 30px 20px;
  }

  .pdf-header h1 {
    font-size: 2rem;
  }

  .pdf-list {
    padding: 20px;
    grid-template-columns: 1fr;
  }

  .pdf-viewer-content {
    max-width: 95vw;
    max-height: 95vh;
  }
}
</style>
