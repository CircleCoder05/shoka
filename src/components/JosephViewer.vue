<template>
  <div ref="container" class="model-viewer">
    <div class="loading" v-if="loading">加载中...</div>
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref(null)
const loading = ref(true)
const error = ref('')

// Three.js 相关变量
let scene, camera, renderer, controls, mixer, clock
let model = null

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff) // 浅黄色背景 (beige)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.set(0, 5, 10)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping // 使用电影级色调映射
  renderer.toneMappingExposure = 1.0 // 增加曝光度
  container.value.appendChild(renderer.domElement)

  // 创建控制器 - 限制只能左右旋转
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1
  controls.maxDistance = 50
  controls.maxPolarAngle = Math.PI / 2 // 限制垂直旋转角度
  controls.minPolarAngle = Math.PI / 2 // 限制垂直旋转角度，只能水平旋转
  controls.enableZoom = false // 禁用缩放
  controls.enablePan = false // 禁用平移

  // 添加光源 - 增加亮度和颜色饱和度
  const ambientLight = new THREE.AmbientLight(0xffffff, 3.0) // 使用白色环境光，增加强度
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0) // 增加主光源强度
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // 添加彩色光源来增加颜色饱和度
  const warmLight = new THREE.PointLight(0xffaa44, 3.0) // 暖色调光源
  warmLight.position.set(-10, 10, -5)
  scene.add(warmLight)

  const coolLight = new THREE.PointLight(0x4488ff, 2.0) // 冷色调光源
  coolLight.position.set(10, 5, -10)
  scene.add(coolLight)

  // 添加额外的光源来增加整体亮度
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x666666, 2.5) // 增加半球光强度
  scene.add(hemisphereLight)

  // 添加更多光源来确保模型充分照亮
  const frontLight = new THREE.DirectionalLight(0xffffff, 3.0) // 增加前光源强度
  frontLight.position.set(0, 0, 10)
  scene.add(frontLight)

  const topLight = new THREE.DirectionalLight(0xffffff, 3.0) // 增加顶光源强度
  topLight.position.set(0, 10, 0)
  scene.add(topLight)

  // 添加更多光源确保全方位照亮
  const backLight = new THREE.DirectionalLight(0xffffff, 2.0)
  backLight.position.set(0, 0, -10)
  scene.add(backLight)

  const sideLight = new THREE.DirectionalLight(0xffffff, 2.0)
  sideLight.position.set(10, 0, 0)
  scene.add(sideLight)

  // 添加彩色补光
  const pinkLight = new THREE.PointLight(0xff88aa, 1.5) // 粉色补光
  pinkLight.position.set(-5, 5, 5)
  scene.add(pinkLight)

  const greenLight = new THREE.PointLight(0x88ff88, 1.0) // 绿色补光
  greenLight.position.set(5, -5, 5)
  scene.add(greenLight)

  // 移除地面 - 不再添加地面平面

  // 创建时钟用于动画
  clock = new THREE.Clock()

  // 开始渲染循环
  animate()
}

// 加载模型
const loadModel = async () => {
  try {
    loading.value = true
    error.value = ''

    const loader = new GLTFLoader()
    const modelPath = '/3d/joseph.glb'

    const gltf = await new Promise((resolve, reject) => {
      loader.load(modelPath, resolve, undefined, reject)
    })

    // 处理模型
    model = gltf.scene
    scene.add(model)

    // 处理材质和贴图
    model.traverse((child) => {
      if (child.isMesh) {
        // 启用阴影
        child.castShadow = true
        child.receiveShadow = true

        // 输出材质信息用于调试
        console.log('网格名称:', child.name)
        console.log('材质名称:', child.material?.name)
        console.log('材质类型:', child.material?.type)

        // 处理材质
        if (child.material) {
          // 如果是数组材质
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              processMaterial(material)
            })
          } else {
            // 单个材质
            processMaterial(child.material)
          }
        }
      }
    })

    // 调整模型大小和位置
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // 计算合适的缩放比例 - 放大初始显示
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 8 / maxDim // 从5增加到8，放大60%
    model.scale.setScalar(scale)

    // 将模型居中
    model.position.sub(center.multiplyScalar(scale))

    // 设置动画
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model)
      const action = mixer.clipAction(gltf.animations[0])
      action.play()
    }

    loading.value = false
  } catch (err) {
    console.error('加载模型失败:', err)
    error.value = '加载模型失败: ' + err.message
    loading.value = false
  }
}

