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

let scene, camera, renderer, model, controls, mixer, clock
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

  // 初始化时钟用于动画
  clock = new THREE.Clock()
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

          // 更温和地处理morphTargets，避免影响材质渲染
          if (child.geometry && child.geometry.morphTargets) {
            console.warn('检测到morphTargets，尝试温和处理')

            // 检查是否有实际的morph数据
            const hasRealMorphData = child.geometry.morphTargets.some(
              (target) => target && target.vertices && target.vertices.length > 0,
            )

            if (hasRealMorphData) {
              console.log('发现真实的morph数据，保持原样')
              // 保持morphTargets，但确保材质设置正确
              if (child.material && child.material.morphTargets !== false) {
                child.material.morphTargets = true
              }
            } else {
              console.log('morphTargets为空或无效，可以安全禁用')
              child.geometry.morphTargets = []
              child.geometry.morphAttributes = {}
            }
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

      // 尝试加载动画
      loadAnimation()
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

// 加载动画
const loadAnimation = async () => {
  try {
    console.log('尝试加载动画...')

    // 首先检查模型是否有内置动画
    if (model && model.animations && model.animations.length > 0) {
      console.log('发现模型内置动画:', model.animations.length, '个')

      // 创建动画混合器
      mixer = new THREE.AnimationMixer(model)

      // 播放所有内置动画
      model.animations.forEach((clip, index) => {
        console.log(`播放内置动画 ${index}:`, clip.name, '时长:', clip.duration)
        const action = mixer.clipAction(clip)
        action.setLoop(THREE.LoopRepeat, Infinity) // 循环播放
        action.play()
      })

      console.log('内置动画播放成功！')
      return
    }

    // 检查模型是否有骨骼
    if (model && model.skeleton) {
      console.log('发现模型骨骼，尝试创建简单动画')
      createBoneAnimation()
      return
    }

    // 检查是否有动画文件
    const animationResponse = await fetch('/pmx/changzhang-pmx/animation.vmd')
    if (animationResponse.ok) {
      console.log('找到动画文件，开始加载...')

      // 使用MMDLoader加载动画
      const loader = new MMDLoader()
      loader.setPath('/pmx/changzhang-pmx/')

      // 使用正确的API加载动画
      loader.loadAnimation(
        'animation.vmd',
        model,
        (animation) => {
          console.log('动画加载成功！')

          // 创建动画混合器
          mixer = new THREE.AnimationMixer(model)
          const action = mixer.clipAction(animation)
          action.play()
        },
        (progress) => {
          console.log('动画加载进度:', progress)
        },
        (error) => {
          console.error('动画加载失败:', error)
        },
      )
    } else {
      console.log('未找到动画文件，尝试创建简单动画')
      createSimpleAnimation()
    }
  } catch (error) {
    console.log('动画加载失败或文件不存在:', error.message)
    createSimpleAnimation()
  }
}

// 创建骨骼动画
const createBoneAnimation = () => {
  console.log('创建骨骼动画...')

  // 遍历模型查找骨骼
  const allBones = []
  model.traverse((child) => {
    if (child.isBone) {
      console.log('发现骨骼:', child.name)
      allBones.push(child)
    }
  })

  if (allBones.length > 0) {
    console.log('为', allBones.length, '个骨骼创建动画')

    // 创建呼吸动画（身体轻微上下移动）
    const breathingTracks = []

    // 找到身体主要骨骼
    const bodyBones = allBones.filter(
      (bone) =>
        bone.name.toLowerCase().includes('spine') ||
        bone.name.toLowerCase().includes('chest') ||
        bone.name.toLowerCase().includes('body') ||
        bone.name.toLowerCase().includes('waist'),
    )

    // 创建呼吸动画 - 身体轻微上下移动
    bodyBones.forEach((bone) => {
      const positionTrack = new THREE.VectorKeyframeTrack(
        `${bone.name}.position`,
        [0, 1, 2, 3, 4], // 4秒循环
        [
          bone.position.x,
          bone.position.y,
          bone.position.z,
          bone.position.x,
          bone.position.y + 0.02,
          bone.position.z, // 轻微上升
          bone.position.x,
          bone.position.y,
          bone.position.z,
          bone.position.x,
          bone.position.y - 0.02,
          bone.position.z, // 轻微下降
          bone.position.x,
          bone.position.y,
          bone.position.z,
        ],
      )
      breathingTracks.push(positionTrack)
    })

    // 找到右手骨骼
    const rightHandBones = allBones.filter(
      (bone) =>
        bone.name.toLowerCase().includes('r') &&
        (bone.name.toLowerCase().includes('arm') ||
          bone.name.toLowerCase().includes('hand') ||
          bone.name.toLowerCase().includes('clavicle')),
    )

    console.log(
      '找到右手骨骼:',
      rightHandBones.map((b) => b.name),
    )

    // 找到武器对象 - 由于整个模型是一个网格，我们需要检查材质名称
    let weaponObject = null
    model.traverse((child) => {
      if (child.isMesh) {
        console.log('检查网格材质:', child.material.name || '未命名材质')
        console.log('材质颜色:', child.material.color)
        console.log('材质纹理:', child.material.map ? child.material.map.name : '无纹理')
        console.log('材质类型:', child.material.type)

        // 检查材质名称是否包含武器相关词汇
        if (
          child.material.name &&
          (child.material.name.toLowerCase().includes('shark') ||
            child.material.name.toLowerCase().includes('weapon') ||
            child.material.name.toLowerCase().includes('sickle'))
        ) {
          console.log('发现武器材质:', child.material.name)
          child.userData.isWeapon = true
          weaponObject = child
        }

        // 检查材质颜色是否为武器颜色（红色、黑色等）
        if (child.material.color) {
          const color = child.material.color
          console.log('材质RGB值:', color.r, color.g, color.b)

          // 检查是否是红色或黑色（可能是武器）
          if (
            (color.r > 0.8 && color.g < 0.2 && color.b < 0.2) || // 红色
            (color.r < 0.3 && color.g < 0.3 && color.b < 0.3)
          ) {
            // 黑色
            console.log('发现可能的武器材质（颜色检测）:', color)
            child.userData.isWeapon = true
            weaponObject = child
          }
        }

        // 检查材质数组
        if (Array.isArray(child.material)) {
          console.log('发现材质数组，长度:', child.material.length)
          child.material.forEach((mat, index) => {
            console.log(`材质 ${index}:`, mat.name || '未命名', '颜色:', mat.color)

            // 检查每个材质的颜色
            if (mat.color) {
              const color = mat.color
              console.log(`材质 ${index} RGB值:`, color.r, color.g, color.b)

              // 检查是否是红色或黑色（可能是武器）
              if (
                (color.r > 0.8 && color.g < 0.2 && color.b < 0.2) || // 红色
                (color.r < 0.3 && color.g < 0.3 && color.b < 0.3)
              ) {
                // 黑色
                console.log(`发现可能的武器材质 ${index}（颜色检测）:`, color)
                child.userData.isWeapon = true
                weaponObject = child
              }
            }
          })
        }
      }
    })

    // 创建武器挥舞动画
    const weaponTracks = []
    rightHandBones.forEach((bone) => {
      // 创建挥舞动画 - 每6秒挥舞一次
      const rotationTrack = new THREE.QuaternionKeyframeTrack(
        `${bone.name}.quaternion`,
        [0, 1, 2, 3, 4, 5, 6], // 6秒循环
        [
          bone.quaternion.x,
          bone.quaternion.y,
          bone.quaternion.z,
          bone.quaternion.w,
          bone.quaternion.x,
          bone.quaternion.y,
          bone.quaternion.z,
          bone.quaternion.w,
          bone.quaternion.x + 0.2,
          bone.quaternion.y,
          bone.quaternion.z,
          bone.quaternion.w, // 开始挥舞
          bone.quaternion.x + 0.4,
          bone.quaternion.y,
          bone.quaternion.z,
          bone.quaternion.w, // 挥舞到最高点
          bone.quaternion.x + 0.2,
          bone.quaternion.y,
          bone.quaternion.z,
          bone.quaternion.w, // 回落
          bone.quaternion.x,
          bone.quaternion.y,
          bone.quaternion.z,
          bone.quaternion.w,
          bone.quaternion.x,
          bone.quaternion.y,
          bone.quaternion.z,
          bone.quaternion.w,
        ],
      )
      weaponTracks.push(rotationTrack)
    })

    // 合并所有动画轨道
    const allTracks = [...breathingTracks, ...weaponTracks]

    if (allTracks.length > 0) {
      const breathingClip = new THREE.AnimationClip('Breathing', 4, breathingTracks)
      const weaponClip = new THREE.AnimationClip('WeaponSwing', 6, weaponTracks)

      mixer = new THREE.AnimationMixer(model)

      // 播放呼吸动画
      const breathingAction = mixer.clipAction(breathingClip)
      breathingAction.setLoop(THREE.LoopRepeat, Infinity)
      breathingAction.play()

      // 播放武器挥舞动画
      const weaponAction = mixer.clipAction(weaponClip)
      weaponAction.setLoop(THREE.LoopRepeat, Infinity)
      weaponAction.play()

      console.log('呼吸动画和武器挥舞动画创建成功！')
    }
  }
}

// 创建简单的循环动画
const createSimpleAnimation = () => {
  console.log('创建简单的循环动画...')

  // 创建简单的旋转动画
  const rotationTrack = new THREE.NumberKeyframeTrack(
    '.rotation[y]',
    [0, 2, 4],
    [0, Math.PI, Math.PI * 2],
  )

  const clip = new THREE.AnimationClip('SimpleRotation', 4, [rotationTrack])

  mixer = new THREE.AnimationMixer(model)
  const action = mixer.clipAction(clip)
  action.setLoop(THREE.LoopRepeat, Infinity)
  action.play()

  console.log('简单动画创建成功！')
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 更新动画混合器
  if (mixer && clock) {
    mixer.update(clock.getDelta())
  }

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
