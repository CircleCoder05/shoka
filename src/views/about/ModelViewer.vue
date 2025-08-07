<template>
  <div class="model-viewer-container">
    <!-- 3D模型显示区域 -->
    <div ref="container" class="model-viewer">
      <!-- 模型切换按钮 -->
      <div class="model-controls" v-if="availableModels.length > 1">
        <button @click="switchToNextModel" class="model-btn">切换模型</button>
      </div>

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
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useModelsStore } from '@/stores/models'
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js'

// Props 配置
const props = defineProps({
  // 可选：指定初始模型key，如果不指定则使用第一个可用模型
  initialModelKey: {
    type: String,
    default: null,
  },
  // 初始缩放比例
  initialScale: {
    type: Number,
    default: 8,
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
  // 颜色饱和度倍数
  saturationMultiplier: {
    type: Number,
    default: 1.5,
  },
  // 亮度倍数
  brightnessMultiplier: {
    type: Number,
    default: 1.2,
  },
  // 光泽度 (Phong材质)
  shininess: {
    type: Number,
    default: 15,
  },
  // 粗糙度 (Standard材质)
  roughness: {
    type: Number,
    default: 0.7,
  },
  // 金属感 (Standard材质)
  metalness: {
    type: Number,
    default: 0.1,
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
  // 自定义材质颜色映射
  materialColors: {
    type: Object,
    default: () => ({
      body: { h: 0.1, s: 0.3, l: 0.7 }, // 淡粉色皮肤
      hair: { h: 0.1, s: 0.6, l: 0.4 }, // 棕色头发
      cloth: { h: 0.6, s: 0.7, l: 0.6 }, // 蓝色布料
      default: { h: 0.5, s: 0.4, l: 0.6 }, // 默认蓝色
    }),
  },
  // 自定义光源配置
  lights: {
    type: Array,
    default: () => [
      { type: 'point', color: 0xffaa44, intensity: 3.0, position: { x: -10, y: 10, z: -5 } },
      { type: 'point', color: 0x4488ff, intensity: 2.0, position: { x: 10, y: 5, z: -10 } },
      { type: 'point', color: 0xff88aa, intensity: 1.5, position: { x: -5, y: 5, z: 5 } },
      { type: 'point', color: 0x88ff88, intensity: 1.0, position: { x: 5, y: -5, z: 5 } },
    ],
  },
})

const container = ref(null)
const loading = ref(true)
const error = ref('')

// 模型切换相关
const modelsStore = useModelsStore()
const currentModelKey = ref('')
const availableModels = computed(() => modelsStore.getAllModels())

// 动画相关
const isTransitioning = ref(false)
const transitionDirection = ref('right') // 'left' 或 'right'
const isRotating = ref(false) // 添加旋转状态

// Three.js 相关变量
let scene, camera, renderer, controls, mixer, clock
let model = null

// 初始化场景
const initScene = () => {
  // 获取当前模型配置
  const modelConfig = modelsStore.getModelConfig(currentModelKey.value)
  if (!modelConfig) return

  // 创建场景
  scene = new THREE.Scene()

  // 设置场景为透明
  scene.background = null

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.set(
    modelConfig.cameraPosition.x,
    modelConfig.cameraPosition.y,
    modelConfig.cameraPosition.z,
  )

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true, // 启用透明
  })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping // 不使用色调映射，保持原始颜色
  renderer.toneMappingExposure = 1.0
  container.value.appendChild(renderer.domElement)

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1
  controls.maxDistance = 50
  controls.enableZoom = modelConfig.enableZoom
  controls.enablePan = modelConfig.enablePan

  // 设置控制器目标为原点，这样模型会绕自己的中心旋转
  controls.target.set(0, 0, 0)

  if (modelConfig.horizontalOnly) {
    controls.maxPolarAngle = Math.PI / 2
    controls.minPolarAngle = Math.PI / 2
  } else {
    controls.maxPolarAngle = Math.PI
  }

  // 添加基础光源
  const ambientLight = new THREE.AmbientLight(0xffffff, modelConfig.ambientLightIntensity)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    modelConfig.directionalLightIntensity,
  )
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // 为FBX模型添加更强的光照
  if (modelConfig.format === 'fbx') {
    // 添加更多点光源，增强FBX模型的可见性
    const pointLight1 = new THREE.PointLight(0xffffff, 6.0)
    pointLight1.position.set(-10, 10, -5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xffffff, 6.0)
    pointLight2.position.set(10, 5, -10)
    scene.add(pointLight2)

    const pointLight3 = new THREE.PointLight(0xffffff, 4.0)
    pointLight3.position.set(0, 5, 10)
    scene.add(pointLight3)

    const pointLight4 = new THREE.PointLight(0xffffff, 4.0)
    pointLight4.position.set(0, 20, 0)
    scene.add(pointLight4)
  } else {
    // 添加自定义光源（GLB模型）
    modelConfig.lights.forEach((lightConfig) => {
      if (lightConfig.type === 'point') {
        const light = new THREE.PointLight(lightConfig.color, lightConfig.intensity)
        light.position.set(lightConfig.position.x, lightConfig.position.y, lightConfig.position.z)
        scene.add(light)
      } else if (lightConfig.type === 'directional') {
        const light = new THREE.DirectionalLight(lightConfig.color, lightConfig.intensity)
        light.position.set(lightConfig.position.x, lightConfig.position.y, lightConfig.position.z)
        scene.add(light)
      }
    })
  }

  // 添加半球光
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x666666, 2.5)
  scene.add(hemisphereLight)

  // 不再需要创建3D箭头

  // 创建时钟用于动画
  clock = new THREE.Clock()

  // 开始渲染循环
  animate()
}

