<script setup lang="ts">
import { RouterLink } from 'vue-router'
import router from '../router'

const navLinks = router.options.routes.map(route => ({
  path: route.path,
  name: (route.meta && (route.meta as any).header)
    ? String((route.meta as any).header)
    : route.name
      ? String(route.name)
      : String(route.path)
}))
</script>

<template>

  <nav>
    <template v-for="link in navLinks" :key="link.name">
      <RouterLink :to="link.path" v-if="link.name !== 'Home'">
        {{ link.name.charAt(0).toUpperCase() + link.name.slice(1) }}
      </RouterLink>
    </template>
  </nav>

</template>

<style>
nav a {
  margin: 15px 0;
  display: block;
  text-decoration: none;
  color: #333;
}
</style>
