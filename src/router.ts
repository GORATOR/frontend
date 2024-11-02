import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from './store/user'

import login from './pages/login.vue'
import home from './pages/home.vue'
import teams from './pages/teams/list.vue'
import teamCreate from './pages/teams/create.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: home },
    { path: '/login', component: login },
    { path: '/teams', component: teams },
    { path: '/teams/new', component: teamCreate },
  ]
})

router.beforeEach(async (to) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const auth = useUserStore()

  if (authRequired && !auth.sessionId) {
    return '/login'
  }
})