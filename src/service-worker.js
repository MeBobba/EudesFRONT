/* eslint-disable */
import { precacheAndRoute } from 'workbox-precaching';

// Insérer le manifeste de pré-cache généré par Workbox
self.__precacheManifest = [].concat(self.__WB_MANIFEST || []);

// Mettre en cache et router à l'aide du manifeste de pré-cache
precacheAndRoute(self.__precacheManifest);

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
/* eslint-enable */
