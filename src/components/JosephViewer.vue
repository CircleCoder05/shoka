<template>
  <div ref="container" class="model-viewer">
    <div class="loading" v-if="loading">加载中...</div>
    <div class="error" v-if="error">{{ error }}</div>
    <div class="controls" v-if="!loading && !error">
      <button @click="resetCamera">重置视角</button>
      <button @click="toggleWireframe">线框模式</button>
      <button @click="toggleAnimation">播放/暂停动画</button>
      <button @click="debugMaterials">调试材质</button>
      <button @click="switchModel">切换模型</button>
      <button @click="loadTextures">手动加载贴图</button>
      <button @click="refreshMaterials">刷新材质</button>
      <button @click="checkTextureData">检查贴图数据</button>
      <button @click="checkAllTextures">检查文件存在</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TGALoader } from '../utils/mmd-loader/TGALoader.js'

const container = ref(null)
const loading = ref(true)
const error = ref('')

// Three.js 相关变量
let scene, camera, renderer, controls, mixer, clock
let model = null
let wireframeMode = false
let animationPlaying = true

// 贴图加载器
const textureLoader = new THREE.TextureLoader()
const tgaLoader = new TGALoader()

// 预定义的贴图映射（根据你的文件结构调整）
const textureMap = {
  h55_butcher_banshee_body_diff: '/pmx/banshee/h55_butcher_banshee_body_diff.tga',
  h55_butcher_banshee_body_nor: '/pmx/banshee/h55_butcher_banshee_body_nor.tga',
  h55_butcher_banshee_body_mask: '/pmx/banshee/h55_butcher_banshee_body_mask.tga',
  h55_butcher_banshee_head_diff: '/pmx/banshee/h55_butcher_banshee_head_diff.tga',
  h55_butcher_banshee_head_nor: '/pmx/banshee/h55_butcher_banshee_head_nor.tga',
  h55_butcher_banshee_head_mask: '/pmx/banshee/h55_butcher_banshee_head_mask.tga',
  h55_butcher_banshee_hair_diff: '/pmx/banshee/h55_butcher_banshee_hair_diff.tga',
  h55_butcher_banshee_hair_nor: '/pmx/banshee/h55_butcher_banshee_hair_nor.tga',
  h55_butcher_banshee_hair_mask: '/pmx/banshee/h55_butcher_banshee_hair_mask.tga',
}

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a1a)

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

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  const pointLight = new THREE.PointLight(0xffffff, 0.5)
  pointLight.position.set(-10, 10, -5)
  scene.add(pointLight)

  // 添加地面
  const groundGeometry = new THREE.PlaneGeometry(20, 20)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 创建时钟用于动画
  clock = new THREE.Clock()

  // 开始渲染循环
  animate()
}

