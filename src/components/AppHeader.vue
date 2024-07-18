<template>
    <div>
        <div class="header-image-container">
            <img :src="headerImage" alt="Header Image" class="header-image">
        </div>
        <header :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
            class="shadow sticky top-0 z-50">
            <div class="container mx-auto py-4 px-6 flex justify-between items-center">
                <router-link to="/" class="hover:text-gray-900">
                    <img :src="logoImage" alt="Logo">
                </router-link>
                <nav class="flex-1 text-center">
                    <ul class="flex justify-center space-x-8">
                        <li><router-link to="/" class="nav-link">Home</router-link></li>
                        <li><router-link to="/community" class="nav-link">Community</router-link></li>
                        <li><router-link to="/staff" class="nav-link">Staff</router-link></li>
                        <li><router-link to="/news" class="nav-link">News</router-link></li>
                    </ul>
                </nav>
                <div class="relative flex space-x-4">
                    <input type="text" v-model="searchQuery" @input="searchUsers" placeholder="Search..."
                        class="p-2 border rounded-lg">
                    <div v-if="searchResults.length"
                        class="absolute top-full mt-2 right-0 w-auto bg-white shadow-lg rounded-lg z-10"
                        :style="{ width: '200px' }">
                        <ul>
                            <li v-for="result in searchResults" :key="result.id" class="p-2 border-b hover:bg-gray-200">
                                <router-link :to="`/dashboard/${result.id}`" @click="clearSearch">{{ result.username
                                    }}</router-link>
                            </li>
                        </ul>
                    </div>

                    <button @click="toggleDarkMode" class="toggle-dark-mode-btn">
                        <fa-icon :icon="isDarkMode ? 'sun' : 'moon'" />
                    </button>
                    <button @click="logout" class="logout-btn">Logout</button>
                </div>
            </div>
        </header>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

library.add(faSun, faMoon);

export default {
    props: {
        headerImage: {
            type: String,
            required: true
        },
        logoImage: {
            type: String,
            required: true
        }
    },
    components: {
        'fa-icon': FontAwesomeIcon
    },
    data() {
        return {
            isDarkMode: false,
            searchQuery: '',
            searchResults: []
        };
    },
    methods: {
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        async searchUsers() {
            if (this.searchQuery.trim() === '') {
                this.searchResults = [];
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/search-users`, {
                    params: { query: this.searchQuery },
                    headers: { 'x-access-token': token }
                });
                this.searchResults = response.data;
            } catch (error) {
                console.error('Error searching users:', error);
            }
        },

        clearSearch() {
            this.searchQuery = '';
            this.searchResults = [];
        },
        async logout() {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/logout`, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                });
                localStorage.removeItem('token');
                this.$router.push('/login');
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
    }
};
</script>

<style scoped>
.header-image-container {
    width: 100%;
    height: 200px;
    /* Adjust the height as needed */
    overflow: hidden;
    position: relative;
}

.header-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.nav-link {
    @apply text-lg hover:text-blue-500 transition duration-300;
}

.toggle-dark-mode-btn,
.logout-btn {
    @apply px-4 py-2 rounded-lg;
}

.toggle-dark-mode-btn {
    @apply bg-gray-700 text-white hover:bg-gray-600;
}

.logout-btn {
    @apply bg-red-500 text-white hover:bg-red-400;
}
</style>
