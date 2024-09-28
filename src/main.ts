import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import { routes } from './router'
import { i18n } from './i18n'
import App from './App.vue'

createApp(App)
    .use(createPinia())
    .use(createRouter({
        history: createWebHistory(),
        routes,
    }))
    .use(i18n)
    .mount('#app')
