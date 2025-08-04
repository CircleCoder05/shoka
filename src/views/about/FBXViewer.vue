<template>
  <div class="fbx-viewer-container">
    <!-- 3D模型显示区域 -->
    <div ref="container" class="fbx-viewer">
      <!-- 左右箭头指示器 -->
      <div class="rotation-arrows">
        <img
          src="@/assets/images/left.webp"
          alt="左转"
          class="arrow left-arrow"
          :class="{ rotating: isRotating }"
          @click="rotateModel('left')"
        />
        <img
          src="@/assets/images/right.webp"
          alt="右转"
          class="arrow right-arrow"
          :class="{ rotating: isRotating }"
          @click="rotateModel('right')"
        />
      </div>

      <div class="error" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js'

// Props 配置
const props = defineProps({
  // FBX文件路径
  modelPath: {
    type: String,
    default: '/3d/joseph02.fbx',
  },
  // 初始缩放比例
  initialScale: {
    type: Number,
    default: 10, // 放大10倍
  },
  // 相机初始位置
  cameraPosition: {
    type: Object,
    default: () => ({ x: 0, y: 5, z: 10 }),
  },
  // 背景颜色
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  // 环境光强度
  ambientLightIntensity: {
    type: Number,
    default: 3.0,
  },
  // 主光源强度
  directionalLightIntensity: {
    type: Number,
    default: 4.0,
  },
  // 是否启用缩放
  enableZoom: {
    type: Boolean,
    default: false,
  },
  // 是否启用平移
  enablePan: {
    type: Boolean,
    default: false,
  },
  // 是否限制只能水平旋转
  horizontalOnly: {
    type: Boolean,
    default: true,
  },
})

const container = ref(null)
const loading = ref(true)
const error = ref('')

// 旋转相关
const isRotating = ref(false)

// Three.js 相关变量
let scene, camera, renderer, controls, mixer, clock
let model = null

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = null

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.set(props.cameraPosition.x, props.cameraPosition.y, props.cameraPosition.z)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.toneMappingExposure = 1.0
  container.value.appendChild(renderer.domElement)

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1
  controls.maxDistance = 50
  controls.enableZoom = props.enableZoom
  controls.enablePan = props.enablePan
  controls.target.set(0, 0, 0)

  if (props.horizontalOnly) {
    controls.maxPolarAngle = Math.PI / 2
    controls.minPolarAngle = Math.PI / 2
  } else {
    controls.maxPolarAngle = Math.PI
  }

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 5.0) // 增强环境光
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 8.0) // 增强主光源
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // 添加更多点光源
  const pointLight1 = new THREE.PointLight(0xffffff, 6.0) // 白色强光
  pointLight1.position.set(-10, 10, -5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0xffffff, 6.0) // 白色强光
  pointLight2.position.set(10, 5, -10)
  scene.add(pointLight2)

  const pointLight3 = new THREE.PointLight(0xffffff, 4.0) // 正面补光
  pointLight3.position.set(0, 5, 10)
  scene.add(pointLight3)

  const pointLight4 = new THREE.PointLight(0xffffff, 4.0) // 顶部补光
  pointLight4.position.set(0, 20, 0)
  scene.add(pointLight4)

  // 创建时钟用于动画
  clock = new THREE.Clock()

  // 开始渲染循环
  animate()
}

