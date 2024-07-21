<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div v-for="game in paginatedGames" :key="game.id"
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center w-72 mx-auto">
                    <img :src="game.icon" alt="Game Icon" class="w-32 h-32 object-cover rounded-full mb-4" />
                    <h2 class="text-2xl font-semibold mb-4 text-center">{{ game.title }}</h2>
                    <button @click="playGame(game.id)" class="bg-blue-500 text-white px-6 py-2 rounded-lg">Play</button>
                </div>
            </div>
            <div v-if="totalPages > 1" class="flex justify-center mt-8">
                <button @click="prevPage" :disabled="currentPage === 1"
                    class="bg-blue-500 text-white px-4 py-2 mx-2 rounded-lg">
                    Previous
                </button>
                <span class="mx-2">{{ currentPage }} / {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages"
                    class="bg-blue-500 text-white px-4 py-2 mx-2 rounded-lg">
                    Next
                </button>
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
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
            isDarkMode: false,
            games: [],
            currentPage: 1,
            gamesPerPage: 8,
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.games.length / this.gamesPerPage);
        },
        paginatedGames() {
            const start = (this.currentPage - 1) * this.gamesPerPage;
            return this.games.slice(start, start + this.gamesPerPage);
        }
    },
    async created() {
        await this.fetchGames();
    },
    methods: {
        async fetchGames() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/games`, {
                    headers: this.getAuthHeaders()
                });
                this.games = response.data;
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        },
        playGame(id) {
            this.$router.push({ name: 'GameDetail', params: { id } });
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        getAuthHeaders() {
            const token = localStorage.getItem('token');
            return token ? { 'x-access-token': token } : {};
        }
    },
};
</script>

<style scoped>
/* Add custom styles here if needed */
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
