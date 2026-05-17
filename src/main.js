import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import './assets/tables.css'
import './assets/motion.css'
import App from './App.vue'
import router from './router'
import tilt from './directives/tilt'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('tilt', tilt)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
})

app.mount('#app')
