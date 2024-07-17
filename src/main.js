import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css'; // Assurez-vous que ce chemin est correct
import './registerServiceWorker'

createApp(App).use(router).mount('#app');
