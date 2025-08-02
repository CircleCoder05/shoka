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
  container.value.appendChild(renderer.domElement)

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1
  controls.maxDistance = 50
  controls.maxPolarAngle = Math.PI

  // 添加光源 - 增加亮度
  const ambientLight = new THREE.AmbientLight(0x404040, 2.5) // 大幅增加环境光强度
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0) // 大幅增加方向光强度
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  const pointLight = new THREE.PointLight(0xffffff, 2.5) // 大幅增加点光源强度
  pointLight.position.set(-10, 10, -5)
  scene.add(pointLight)

  // 添加额外的光源来增加整体亮度
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0) // 大幅增加半球光强度
  scene.add(hemisphereLight)

  // 添加更多光源来确保模型充分照亮
  const frontLight = new THREE.DirectionalLight(0xffffff, 2.0) // 增加前光源强度
  frontLight.position.set(0, 0, 10)
  scene.add(frontLight)

  const topLight = new THREE.DirectionalLight(0xffffff, 2.0) // 增加顶光源强度
  topLight.position.set(0, 10, 0)
  scene.add(topLight)

  // 添加更多光源确保全方位照亮
  const backLight = new THREE.DirectionalLight(0xffffff, 1.5)
  backLight.position.set(0, 0, -10)
  scene.add(backLight)

  const sideLight = new THREE.DirectionalLight(0xffffff, 1.5)
  sideLight.position.set(10, 0, 0)
  scene.add(sideLight)

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
    const modelPath = '/pmx/banshee.glb'

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

    // 计算合适的缩放比例
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 5 / maxDim
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

  // 设置材质属性
  material.needsUpdate = true

  // 处理MeshPhongMaterial
  if (material.isMeshPhongMaterial) {
    material.shininess = 30
    material.specular = new THREE.Color(0x111111)
    material.transparent = false
    material.opacity = 1.0
  }

  // 如果是标准材质，设置一些基本属性
  if (material.isMeshStandardMaterial) {
    material.roughness = 0.5
    material.metalness = 0.1
    material.transparent = false
    material.opacity = 1.0
  }

  // 处理现有贴图
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
