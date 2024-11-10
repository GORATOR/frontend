import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from './store/user'

import login from './pages/login.vue'
import home from './pages/home.vue'
import teams from './pages/teams/list.vue'
import teamCreate from './pages/teams/create.vue'
import organizations from './pages/organizations/list.vue'
import organizationCreate from './pages/organizations/create.vue'
import users from './pages/users/list.vue'
import userCreate from './pages/users/create.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: home },
    { path: '/login', component: login },
    { path: '/teams', component: teams },
    { path: '/teams/new', component: teamCreate },
    { path: '/organizations', component: organizations },
    { path: '/organizations/new', component: organizationCreate },
    { path: '/users', component: users },
    { path: '/users/new', component: userCreate },
  ]
})

router.beforeEach(async (to) => {
  const isLoginPage = to.path == '/login'
  const auth = useUserStore()

  if (!isLoginPage && !auth.sessionId) {
    return '/login'
  }

  if (isLoginPage && auth.sessionId) {
    return '/'
  }
})