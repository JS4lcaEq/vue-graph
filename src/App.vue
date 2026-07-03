<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

</script>

<template>

  <header id="logo">
    <RouterLink to="/"><img alt="Vue logo" class="logo" src="@/assets/logo.png" /></RouterLink>
    <h1>Graph / </h1>
    <h2>{{ route.meta && route.meta.header ? route.meta.header : 'Graph' }}</h2>
  </header>

  <main>
    <RouterView />
  </main>

  <footer>
    <div>© 2026 Graph. All rights reserved.</div>
  </footer>
</template>

<style>
#logo {
  display: flex;
  align-items: center;
  gap: 16px;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #ddd;
}

main {
  flex: 1;
  padding: 20px 64px;
  margin: 0;
}

footer {
  text-align: center;
  height: 64px;
  background-color: #ddd;
  line-height: 64px;
}
</style>
