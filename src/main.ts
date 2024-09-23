import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import { routes } from './router'
import App from './App.vue'

createApp(App)
    .use(createPinia())
    .use(createRouter({
        history: createWebHistory(),
        routes,
    }))
    .mount('#app')
