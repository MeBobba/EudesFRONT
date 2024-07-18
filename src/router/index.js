import { createRouter, createWebHistory } from 'vue-router';
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

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: UserLogin, meta: { guest: true } },
    { path: '/register', component: UserRegister, meta: { guest: true } },
    { path: '/dashboard', component: UserDashboard, meta: { requiresAuth: true } },
    { path: '/settings', component: AppSettings, meta: { requiresAuth: true } },
    { path: '/community', component: AppCommunity, meta: { requiresAuth: true } },
    { path: '/staff', component: AppStaff, meta: { requiresAuth: true } },
    { path: '/news', component: AppNews, meta: { requiresAuth: true } },
    { path: '/dashboard/:userId', component: UserDashboard, meta: { requiresAuth: true } },
    { path: '/dashboard', redirect: `/dashboard/me` },
    { path: '/404', component: AppError404 },
    { path: '/500', component: AppError500 },
    { path: '/error/:statusCode/:message', component: AppError, props: true },
    { path: '/:catchAll(.*)', redirect: '/404' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (to.matched.some(record => record.meta.requiresAuth)) {
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
});

export default router;