// 处理材质
const processMaterial = (material) => {
  console.log('处理材质:', material.name)
  console.log('材质类型:', material.type)
  console.log('材质颜色:', material.color)
  console.log('材质贴图:', material.map)

  // 确保材质有基本颜色
  if (!material.color) {
    material.color = new THREE.Color(0xcccccc)
  }

  // 增加颜色饱和度和鲜艳度
  const color = material.color
  const hsl = {}
  color.getHSL(hsl)

  // 增加饱和度 (0-1, 1为最饱和)
  hsl.s = Math.min(1.0, hsl.s * 1.5) // 增加50%饱和度

  // 调整亮度，让颜色更鲜艳
  hsl.l = Math.min(0.8, hsl.l * 1.2) // 增加20%亮度，但不超过0.8

  // 应用调整后的HSL值
  color.setHSL(hsl.h, hsl.s, hsl.l)

  // 如果是灰色或接近灰色的颜色，给它们一些颜色
  if (hsl.s < 0.1) {
    // 根据材质名称或其他属性给一些基础颜色
    const materialName = material.name.toLowerCase()
    if (materialName.includes('body') || materialName.includes('skin')) {
      color.setHSL(0.1, 0.3, 0.7) // 淡粉色皮肤
    } else if (materialName.includes('hair')) {
      color.setHSL(0.1, 0.6, 0.4) // 棕色头发
    } else if (materialName.includes('cloth') || materialName.includes('fabric')) {
      color.setHSL(0.6, 0.7, 0.6) // 蓝色布料
    } else {
      color.setHSL(0.5, 0.4, 0.6) // 默认蓝色
    }
  }

  // 设置材质属性
  material.needsUpdate = true

  // 处理MeshPhongMaterial - 减少光泽度
  if (material.isMeshPhongMaterial) {
    material.shininess = 15 // 减少光泽度，更自然
    material.specular = new THREE.Color(0x111111) // 减少高光强度
    material.transparent = false
    material.opacity = 1.0
  }

  // 如果是标准材质，设置更自然的属性
  if (material.isMeshStandardMaterial) {
    material.roughness = 0.7 // 增加粗糙度，减少光泽
    material.metalness = 0.1 // 减少金属感
    material.transparent = false
    material.opacity = 1.0
  }

  // 处理现有贴图 - 增加贴图饱和度
  if (material.map) {
    try {
      if ('encoding' in material.map) {
        material.map.encoding = THREE.sRGBEncoding
      }

      material.map.flipY = false
      material.map.generateMipmaps = true
      material.map.minFilter = THREE.LinearMipmapLinearFilter
      material.map.magFilter = THREE.LinearFilter
      material.map.wrapS = THREE.ClampToEdgeWrapping
      material.map.wrapT = THREE.ClampToEdgeWrapping

      material.map.needsUpdate = true
    } catch (error) {
      console.warn('设置贴图属性时出错:', error)
    }
  }

  // 处理法线贴图
  if (material.normalMap) {
    if (material.normalMap.encoding !== undefined) {
      material.normalMap.encoding = THREE.LinearEncoding
    }
    material.normalMap.needsUpdate = true
  }

  console.log('最终材质颜色:', material.color)
  console.log('最终材质贴图:', material.map)
  console.log('----------------------------------------')
}

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate)

  if (mixer) {
    mixer.update(clock.getDelta())
  }

  controls.update()
  renderer.render(scene, camera)
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
.model-viewer {
  width: 100%;
  height: 500px;
  position: relative;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
}

.loading,
.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-size: 16px;
}

.error {
  color: #ff6b6b;
}
</style>
