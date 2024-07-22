<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-4xl font-bold">Game Detail</h1>
                <button @click="goBack"
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105">Back
                    to Games</button>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full h-[80vh] animate-fade-in">
                <iframe :src="gameSource" class="w-full h-full" frameborder="0"></iframe>
            </div>
        </div>
        <AppFooter :logoImage="logoImage" />
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';

export default {
    components: {
        AppHeader,
        AppFooter,
    },
    data() {
        return {
            gameSource: '',
            isDarkMode: false,
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
        };
    },
    async created() {
        await this.fetchGameSource();
    },
    methods: {
        async fetchGameSource() {
            try {
                const response = await axios.get(`http://localhost:3000/games/${this.$route.params.id}`);
                this.gameSource = response.data.source;
            } catch (error) {
                console.error('Error fetching game source:', error);
            }
        },
        goBack() {
            this.$router.push('/games');
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        },
    },
};
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
}

.transition-transform {
    transition: transform 0.3s ease-in-out;
}

.transform:hover {
    transform: scale(1.05);
}
</style>
