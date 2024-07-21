<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-4">Staff Page</h1>
            <div class="flex">
                <div class="flex-grow">
                    <div v-for="section in staffSections" :key="section.rank_name" class="mb-8">
                        <h2 class="text-2xl font-semibold mb-4">{{ section.rank_name }}</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <div v-for="user in section.users" :key="user.id"
                                class="bg-cover bg-center rounded-lg shadow-md relative flex items-center justify-center"
                                :style="{ backgroundImage: `url(${user.coverImage || backgroundImage})` }">
                                <div class="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
                                <div class="relative flex flex-col items-center p-4">
                                    <div
                                        class="relative w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center z-10">
                                        <img v-if="user.profileImage" :src="user.profileImage" alt="Profile" />
                                        <img v-else-if="user.look"
                                            :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${user.look}&direction=3&head_direction=3&gesture=nor&action=null&size=m&headonly=1&img_format=gif`"
                                            alt="Profile" />
                                    </div>
                                    <router-link :to="`/dashboard/${user.id}`"
                                        class="text-xl sm:text-2xl font-semibold text-white relative mt-4">{{
                                            user.username
                                        }}</router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-1/4 ml-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h2 class="text-2xl font-semibold mb-4">Informations importantes</h2>
                    <p class="text-gray-700 dark:text-gray-300">Voici quelques informations importantes concernant le
                        staff. Vous trouverez ici des détails sur les rôles, les responsabilités et les dernières mises
                        à jour.</p>
                </div>
            </div>
        </div>
        <div v-if="loading" class="text-center py-4">Loading...</div>
        <AppFooter :logoImage="logoImage" />
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import axios from 'axios';
import backgroundImage from '@/assets/images/skeleton/topbg.png';

export default {
    components: {
        AppHeader,
        AppFooter
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
            isDarkMode: false,
            staffSections: [],
            backgroundImage,
            page: 1,
            limit: 20,
            loading: false,
            noMoreData: false
        };
    },
    methods: {
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        },
        async fetchStaffData() {
            if (this.loading || this.noMoreData) return;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/staff`, {
                    headers: { 'x-access-token': token },
                    params: { page: this.page, limit: this.limit }
                });
                if (response.data.length) {
                    this.staffSections = [...this.staffSections, ...response.data];
                    this.page++;
                } else {
                    this.noMoreData = true;
                }
            } catch (error) {
                console.error('Error fetching staff data:', error);
            } finally {
                this.loading = false;
            }
        },
        handleScroll() {
            const bottomOfWindow = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
            if (bottomOfWindow) {
                this.fetchStaffData();
            }
        }
    },
    created() {
        this.fetchStaffData();
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }
};
</script>

<style scoped>
.bg-cover {
    background-size: cover;
}

.bg-center {
    background-position: center;
}

.text-center {
    text-align: center;
}

.flex-col.items-center.p-4 {
    padding: 16px;
    text-align: center;
}
</style>