// 加载GLB模型
const loadGLBModel = async (modelPath, modelConfig) => {
  const loader = new GLTFLoader()
  const gltf = await new Promise((resolve, reject) => {
    loader.load(modelPath, resolve, undefined, reject)
  })

  // 处理模型
  model = gltf.scene
  scene.add(model)

  // 处理材质和贴图
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true

      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            processMaterial(material)
          })
        } else {
          processMaterial(child.material)
        }
      }
    }
  })

  // 调整模型大小和位置
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = modelConfig.initialScale / maxDim
  model.scale.setScalar(scale)

  // 将模型居中
  model.position.sub(center.multiplyScalar(scale))

  // 应用模型旋转
  if (modelConfig.modelRotation) {
    model.rotation.set(
      (modelConfig.modelRotation.x * Math.PI) / 180,
      (modelConfig.modelRotation.y * Math.PI) / 180,
      (modelConfig.modelRotation.z * Math.PI) / 180,
    )
  }

  // 设置动画
  if (gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(gltf.animations[0])
    action.play()
  }
}

// 加载FBX模型
const loadFBXModel = async (modelPath, modelConfig) => {
  const loader = new FBXLoader()
  loader.setResourcePath('/3d/')

  const fbx = await new Promise((resolve, reject) => {
    loader.load(modelPath, resolve, undefined, reject)
  })

  // 处理模型
  model = fbx
  scene.add(model)

  // 处理材质和贴图
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true

      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            processFBXMaterial(material, modelConfig)
          })
        } else {
          processFBXMaterial(child.material, modelConfig)
        }
      }
    }
  })

  // 调整模型大小和位置
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = modelConfig.initialScale / maxDim
  model.scale.setScalar(scale)

  // 将模型居中
  model.position.sub(center.multiplyScalar(scale))

  // 应用模型旋转
  if (modelConfig.modelRotation) {
    model.rotation.set(
      (modelConfig.modelRotation.x * Math.PI) / 180,
      (modelConfig.modelRotation.y * Math.PI) / 180,
      (modelConfig.modelRotation.z * Math.PI) / 180,
    )
  }

  // 设置动画
  if (fbx.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model)
    fbx.animations.forEach((clip) => {
      const action = mixer.clipAction(clip)
      action.play()
    })
  }
}