// 加载FBX模型
const loadModel = async () => {
  try {
    loading.value = true
    error.value = ''

    // 清除旧模型
    if (model) {
      scene.remove(model)
      model = null
    }
    if (mixer) {
      mixer.stopAllAction()
      mixer = null
    }

    const loader = new FBXLoader()
    loader.setResourcePath('/3d/') // 设置资源路径

    const fbx = await new Promise((resolve, reject) => {
      loader.load(props.modelPath, resolve, undefined, reject)
    })

    console.log('FBX模型加载成功')

    // 处理模型
    model = fbx
    scene.add(model)

    // 处理材质和阴影
    let materialCount = 0
    let textureCount = 0

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        console.log('处理网格:', child.name)

        // 处理材质
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              materialCount++
              console.log('材质:', material.name, '贴图:', material.map ? '有' : '无')
              if (material.map) textureCount++
              processMaterial(material)
            })
          } else {
            materialCount++
            console.log('材质:', child.material.name, '贴图:', child.material.map ? '有' : '无')
            if (child.material.map) textureCount++
            processMaterial(child.material)
          }
        }
      }
    })

    console.log(`总共处理了 ${materialCount} 个材质，${textureCount} 个贴图`)

    // 调整模型大小和位置
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    console.log('模型尺寸:', size)
    console.log('模型中心:', center)

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = props.initialScale / maxDim
    model.scale.setScalar(scale)

    console.log('应用缩放:', scale)

    // 将模型居中
    model.position.sub(center.multiplyScalar(scale))

    console.log('模型最终位置:', model.position)

    // 设置动画
    if (fbx.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model)

      // 播放所有动画
      fbx.animations.forEach((clip) => {
        const action = mixer.clipAction(clip)
        action.setLoop(THREE.LoopRepeat)
        action.play()
      })
    }

    loading.value = false
  } catch (err) {
    console.error('加载FBX模型失败:', err)
    error.value = '加载FBX模型失败: ' + err.message
    loading.value = false
  }
}

// 处理材质
const processMaterial = (material) => {
  if (!material.color) {
    material.color = new THREE.Color(0xcccccc)
  }

  // 确保材质可见
  material.transparent = false
  material.opacity = 1.0
  material.side = THREE.DoubleSide // 双面渲染

  // 增加颜色饱和度和鲜艳度
  const color = material.color
  const hsl = {}
  color.getHSL(hsl)

  hsl.s = Math.min(1.0, hsl.s * 1.5) // 饱和度倍数
  hsl.l = Math.min(0.8, hsl.l * 1.2) // 亮度倍数
  color.setHSL(hsl.h, hsl.s, hsl.l)

  material.needsUpdate = true

  // 处理MeshPhongMaterial
  if (material.isMeshPhongMaterial) {
    material.shininess = 15
    material.specular = new THREE.Color(0x111111)
    material.transparent = false
    material.opacity = 1.0
  }

  // 处理Standard材质
  if (material.isMeshStandardMaterial) {
    material.roughness = 0.7
    material.metalness = 0.1
    material.transparent = false
    material.opacity = 1.0
  }

  // 处理贴图 - 尝试手动加载TGA贴图
  if (material.map && !material.map.image) {
    console.log('尝试手动加载TGA贴图:', material.map.name)

    // 根据贴图名称猜测TGA文件路径
    let texturePath = ''
    if (material.map.name.includes('47')) {
      texturePath = '/3d/joseph02.fbm/joseph_head_diff.tga'
    } else if (material.map.name.includes('48')) {
      texturePath = '/3d/joseph02.fbm/joseph_body_diff.tga'
    } else if (material.map.name.includes('49')) {
      texturePath = '/3d/joseph02.fbm/joseph_wuqi01_diff.tga'
    } else if (material.map.name.includes('50')) {
      texturePath = '/3d/joseph02.fbm/joseph_wuqi02_diff.tga'
    }

    if (texturePath) {
      const tgaLoader = new TGALoader()
      fetch(texturePath)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          console.log('TGA贴图加载成功:', texturePath)
          const textureData = tgaLoader.parse(buffer)
          const texture = new THREE.DataTexture(
            textureData.data,
            textureData.width,
            textureData.height,
            THREE.RGBAFormat,
          )
          texture.flipY = textureData.flipY
          texture.generateMipmaps = textureData.generateMipmaps
          texture.minFilter = textureData.minFilter
          texture.encoding = THREE.sRGBEncoding
          texture.needsUpdate = true

          material.map = texture
          material.needsUpdate = true
        })
        .catch((error) => {
          console.warn('TGA贴图加载失败:', texturePath, error)
        })
    }
  } else if (material.map && material.map.image) {
    // 贴图已有图片数据，正常处理
    try {
      material.map.encoding = THREE.sRGBEncoding
      material.map.flipY = false
      material.map.generateMipmaps = true
      material.map.minFilter = THREE.LinearMipmapLinearFilter
      material.map.magFilter = THREE.LinearFilter
      material.map.wrapS = THREE.ClampToEdgeWrapping
      material.map.wrapT = THREE.ClampToEdgeWrapping
      material.map.needsUpdate = true
      material.needsUpdate = true

      console.log(
        '贴图已处理:',
        material.map.name,
        '尺寸:',
        material.map.image.width + 'x' + material.map.image.height,
      )
    } catch (error) {
      console.warn('设置贴图属性时出错:', error)
    }
  }

  if (material.normalMap) {
    if (material.normalMap.encoding !== undefined) {
      material.normalMap.encoding = THREE.LinearEncoding
    }
    material.normalMap.needsUpdate = true
  }
}

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate)

  if (mixer) {
    const delta = clock.getDelta()
    mixer.update(delta)
  }

  // 处理模型旋转动画
  if (isRotating.value && model) {
    const currentTime = Date.now()
    const elapsed = currentTime - rotationStartTime
    const progress = Math.min(elapsed / rotationDuration, 1)

    const easeProgress = 1 - Math.pow(1 - progress, 3)

    const startRotation = model.rotation.y
    const rotationDiff = targetRotation - startRotation

    if (Math.abs(rotationDiff) > Math.PI) {
      if (rotationDiff > 0) {
        model.rotation.y = startRotation + (rotationDiff - 2 * Math.PI) * easeProgress
      } else {
        model.rotation.y = startRotation + (rotationDiff + 2 * Math.PI) * easeProgress
      }
    } else {
      model.rotation.y = startRotation + rotationDiff * easeProgress
    }

    if (progress >= 1) {
      isRotating.value = false
      model.rotation.y = targetRotation
    }
  }

  controls.update()
  renderer.render(scene, camera)
}

