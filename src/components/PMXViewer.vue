<template>
  <div class="pmx-viewer">
    <div ref="container" class="model-container"></div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">
      <i class="ic i-warning"></i>
      {{ errorMessage }}
      <button @click="retryLoad" class="retry-btn">重试</button>
    </div>

    <!-- 模型信息 -->
    <div v-if="modelInfo" class="model-info">
      <span>{{ modelInfo.name }}</span>
      <span v-if="modelInfo.vertices">顶点: {{ modelInfo.vertices }}</span>
      <span v-if="modelInfo.faces">面数: {{ modelInfo.faces }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { MMDLoader } from '@/utils/mmd-loader/MMDLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  modelPath: {
    type: String,
    default: '/pmx/changzhang-pmx/changzhuang.pmx',
  },
  autoRotate: {
    type: Boolean,
    default: true,
  },
  showControls: {
    type: Boolean,
    default: true,
  },
})

const container = ref(null)
const loading = ref(true)
const loadingMessage = ref('正在加载模型...')
const errorMessage = ref('')
const modelInfo = ref(null)

let scene, camera, renderer, model, controls
let animationId = null

// 初始化 Three.js 场景
const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8f9fa)

  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.set(0, 15, 50) // 调整相机位置，让模型更大

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.value.appendChild(renderer.domElement)

  // 添加OrbitControls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = true
  controls.enablePan = true
  controls.enableRotate = true
}

// 设置光照
const setupLighting = () => {
  const ambientLight = new THREE.AmbientLight(0x404040, 1.8) // 增强环境光到1.2
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8) // 增强主光源
  directionalLight.position.set(5, 10, 7)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 添加补光
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8)
  fillLight.position.set(-5, 5, -5)
  scene.add(fillLight)
}

// 加载模型
const loadModel = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const loader = new MMDLoader()

    // 设置贴图路径
    loader.setPath('/pmx/changzhang-pmx/')

    // 加载 PMX 模型
    model = await loader.loadAsync('changzhuang.pmx')

    // 检查模型和材质
    if (model) {
      console.log('模型加载成功:', model)

      // 遍历模型，检查材质
      model.traverse((child) => {
        if (child.isMesh) {
          console.log('网格:', child.name, '材质:', child.material)
          console.log('材质类型:', child.material.type)
          console.log('材质颜色:', child.material.color)
          console.log('材质纹理:', child.material.map)
          console.log('材质透明度:', child.material.opacity)

          // 强制替换MeshToonMaterial为MeshLambertMaterial，但保留原颜色
          if (child.material) {
            if (Array.isArray(child.material)) {
              // 处理材质数组
              child.material = child.material.map((mat) => {
                if (mat.type === 'MeshToonMaterial') {
                  console.warn('替换MeshToonMaterial为MeshLambertMaterial，保留原颜色')
                  console.log('原材质颜色:', mat.color)
                  console.log('原材质纹理:', mat.map)
                  return new THREE.MeshLambertMaterial({
                    color: mat.color || 0xcccccc, // 保留原颜色
                    map: mat.map, // 保留纹理
                    transparent: mat.transparent || false,
                    opacity: mat.opacity || 1.0,
                    side: mat.side || THREE.FrontSide,
                    morphTargets: false, // 禁用morphTargets
                    // 增强材质亮度
                    emissive: new THREE.Color(0x444444), // 增强自发光颜色
                    emissiveIntensity: 0.4, // 增强自发光强度
                  })
                }
                return mat
              })
            } else if (child.material.type === 'MeshToonMaterial') {
              console.warn('替换MeshToonMaterial为MeshLambertMaterial，保留原颜色')
              console.log('原材质颜色:', child.material.color)
              console.log('原材质纹理:', child.material.map)
              child.material = new THREE.MeshLambertMaterial({
                color: child.material.color || 0xcccccc, // 保留原颜色
                map: child.material.map, // 保留纹理
                transparent: child.material.transparent || false,
                opacity: child.material.opacity || 1.0,
                side: child.material.side || THREE.FrontSide,
                morphTargets: false, // 禁用morphTargets
                // 增强材质亮度
                emissive: new THREE.Color(0x444444), // 增强自发光颜色
                emissiveIntensity: 0.4, // 增强自发光强度
              })
            }
          }

          // 禁用几何体的morphTargets
          if (child.geometry && child.geometry.morphTargets) {
            console.warn('禁用几何体的morphTargets')
            child.geometry.morphTargets = []
            child.geometry.morphAttributes = {}
          }

          // 设置阴影
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.add(model)

      // 调整相机位置
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)

      // 放大模型显示
      camera.position.set(maxDim * 0.1, maxDim * 0.4, maxDim * -1.1) // 让模型更大
      camera.lookAt(center)

      // 更新OrbitControls目标
      if (controls) {
        controls.target.copy(center)
        controls.update()
      }

      // 更新模型信息
      modelInfo.value = {
        name: model.name || 'PMX 模型',
        vertices: model.geometry?.attributes?.position?.count || 0,
        faces: model.geometry?.index?.count / 3 || 0,
      }

      loading.value = false
    }
  } catch (error) {
    console.error('加载失败:', error)
    errorMessage.value = `加载失败: ${
      error.message.includes('magic')
        ? '文件格式错误（非PMX文件）'
        : error.message.includes('404')
          ? '文件不存在，请检查路径'
          : error.message
    }`
    loading.value = false
  }
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 禁用自动旋转，使用OrbitControls
  // if (isAnimating.value && model) {
  //   model.rotation.y += 0.005
  // }

  // 更新OrbitControls
  if (controls) {
    controls.update()
  }

  renderer.render(scene, camera)
}

// 重试加载
const retryLoad = () => {
  errorMessage.value = ''
  loadModel()
}

// 窗口大小调整
const handleResize = () => {
  if (camera && renderer && container.value) {
    camera.aspect = container.value.clientWidth / container.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  }
}

onMounted(() => {
  initScene()
  setupLighting()
  loadModel()
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  if (renderer && container.value) {
    container.value.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.pmx-viewer {
  width: 100%;
  height: 500px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.model-container {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.model-container:active {
  cursor: grabbing;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 1000; /* 确保在最上层 */
}

.control-btn {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7); /* 深色背景 */
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* 添加阴影 */
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.error-message {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(231, 76, 60, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  max-width: 80%;
  text-align: center;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.model-info {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  backdrop-filter: blur(10px);
  z-index: 5;
}

.model-info span {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .pmx-viewer {
    height: 300px;
  }

  .controls {
    bottom: 10px;
    gap: 6px;
  }

  .control-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .model-info {
    top: 10px;
    right: 10px;
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>
