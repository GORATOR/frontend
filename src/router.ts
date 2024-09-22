import { createWebHistory, createRouter } from 'vue-router'

import Wtf from './components/test.vue'
import Kek from './components/kek.vue'

const routes = [
  { path: '/', component: Wtf },
  { path: '/about', component: Kek },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export { router }