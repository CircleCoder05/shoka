import { ref, reactive } from 'vue'

// 模型配置store
export const useModelsStore = () => {
  const modelsConfig = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // 加载模型配置
  const loadModelsConfig = async () => {
    if (modelsConfig.value) return modelsConfig.value

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/3d/models-config.json')
      if (!response.ok) {
        throw new Error(`Failed to load models config: ${response.status}`)
      }
      modelsConfig.value = await response.json()
      return modelsConfig.value
    } catch (err) {
      error.value = err.message
      console.error('加载模型配置失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取模型配置
  const getModelConfig = (modelKey) => {
    if (!modelsConfig.value) return null

    const model = modelsConfig.value.models[modelKey]
    if (!model) return null

    // 合并默认配置和模型特定配置
    const defaults = modelsConfig.value.defaults
    const config = model.config

    return {
      modelPath: model.path,
      format: model.format || 'glb', // 添加format字段
      texturePath: model.texturePath || '', // 添加texturePath字段
      name: model.name,
      description: model.description,
      initialScale: config.initialScale ?? defaults.initialScale,
      cameraPosition: config.cameraPosition ?? defaults.cameraPosition,
      modelRotation: config.modelRotation ?? defaults.modelRotation,
      backgroundColor: config.backgroundColor ?? defaults.backgroundColor,
      saturationMultiplier: config.saturationMultiplier ?? defaults.saturationMultiplier,
      brightnessMultiplier: config.brightnessMultiplier ?? defaults.brightnessMultiplier,
      shininess: config.shininess ?? defaults.shininess,
      roughness: config.roughness ?? defaults.roughness,
      metalness: config.metalness ?? defaults.metalness,
      ambientLightIntensity: config.ambientLightIntensity ?? defaults.ambientLightIntensity,
      directionalLightIntensity:
        config.directionalLightIntensity ?? defaults.directionalLightIntensity,
      enableZoom: config.enableZoom ?? defaults.enableZoom,
      enablePan: config.enablePan ?? defaults.enablePan,
      horizontalOnly: config.horizontalOnly ?? defaults.horizontalOnly,
      materialColors: config.materialColors ?? defaults.materialColors,
      lights: config.lights ?? defaults.lights,
    }
  }

  // 获取所有模型列表
  const getAllModels = () => {
    if (!modelsConfig.value) return []

    return Object.entries(modelsConfig.value.models).map(([key, model]) => ({
      key,
      name: model.name,
      description: model.description,
      path: model.path,
    }))
  }

  // 获取默认配置
  const getDefaultConfig = () => {
    if (!modelsConfig.value) return null
    return modelsConfig.value.defaults
  }

  return {
    modelsConfig,
    isLoading,
    error,
    loadModelsConfig,
    getModelConfig,
    getAllModels,
    getDefaultConfig,
  }
}