// 加载模型
const loadModel = async (modelPath = '/pmx/banshee/banshee.fbx') => {
  try {
    loading.value = true
    error.value = ''

    // 清理旧模型
    if (model) {
      scene.remove(model)
      if (mixer) {
        mixer.stopAllAction()
        mixer = null
      }
    }

    const loader = new FBXLoader()

    const fbx = await new Promise((resolve, reject) => {
      loader.load(modelPath, resolve, undefined, reject)
    })

    // 处理模型
    model = fbx
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
    if (fbx.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model)
      const action = mixer.clipAction(fbx.animations[0])
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
  console.log('材质所有属性:', Object.keys(material))

  // 确保材质有基本颜色
  if (!material.color) {
    material.color = new THREE.Color(0xcccccc)
  }

  // 设置材质属性
  material.needsUpdate = true

  // 处理MeshPhongMaterial
  if (material.isMeshPhongMaterial) {
    // 设置基本属性
    material.shininess = 30
    material.specular = new THREE.Color(0x111111)

    // 确保材质能正确显示贴图
    material.transparent = false
    material.opacity = 1.0

    // 如果没有贴图，给一个默认颜色
    if (!material.map) {
      // 根据材质名称给不同的颜色
      if (material.name.includes('head')) {
        material.color = new THREE.Color(0xffdbac) // 肤色
      } else if (material.name.includes('body')) {
        material.color = new THREE.Color(0x8b4513) // 棕色
      } else {
        material.color = new THREE.Color(0xcccccc) // 默认灰色
      }
    }
  }

  // 如果是标准材质，设置一些基本属性
  if (material.isMeshStandardMaterial) {
    material.roughness = 0.5
    material.metalness = 0.1
    material.transparent = false
    material.opacity = 1.0
  }

  // 尝试智能匹配贴图
  if (material.name) {
    const materialName = material.name.toLowerCase()
    console.log('尝试匹配材质名称:', materialName)

    // 尝试匹配漫反射贴图
    for (const [key, path] of Object.entries(textureMap)) {
      if (key.includes('diff') && materialName.includes(key.replace('_diff', ''))) {
        try {
          const texture = textureLoader.load(path)
          texture.encoding = THREE.sRGBEncoding
          material.map = texture
          console.log(`成功加载贴图: ${path}`)
          break
        } catch (err) {
          console.warn(`无法加载贴图: ${path}`, err)
        }
      }
    }

    // 尝试匹配法线贴图
    for (const [key, path] of Object.entries(textureMap)) {
      if (key.includes('nor') && materialName.includes(key.replace('_nor', ''))) {
        try {
          const normalTexture = textureLoader.load(path)
          normalTexture.encoding = THREE.LinearEncoding
          material.normalMap = normalTexture
          console.log(`成功加载法线贴图: ${path}`)
          break
        } catch (err) {
          console.warn(`无法加载法线贴图: ${path}`, err)
        }
      }
    }
  }

  // 处理现有贴图
  if (material.map) {
    console.log('贴图详细信息:', {
      name: material.map.name,
      uuid: material.map.uuid,
      image: material.map.image,
      format: material.map.format,
      type: material.map.type,
      encoding: material.map.encoding,
      hasEncoding: 'encoding' in material.map,
    })

    // 尝试设置贴图属性
    try {
      // 对于某些版本的Three.js，encoding可能不可用
      if ('encoding' in material.map) {
        material.map.encoding = THREE.sRGBEncoding
      }

      // 设置其他重要属性
      material.map.flipY = false
      material.map.generateMipmaps = true
      material.map.minFilter = THREE.LinearMipmapLinearFilter
      material.map.magFilter = THREE.LinearFilter
      material.map.wrapS = THREE.ClampToEdgeWrapping
      material.map.wrapT = THREE.ClampToEdgeWrapping

      material.map.needsUpdate = true
      console.log('贴图设置完成')
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

  // 处理其他贴图
  if (material.roughnessMap) {
    if (material.roughnessMap.encoding !== undefined) {
      material.roughnessMap.encoding = THREE.LinearEncoding
    }
    material.roughnessMap.needsUpdate = true
  }

  if (material.metalnessMap) {
    if (material.metalnessMap.encoding !== undefined) {
      material.metalnessMap.encoding = THREE.LinearEncoding
    }
    material.metalnessMap.needsUpdate = true
  }

  // 如果没有贴图，给材质一个默认颜色
  if (!material.map && !material.color) {
    material.color = new THREE.Color(0x888888)
  }

  console.log('最终材质颜色:', material.color)
  console.log('最终材质贴图:', material.map)
  console.log('----------------------------------------')
}

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate)

  if (mixer && animationPlaying) {
    mixer.update(clock.getDelta())
  }

  controls.update()
  renderer.render(scene, camera)
}

// 重置相机
const resetCamera = () => {
  if (model) {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 2

    camera.position.set(distance, distance, distance)
    camera.lookAt(center)
    controls.target.copy(center)
    controls.update()
  }
}

// 切换线框模式
const toggleWireframe = () => {
  wireframeMode = !wireframeMode
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.wireframe = wireframeMode
      }
    })
  }
}

// 切换动画播放
const toggleAnimation = () => {
  animationPlaying = !animationPlaying
}

// 调试材质
const debugMaterials = () => {
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        console.log('材质名称:', child.material.name)
        console.log('材质类型:', child.material.type)
        console.log('材质颜色:', child.material.color)
        if (child.material.map) {
          console.log('漫反射贴图:', child.material.map.image.src)
        }
        if (child.material.normalMap) {
          console.log('法线贴图:', child.material.normalMap.image.src)
        }
        if (child.material.roughnessMap) {
          console.log('粗糙度贴图:', child.material.roughnessMap.image.src)
        }
        if (child.material.metalnessMap) {
          console.log('金属度贴图:', child.material.metalnessMap.image.src)
        }
        console.log('----------------------------------------')
      }
    })
  }
}

// 切换模型
const switchModel = () => {
  const newModelPath = '/pmx/banshee/banshee.fbx' // 替换为你想要加载的模型路径
  loadModel(newModelPath)
}

