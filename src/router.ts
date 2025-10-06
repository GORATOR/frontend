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
import projects from './pages/projects/list.vue'
import projectCreate from './pages/projects/create.vue'
import issues from './pages/issues/list.vue'
import organization from './pages/organizations/read.vue'
import project from './pages/projects/read.vue'
import team from './pages/teams/read.vue'
import user from './pages/users/read.vue'
import multiselectDemo from './pages/multiselect-demo.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: home },
    { path: '/login', component: login },
    { path: '/teams', component: teams },
    { path: '/teams/new', component: teamCreate },
    { path: '/organizations', component: organizations },
    { path: '/organization/:id', component: organization },
    { path: '/project/:id', component: project },
    { path: '/team/:id', component: team },
    { path: '/user/:id', component: user },
    { path: '/organizations/new', component: organizationCreate },
    { path: '/users', component: users },
    { path: '/users/new', component: userCreate },
    { path: '/projects', component: projects },
    { path: '/projects/new', component: projectCreate },
    { path: '/issues', component: issues },
    { path: '/multiselect-demo', component: multiselectDemo },
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