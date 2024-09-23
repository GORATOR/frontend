import Wtf from './components/test.vue'
import Kek from './components/kek.vue'
import Login from './pages/login.vue'

const routes = [
  { path: '/', component: Wtf },
  { path: '/about', component: Kek },
  { path: '/login', component: Login },
]

export { routes }