import login from './pages/login.vue'
import home from './pages/home.vue'

const routes = [
  { path: '/', component: home },
  { path: '/login', component: login },
]

export { routes }