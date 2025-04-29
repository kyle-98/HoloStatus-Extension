import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            cssLayer: true,
            defaultMode: 'dark'
        }
    }
});

app.use(ToastService);

app.component('Toast', Toast);

app.mount('#app');
