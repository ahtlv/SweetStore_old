import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from './router'
import { createPinia } from 'pinia'
import ResizeTextarea from 'resize-textarea-vue3'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ResizeTextarea)
app.mount('#app')