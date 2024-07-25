import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import io from 'socket.io-client';
import UserLogin from '../views/UserLogin.vue';
import UserRegister from '../views/UserRegister.vue';
import UserDashboard from '../views/UserDashboard.vue';
import AppSettings from '../views/AppSettings.vue';
import AppCommunity from '../views/AppCommunity.vue';
import AppStaff from '../views/AppStaff.vue';
import AppNews from '../views/AppNews.vue';
import AppError404 from '../views/AppError404.vue';
import AppError500 from '../views/AppError500.vue';
import AppError from '../views/AppError.vue';
import ArticleDetail from '../views/ArticleDetail.vue';
import AppGames from '../views/AppGames.vue';
import GameDetail from '../views/GameDetail.vue';
import AppMusics from '../views/AppMusics.vue';
import AppBoutique from '../views/AppBoutique.vue';
import AppLottery from '../views/AppLottery.vue';
import AppPixels from '../views/AppPixels.vue';
import AppPrivacy from '../views/AppPrivacy.vue';
import AppTerms from '../views/AppTerms.vue';
import AppTopstory from '../views/AppTopstory.vue';
import AppMaintenance from '../views/AppMaintenance.vue';
import AppJetons from '../views/AppJetons.vue';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: UserLogin, meta: { guest: true } },
    { path: '/register', component: UserRegister, meta: { guest: true } },
    { path: '/dashboard', component: UserDashboard, meta: { requiresAuth: true } },
    { path: '/settings', component: AppSettings, meta: { requiresAuth: true } },
    { path: '/community', component: AppCommunity, meta: { requiresAuth: true } },
    { path: '/games', component: AppGames, meta: { requiresAuth: true } },
    { path: '/games/:id', name: 'GameDetail', component: GameDetail, meta: { requiresAuth: true } },
    { path: '/staff', component: AppStaff, meta: { requiresAuth: true } },
    { path: '/musics', component: AppMusics, meta: { requiresAuth: true } },
    { path: '/news', component: AppNews, meta: { requiresAuth: true } },
    { path: '/boutique', component: AppBoutique, meta: { requiresAuth: true } },
    { path: '/lottery', component: AppLottery, meta: { requiresAuth: true } },
    { path: '/pixels', component: AppPixels, meta: { requiresAuth: true } },
    { path: '/dashboard/:userId', component: UserDashboard, meta: { requiresAuth: true } },
    { path: '/topstories', component: AppTopstory, meta: { requiresAuth: true } },
    { path: '/tokens', component: AppJetons, meta: { requiresAuth: true } },
    { path: '/404', component: AppError404 },
    { path: '/500', component: AppError500 },
    { path: '/privacy', component: AppPrivacy },
    { path: '/terms', component: AppTerms },
    { path: '/error/:statusCode/:message', component: AppError, props: true },
    { path: '/articles/:id', name: 'ArticleDetail', component: ArticleDetail, meta: { requiresAuth: true } },
    { path: '/maintenance', component: AppMaintenance },
    { path: '/:catchAll(.*)', redirect: '/404' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

const socket = io(process.env.VUE_APP_API_URL || 'http://localhost:3000');
socket.on('maintenance', async (isMaintenance) => {
    if (isMaintenance) {
        const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.post(`${apiUrl}/logout`, {}, {
                    headers: { 'x-access-token': token }
                });
            } catch (error) {
                console.error('Error logging out:', error);
            }
            localStorage.removeItem('token');
        }
        router.push('/maintenance');
    }
});


async function checkSession() {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    } else {
        try {
            const response = await axios.get(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/check-session`, {
                headers: { 'x-access-token': token }
            });
            return response.data.valid;
        } catch (error) {
            localStorage.removeItem('token'); // enlever le token si la session n'est pas valide
            return false;
        }
    }
}

router.beforeEach(async (to, from, next) => {
    const isAuthenticated = await checkSession();
    const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';

    try {
        const response = await axios.get(`${apiUrl}/maintenance-status`);
        const isMaintenance = response.data.maintenance;

        if (isMaintenance) {
            if (to.path !== '/maintenance') {
                if (isAuthenticated) {
                    const userResponse = await axios.get(`${apiUrl}/dashboard`, {
                        headers: { 'x-access-token': localStorage.getItem('token') }
                    });
                    const userRank = userResponse.data.rank;

                    if (userRank >= 5) {
                        next();
                    } else {
                        await axios.post(`${apiUrl}/logout`, {}, {
                            headers: { 'x-access-token': localStorage.getItem('token') }
                        });
                        localStorage.removeItem('token');
                        next('/maintenance');
                    }
                } else {
                    next('/maintenance');
                }
            } else {
                next();
            }
        } else {
            if (to.path === '/maintenance') {
                next('/login');
            } else if (to.matched.some(record => record.meta.requiresAuth)) {
                if (!isAuthenticated) {
                    next('/login');
                } else {
                    next();
                }
            } else if (to.matched.some(record => record.meta.guest)) {
                if (isAuthenticated) {
                    next('/dashboard');
                } else {
                    next();
                }
            } else {
                next();
            }
        }
    } catch (error) {
        console.error('Error checking maintenance status:', error);
        next('/error/500/Internal Server Error');
    }
});

export default router;