// 处理FBX材质
const processFBXMaterial = (material, modelConfig) => {
  // 确保材质可见
  material.transparent = false
  material.opacity = 1.0
  material.side = THREE.FrontSide // 改为单面渲染，避免双面渲染导致的问题
  material.alphaTest = 0.1 // 添加alpha测试

  // 增加颜色饱和度和鲜艳度
  const color = material.color
  const hsl = {}
  color.getHSL(hsl)

  hsl.s = Math.min(1.0, hsl.s * (modelConfig.saturationMultiplier || 1.5))
  hsl.l = Math.min(0.8, hsl.l * (modelConfig.brightnessMultiplier || 1.2))
  color.setHSL(hsl.h, hsl.s, hsl.l)

  // 如果是灰色或接近灰色的颜色，给它们一些颜色（和GLB处理一致）
  if (hsl.s < 0.1) {
    const materialName = material.name.toLowerCase()
    let colorConfig = modelConfig.materialColors.default

    if (materialName.includes('body') || materialName.includes('skin')) {
      colorConfig = modelConfig.materialColors.body
    } else if (materialName.includes('hair')) {
      colorConfig = modelConfig.materialColors.hair
    } else if (materialName.includes('cloth') || materialName.includes('fabric')) {
      colorConfig = modelConfig.materialColors.cloth
    }

    color.setHSL(colorConfig.h, colorConfig.s, colorConfig.l)
  }

  material.needsUpdate = true

  // 处理MeshPhongMaterial
  if (material.isMeshPhongMaterial) {
    material.shininess = modelConfig.shininess || 15
    material.specular = new THREE.Color(0x111111)
    material.transparent = false
    material.opacity = 1.0
  }

  // 处理Standard材质
  if (material.isMeshStandardMaterial) {
    material.roughness = modelConfig.roughness || 0.7
    material.metalness = modelConfig.metalness || 0.1
    material.transparent = false
    material.opacity = 1.0
  }

  // 处理贴图 - 尝试手动加载TGA贴图
  if (material.map && !material.map.image) {
    console.log('尝试手动加载TGA贴图:', material.map.name)
    console.log('材质信息:', {
      name: material.name,
      type: material.type,
      transparent: material.transparent,
      opacity: material.opacity,
      side: material.side,
    })

    // 根据贴图名称猜测TGA文件路径
    let texturePath = ''
    const baseTexturePath = modelConfig.texturePath || '/3d/joseph02.fbm'

    // joseph02模型的贴图映射
    if (baseTexturePath.includes('joseph02')) {
      if (material.map.name.includes('47')) {
        texturePath = `${baseTexturePath}/joseph_head_diff.tga`
      } else if (material.map.name.includes('48')) {
        texturePath = `${baseTexturePath}/joseph_body_diff.tga`
      } else if (material.map.name.includes('49')) {
        texturePath = `${baseTexturePath}/joseph_wuqi01_diff.tga`
      } else if (material.map.name.includes('50')) {
        texturePath = `${baseTexturePath}/joseph_wuqi02_diff.tga`
      }
    }
    // antique01模型的贴图映射
    else if (baseTexturePath.includes('antique01')) {
      if (material.map.name.includes('6')) {
        texturePath = `${baseTexturePath}/h55_survivor_w_gd_body_diff.tga`
      } else if (material.map.name.includes('5')) {
        texturePath = `${baseTexturePath}/h55_survivor_w_gd_head_diff.tga`
      } else if (material.map.name.includes('7')) {
        texturePath = `${baseTexturePath}/h55_survivor_w_gd_weapon_diff.tga`
      }
    }

    if (texturePath) {
      const tgaLoader = new TGALoader()
      fetch(texturePath)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          console.log('TGA贴图加载成功:', texturePath)
          const textureData = tgaLoader.parse(buffer)
          console.log('贴图数据:', {
            width: textureData.width,
            height: textureData.height,
            format: textureData.format,
            type: textureData.type,
          })

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
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.needsUpdate = true

          material.map = texture
          material.needsUpdate = true

          console.log('材质贴图已设置:', material.map.name)
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
}

// 加载模型
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

    // 获取当前模型的配置
    const modelConfig = modelsStore.getModelConfig(currentModelKey.value)
    if (!modelConfig) {
      throw new Error('模型配置未找到')
    }

    const modelPath = modelConfig.modelPath
    const modelFormat = modelConfig.format || 'glb' // 默认GLB格式

    console.log('ModelViewer: 加载模型', {
      modelKey: currentModelKey.value,
      modelPath,
      modelFormat,
      modelConfig,
    })

    // 根据格式选择加载器
    if (modelFormat === 'fbx') {
      console.log('ModelViewer: 使用FBX加载器')
      await loadFBXModel(modelPath, modelConfig)
    } else {
      console.log('ModelViewer: 使用GLB加载器')
      await loadGLBModel(modelPath, modelConfig)
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
  if (!material.color) {
    material.color = new THREE.Color(0xcccccc)
  }

  // 获取当前模型配置
  const modelConfig = modelsStore.getModelConfig(currentModelKey.value)
  if (!modelConfig) return

  // 增加颜色饱和度和鲜艳度
  const color = material.color
  const hsl = {}
  color.getHSL(hsl)

  hsl.s = Math.min(1.0, hsl.s * modelConfig.saturationMultiplier)
  hsl.l = Math.min(0.8, hsl.l * modelConfig.brightnessMultiplier)
  color.setHSL(hsl.h, hsl.s, hsl.l)

  // 如果是灰色或接近灰色的颜色，给它们一些颜色
  if (hsl.s < 0.1) {
    const materialName = material.name.toLowerCase()
    let colorConfig = modelConfig.materialColors.default

    if (materialName.includes('body') || materialName.includes('skin')) {
      colorConfig = modelConfig.materialColors.body
    } else if (materialName.includes('hair')) {
      colorConfig = modelConfig.materialColors.hair
    } else if (materialName.includes('cloth') || materialName.includes('fabric')) {
      colorConfig = modelConfig.materialColors.cloth
    }

    color.setHSL(colorConfig.h, colorConfig.s, colorConfig.l)
  }

  material.needsUpdate = true

  // 处理MeshPhongMaterial
  if (material.isMeshPhongMaterial) {
    material.shininess = modelConfig.shininess
    material.specular = new THREE.Color(0x111111)
    material.transparent = false
    material.opacity = 1.0
  }

  // 处理Standard材质
  if (material.isMeshStandardMaterial) {
    material.roughness = modelConfig.roughness
    material.metalness = modelConfig.metalness
    material.transparent = false
    material.opacity = 1.0
  }

  // 处理贴图
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
    mixer.update(clock.getDelta())
  }

  // 处理模型旋转动画
  if (isRotating.value && model) {
    const currentTime = Date.now()
    const elapsed = currentTime - rotationStartTime
    const progress = Math.min(elapsed / rotationDuration, 1)

    // 使用缓动函数让动画更自然
    const easeProgress = 1 - Math.pow(1 - progress, 3) // 缓出效果

    const startRotation = model.rotation.y
    const rotationDiff = targetRotation - startRotation

    // 处理角度跨越问题（比如从359度到1度）
    if (Math.abs(rotationDiff) > Math.PI) {
      if (rotationDiff > 0) {
        model.rotation.y = startRotation + (rotationDiff - 2 * Math.PI) * easeProgress
      } else {
        model.rotation.y = startRotation + (rotationDiff + 2 * Math.PI) * easeProgress
      }
    } else {
      model.rotation.y = startRotation + rotationDiff * easeProgress
    }

    // 动画完成
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
const rotationDuration = 400 // 旋转动画持续时间（毫秒）

// 旋转模型
const rotateModel = (direction) => {
  if (!model) return

  const rotationSpeed = Math.PI / 4 // 45度
  const currentRotation = model.rotation.y

  if (direction === 'left') {
    targetRotation = currentRotation + rotationSpeed
  } else if (direction === 'right') {
    targetRotation = currentRotation - rotationSpeed
  }

  // 开始旋转动画
  isRotating.value = true
  rotationStartTime = Date.now()
}

// 切换到下一个模型
const switchToNextModel = async () => {
  const models = availableModels.value
  if (models.length <= 1) return

  if (isTransitioning.value) return // 防止动画期间重复点击

  isTransitioning.value = true
  transitionDirection.value = 'right'

  // 淡出动画
  const fadeOut = () => {
    return new Promise((resolve) => {
      const canvas = renderer.domElement
      let opacity = 1
      const animate = () => {
        opacity -= 0.05
        canvas.style.opacity = opacity
        if (opacity > 0) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      animate()
    })
  }

  // 淡入动画
  const fadeIn = () => {
    return new Promise((resolve) => {
      const canvas = renderer.domElement
      let opacity = 0
      const animate = () => {
        opacity += 0.05
        canvas.style.opacity = opacity
        if (opacity < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      animate()
    })
  }

  // 执行切换动画
  await fadeOut()

  const currentIndex = models.findIndex((m) => m.key === currentModelKey.value)
  const nextIndex = (currentIndex + 1) % models.length
  const nextModelKey = models[nextIndex].key

  currentModelKey.value = nextModelKey
  await loadModel()

  // 重置相机位置到JSON配置的位置
  const modelConfig = modelsStore.getModelConfig(currentModelKey.value)
  if (modelConfig && camera) {
    camera.position.set(
      modelConfig.cameraPosition.x,
      modelConfig.cameraPosition.y,
      modelConfig.cameraPosition.z,
    )
    camera.updateMatrixWorld()
  }

  await fadeIn()
  isTransitioning.value = false
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

  // 加载模型配置
  await modelsStore.loadModelsConfig()

  // 设置初始模型
  if (props.initialModelKey && availableModels.value.find((m) => m.key === props.initialModelKey)) {
    currentModelKey.value = props.initialModelKey
  } else if (availableModels.value.length > 0) {
    currentModelKey.value = availableModels.value[0].key
  }

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
.model-viewer-container {
  width: 100%;
  height: 100%;
}

.model-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
}

.model-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.model-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.model-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-image: url('@/assets/images/role.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.model-viewer canvas {
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

.error {
  color: #ff6b6b;
}

/* 旋转箭头样式 */
.rotation-arrows {
  position: absolute;
  bottom: 80px; /* 从20px改为80px，更靠上 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 50px; /* 从40px改为50px，增加间距 */
  z-index: 15;
}

.arrow {
  width: 60px; /* 从40px改为60px，放大50% */
  height: 60px; /* 从40px改为60px，放大50% */
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
  opacity: 0.8; /* 从0.5改为0.8，保持可见性 */
  animation: pulse 0.8s ease-in-out infinite;
  /* 移除 pointer-events: none，允许连续点击 */
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
  .model-viewer-container {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .model-viewer-container {
    width: 100%;
  }
}
</style>
