import { createApp } from 'vue';
import '@fortawesome/fontawesome-free/css/all.css';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css'; // Assurez-vous que ce chemin est correct
import './registerServiceWorker'
import api from './axios';  // Import de l'instance Axios configurée
import i18n from './i18n'; // Importer i18n

const app = createApp(App);

app.config.globalProperties.$http = api;  // Rendre l'instance Axios disponible globalement

app.use(router).mount('#app');
app.use(i18n); // Utiliser i18n
