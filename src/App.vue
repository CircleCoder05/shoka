<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div id="app">
    <Header class="floating-header" />
    <router-view />
    <Footer />
  </div>
</template>

<style>
.floating-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 8px rgba(237, 110, 160, 0.04);
  backdrop-filter: blur(8px);
}
</style>
