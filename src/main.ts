import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import { i18n } from './i18n'
import { useUserStore } from './store/user'
import App from './App.vue'
import './assets/style.scss'

createApp(App)
    .use(createPinia())
    .use(router)
    .use(i18n)
    .mount('#app')

const userStore = useUserStore()
const loadedCurrentUser = await userStore.loadCurrentUser()
if (!loadedCurrentUser) {
    // error occured (401 or something)
    window.location.reload()
}