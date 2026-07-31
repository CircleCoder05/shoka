<template>
  <div class="oml2d-container" aria-hidden="true"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useOml2dStore } from '../stores/oml2d'
import { useConfigStore } from '../stores/config'

const oml2dStore = useOml2dStore()
const configStore = useConfigStore()
let stopLive2dWatch = null

onMounted(async () => {
  await configStore.loadConfig()
  stopLive2dWatch = watch(
    () => configStore.siteConfig.live2d_enabled,
    (enabled) => oml2dStore.setEnabled(enabled !== false),
    { immediate: true },
  )
})

onBeforeUnmount(() => {
  stopLive2dWatch?.()
  oml2dStore.suspend()
})
</script>

<style scoped lang="scss" src="@/styles/sfc/components/OhMyLive2d.scss"></style>
