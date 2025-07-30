<script setup>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div id="app">
    <Header />
    <div class="main-layout">
      <Sidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <Footer />
  </div>
</template>

<style>
/* 可以放全局样式 */
</style>