// 旋转动画相关变量
let targetRotation = 0
let rotationStartTime = 0
const rotationDuration = 400

// 旋转模型
const rotateModel = (direction) => {
  if (!model) return

  const rotationSpeed = Math.PI / 4
  const currentRotation = model.rotation.y

  if (direction === 'left') {
    targetRotation = currentRotation + rotationSpeed
  } else if (direction === 'right') {
    targetRotation = currentRotation - rotationSpeed
  }

  isRotating.value = true
  rotationStartTime = Date.now()
}

// 处理窗口大小变化
const handleResize = () => {
  if (camera && renderer && container.value) {
    camera.aspect = container.value.clientWidth / container.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  }
}

onMounted(async () => {
  await nextTick()
  initScene()
  await loadModel()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (renderer) {
    renderer.dispose()
  }

  if (mixer) {
    mixer.stopAllAction()
  }
})
</script>

<style scoped>
.fbx-viewer-container {
  width: 100%;
  height: 100%;
}

.fbx-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-image: url('./src/assets/images/role.webp');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.fbx-viewer canvas {
  transition: opacity 0.3s ease;
}

.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  color: #ff6b6b;
  padding: 20px;
  border-radius: 8px;
  font-size: 16px;
}

/* 旋转箭头样式 */
.rotation-arrows {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 50px;
  z-index: 15;
}

.arrow {
  width: 60px;
  height: 60px;
  opacity: 0.7;
  transition: all 0.3s ease;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.arrow:hover {
  opacity: 1;
  transform: scale(1.1);
}

.arrow.rotating {
  opacity: 0.8;
  animation: pulse 0.8s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.left-arrow {
  transform: rotate(0deg);
}

.right-arrow {
  transform: rotate(0deg);
}

@media (max-width: 768px) {
  .fbx-viewer-container {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .fbx-viewer-container {
    width: 100%;
  }
}
</style>
