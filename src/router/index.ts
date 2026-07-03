import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { header: 'Home', description: 'Welcome to our application!' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { header: 'About Us', description: 'Learn more about this project.' }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
      meta: { header: 'Test Page', description: 'This is a simple test page.' }
    }, // <-- Added comma separator
    {
      path: '/nodes',
      name: 'nodes',
      component: () => import('../views/NodesView.vue'),
      meta: { header: 'Graph Nodes', description: 'Visualization and management of graph nodes.' }
    },
    {
      path: '/gant',
      name: 'gant',
      component: () => import('../views/GantView.vue'),
      meta: { header: 'Gantt Chart', description: 'Визуализация задач на временной шкале.' }
    },
    {
      path: '/participants-filter',
      name: 'participants-filter',
      component: () => import('../views/ParticipantsFilterView.vue'),
      meta: { header: 'Participants Filter', description: 'Фильтрация участников.' }
    },
  ]
})

export default router
