import { createRouter, createWebHistory } from 'vue-router'

import login from './pages/login.vue'
import home from './pages/home.vue'
import { useUserStore } from './store/user'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: home },
    { path: '/login', component: login },
  ]
})

router.beforeEach(async (to) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const auth = useUserStore()

  if (authRequired && !auth.logined) {
    console.log(auth)
    return '/login'
  }
})