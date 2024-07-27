<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <div v-if="isAdmin" class="mb-8">
                <button @click="showAddModal"
                    class="bg-green-500 text-white px-6 py-2 rounded-lg transition-transform transform hover:scale-105">{{
                        $t('gamespage.newgame') }}</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div v-for="game in paginatedGames" :key="game.id"
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center w-72 mx-auto transition-transform transform hover:scale-105">
                    <img :src="game.icon" alt="Game Icon"
                        class="w-32 h-32 object-cover rounded-full mb-4 animate-fade-in" />
                    <h2 class="text-2xl font-semibold mb-4 text-center">{{ game.title }}</h2>
                    <button @click="playGame(game.id)"
                        class="bg-blue-500 text-white px-6 py-2 rounded-lg transition-transform transform hover:scale-105">{{
                            $t('gamespage.playgame') }}</button>
                    <button v-if="isAdmin" @click="deleteGame(game.id)"
                        class="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105">{{
                            $t('gamespage.deletegame') }}</button>
                </div>
            </div>
            <div v-if="totalPages > 1" class="flex justify-center mt-8">
                <button @click="prevPage" :disabled="currentPage === 1"
                    :class="['bg-blue-500 text-white px-4 py-2 mx-2 rounded-lg transition-transform transform hover:scale-105', { 'disabled:opacity-50': currentPage === 1 }]">{{
                        $t('previouspage') }}</button>
                <span class="mx-2">{{ currentPage }} / {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages"
                    :class="['bg-blue-500 text-white px-4 py-2 mx-2 rounded-lg transition-transform transform hover:scale-105', { 'disabled:opacity-50': currentPage === totalPages }]">{{
                        $t('nextpage') }}</button>
            </div>
        </div>
        <AppFooter :footerLogo="footerLogo" />
        <AppModal v-if="showModal" @close="closeModal" title="Add New Game">
            <div class="p-5">
                <form @submit.prevent="addGame" class="animate-fade-in">
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Title</label>
                        <input v-model="newGame.title" type="text" required
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none " />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Icon URL</label>
                        <input v-model="newGame.icon" type="text" required
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none " />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Source URL</label>
                        <input v-model="newGame.source" type="text" required
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none " />
                    </div>
                    <button type="submit"
                        class="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Add
                        Game</button>
                </form>
            </div>
        </AppModal>

    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import AppModal from '../components/AppModal.vue';

export default {
    components: {
        AppHeader,
        AppFooter,
        AppModal
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.webp'),
            footerLogo: require('@/assets/images/skeleton/footerlogo.png'),
            logoImage: require('@/assets/images/skeleton/logo.png'),
            isDarkMode: false,
            games: [],
            currentPage: 1,
            gamesPerPage: 8,
            showModal: false,
            newGame: {
                title: '',
                icon: '',
                source: ''
            },
            isAdmin: false // To be set based on user's role
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
        await this.checkAdmin();
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
        async checkAdmin() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/profile/me`, {
                    headers: this.getAuthHeaders()
                });
                this.isAdmin = response.data.rank >= 5;
            } catch (error) {
                console.error('Error checking admin status:', error);
            }
        },
        async addGame() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/games`, this.newGame, {
                    headers: this.getAuthHeaders()
                });
                this.games.push(response.data);
                this.closeModal();
            } catch (error) {
                console.error('Error adding game:', error);
            }
        },
        async deleteGame(id) {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.delete(`${apiUrl}/games/${id}`, {
                    headers: this.getAuthHeaders()
                });
                this.games = this.games.filter(game => game.id !== id);
            } catch (error) {
                console.error('Error deleting game:', error);
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
        showAddModal() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
            this.newGame = {
                title: '',
                icon: '',
                source: ''
            };
        },
        getAuthHeaders() {
            const token = localStorage.getItem('token');
            return token ? { 'x-access-token': token } : {};
        }
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

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.disabled\:opacity-50 {
    opacity: 0.5;
    pointer-events: none;
}

.transition-transform {
    transition: transform 0.3s ease-in-out;
}

.transform:hover {
    transform: scale(1.05);
}
</style>