// 手动加载贴图
const loadTextures = () => {
  if (!model) return

  console.log('开始手动加载贴图...')

  // 只尝试加载已知存在的TGA文件
  const texturePaths = [
    '/pmx/banshee/h55_butcher_banshee_body_diff.tga',
    '/pmx/banshee/h55_butcher_banshee_head_diff.tga',
    '/pmx/banshee/h55_butcher_banshee_hair_diff.tga',
    '/pmx/banshee/h55_butcher_banshee_body_nor.tga',
    '/pmx/banshee/h55_butcher_banshee_head_nor.tga',
    '/pmx/banshee/h55_butcher_banshee_hair_nor.tga',
    '/pmx/banshee/h55_butcher_banshee_body_mask.tga',
    '/pmx/banshee/h55_butcher_banshee_head_mask.tga',
    '/pmx/banshee/h55_butcher_banshee_hair_mask.tga',
  ]

  let loadedTextures = 0
  const totalTextures = texturePaths.length

  texturePaths.forEach((path) => {
    if (path.endsWith('.tga')) {
      // 使用TGALoader加载TGA文件
      fetch(path)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          const tgaData = tgaLoader.parse(buffer)
          console.log(`成功加载TGA贴图: ${path}`)
          loadedTextures++

          // 创建Three.js纹理对象
          const texture = new THREE.DataTexture(
            tgaData.data,
            tgaData.width,
            tgaData.height,
            THREE.RGBAFormat,
            THREE.UnsignedByteType,
          )

          // 设置贴图属性
          texture.encoding = THREE.sRGBEncoding
          texture.flipY = false
          texture.generateMipmaps = true
          texture.minFilter = THREE.LinearMipmapLinearFilter
          texture.magFilter = THREE.LinearFilter
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.needsUpdate = true

          // 应用到匹配的材质
          model.traverse((child) => {
            if (child.isMesh && child.material) {
              console.log(`检查网格: ${child.name} vs 贴图: ${path}`)

              if (Array.isArray(child.material)) {
                child.material.forEach((material, index) => {
                  // 根据网格名称和贴图类型智能匹配
                  const meshName = child.name.toLowerCase()
                  const textureName = path.toLowerCase()

                  // 检查网格名称是否与贴图名称匹配
                  if (meshName.includes('head') && textureName.includes('head')) {
                    if (textureName.includes('_diff')) {
                      material.map = texture
                      console.log(`应用头部漫反射贴图到网格: ${child.name}, 材质: ${material.name}`)
                    } else if (textureName.includes('_nor')) {
                      material.normalMap = texture
                      console.log(`应用头部法线贴图到网格: ${child.name}, 材质: ${material.name}`)
                    } else if (textureName.includes('_mask')) {
                      material.alphaMap = texture
                      console.log(`应用头部遮罩贴图到网格: ${child.name}, 材质: ${material.name}`)
                    }
                    material.needsUpdate = true
                  } else if (meshName.includes('body') && textureName.includes('body')) {
                    if (textureName.includes('_diff')) {
                      material.map = texture
                      console.log(`应用身体漫反射贴图到网格: ${child.name}, 材质: ${material.name}`)
                    } else if (textureName.includes('_nor')) {
                      material.normalMap = texture
                      console.log(`应用身体法线贴图到网格: ${child.name}, 材质: ${material.name}`)
                    } else if (textureName.includes('_mask')) {
                      material.alphaMap = texture
                      console.log(`应用身体遮罩贴图到网格: ${child.name}, 材质: ${material.name}`)
                    }
                    material.needsUpdate = true
                  } else if (meshName.includes('hair') && textureName.includes('hair')) {
                    if (textureName.includes('_diff')) {
                      material.map = texture
                      console.log(`应用头发漫反射贴图到网格: ${child.name}, 材质: ${material.name}`)
                    } else if (textureName.includes('_nor')) {
                      material.normalMap = texture
                      console.log(`应用头发法线贴图到网格: ${child.name}, 材质: ${material.name}`)
                    } else if (textureName.includes('_mask')) {
                      material.alphaMap = texture
                      console.log(`应用头发遮罩贴图到网格: ${child.name}, 材质: ${material.name}`)
                    }
                    material.needsUpdate = true
                  } else {
                    // 如果没有匹配，只对第一个材质应用漫反射贴图
                    if (index === 0 && textureName.includes('_diff')) {
                      material.map = texture
                      console.log(`应用通用漫反射贴图到网格: ${child.name}, 材质: ${material.name}`)
                      material.needsUpdate = true
                    }
                  }
                })
              } else {
                // 根据网格名称和贴图类型智能匹配
                const meshName = child.name.toLowerCase()
                const textureName = path.toLowerCase()

                // 检查网格名称是否与贴图名称匹配
                if (meshName.includes('head') && textureName.includes('head')) {
                  if (textureName.includes('_diff')) {
                    child.material.map = texture
                    console.log(
                      `应用头部漫反射贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  } else if (textureName.includes('_nor')) {
                    child.material.normalMap = texture
                    console.log(
                      `应用头部法线贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  } else if (textureName.includes('_mask')) {
                    child.material.alphaMap = texture
                    console.log(
                      `应用头部遮罩贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  }
                  child.material.needsUpdate = true
                } else if (meshName.includes('body') && textureName.includes('body')) {
                  if (textureName.includes('_diff')) {
                    child.material.map = texture
                    console.log(
                      `应用身体漫反射贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  } else if (textureName.includes('_nor')) {
                    child.material.normalMap = texture
                    console.log(
                      `应用身体法线贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  } else if (textureName.includes('_mask')) {
                    child.material.alphaMap = texture
                    console.log(
                      `应用身体遮罩贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  }
                  child.material.needsUpdate = true
                } else if (meshName.includes('hair') && textureName.includes('hair')) {
                  if (textureName.includes('_diff')) {
                    child.material.map = texture
                    console.log(
                      `应用头发漫反射贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  } else if (textureName.includes('_nor')) {
                    child.material.normalMap = texture
                    console.log(
                      `应用头发法线贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  } else if (textureName.includes('_mask')) {
                    child.material.alphaMap = texture
                    console.log(
                      `应用头发遮罩贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                  }
                  child.material.needsUpdate = true
                } else {
                  // 如果没有匹配，只应用漫反射贴图
                  if (textureName.includes('_diff')) {
                    child.material.map = texture
                    console.log(
                      `应用通用漫反射贴图到网格: ${child.name}, 材质: ${child.material.name}`,
                    )
                    child.material.needsUpdate = true
                  }
                }
              }
            }
          })

          console.log(`已加载 ${loadedTextures}/${totalTextures} 个贴图`)

          // 移除提前停止的逻辑，让所有贴图都能加载
        })
        .catch((error) => {
          console.warn(`无法加载TGA贴图: ${path}`, error)
          loadedTextures++
          console.log(`已尝试 ${loadedTextures}/${totalTextures} 个贴图`)
        })
    }
  })
}

// 强制刷新材质
const refreshMaterials = () => {
  if (!model) return

  console.log('强制刷新所有材质...')

  model.traverse((child) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          material.needsUpdate = true
          if (material.map) {
            material.map.needsUpdate = true
          }
        })
      } else {
        child.material.needsUpdate = true
        if (child.material.map) {
          child.material.map.needsUpdate = true
        }
      }
    }
  })

  console.log('材质刷新完成')
}

// 检查贴图数据
const checkTextureData = () => {
  if (!model) return

  console.log('检查贴图数据...')

  model.traverse((child) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          if (material.map) {
            console.log(`材质 ${material.name} 的贴图信息:`, {
              name: material.map.name,
              image: material.map.image,
              imageWidth: material.map.image?.width,
              imageHeight: material.map.image?.height,
              imageData: material.map.image?.data,
              hasImageData: !!material.map.image?.data,
            })
          }
        })
      } else {
        if (child.material.map) {
          console.log(`材质 ${child.material.name} 的贴图信息:`, {
            name: child.material.map.name,
            image: child.material.map.image,
            imageWidth: child.material.map.image?.width,
            imageHeight: child.material.map.image?.height,
            imageData: child.material.map.image?.data,
            hasImageData: !!child.material.map.image?.data,
          })
        }
      }
    }
  })
}

// 检查文件是否存在
const checkFileExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// 检查所有贴图文件
const checkAllTextures = async () => {
  console.log('检查贴图文件是否存在...')

  const texturePaths = [
    '/pmx/banshee/h55_butcher_banshee_body_diff.tga',
    '/pmx/banshee/h55_butcher_banshee_head_diff.tga',
    '/pmx/banshee/h55_butcher_banshee_hair_diff.tga',
    '/pmx/banshee/h55_butcher_banshee_wuqi01_diff.tga',
    '/pmx/banshee/h55_butcher_banshee_wuqi02_diff.tga',
    '/pmx/banshee/h55_butcher_banshee_body_diff.png',
    '/pmx/banshee/h55_butcher_banshee_head_diff.png',
    '/pmx/banshee/h55_butcher_banshee_body_diff.jpg',
    '/pmx/banshee/h55_butcher_banshee_head_diff.jpg',
  ]

  for (const path of texturePaths) {
    const exists = await checkFileExists(path)
    console.log(`${path}: ${exists ? '存在' : '不存在'}`)
  }
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

.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.controls button {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.controls button:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: #777;
}

.controls button:active {
  transform: scale(0.95);
}
</style>
