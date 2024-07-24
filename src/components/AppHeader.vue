<template>
    <div>
        <div class="header-image-container">
            <img :src="headerImage" alt="Header Image" class="header-image" loading="lazy">
        </div>
        <header :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
            class="shadow sticky top-0 z-50">
            <div
                class="container mx-auto py-4 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex justify-between items-center">

                <!-- Logo - Hidden on mobile menu -->
                <router-link to="/" class="hover:text-gray-900 hidden sm:block">
                    <img :src="logoImage" alt="Logo" loading="lazy">
                </router-link>

                <!-- Regular Menu - Desktop -->
                <nav class="hidden sm:flex sm:items-center sm:space-x-4 w-full">
                    <ul class="flex justify-center space-x-4 w-full">
                        <li><router-link to="/dashboard" class="nav-link" active-class="router-link-active"
                                exact-active-class="exact-router-link-active">{{ $t('dashboard') }}</router-link></li>
                        <li><router-link to="/community" class="nav-link" active-class="router-link-active"
                                exact-active-class="exact-router-link-active">{{ $t('community') }}</router-link></li>
                        <li><router-link to="/games" class="nav-link" active-class="router-link-active"
                                exact-active-class="exact-router-link-active">{{ $t('games') }}</router-link></li>
                        <li><router-link to="/staff" class="nav-link" active-class="router-link-active"
                                exact-active-class="exact-router-link-active">{{ $t('staff') }}</router-link></li>
                        <li><router-link to="/boutique" class="nav-link" active-class="router-link-active"
                                exact-active-class="exact-router-link-active">{{ $t('shop') }}</router-link></li>
                        <li><router-link to="/news" class="nav-link" active-class="router-link-active"
                                exact-active-class="exact-router-link-active">{{ $t('news') }}</router-link></li>
                    </ul>
                    <div class="relative flex space-x-4 ml-auto">
                        <input type="text" v-model="searchQuery" @input="searchUsers"
                            :placeholder="$t('searchPlaceholder')" class="p-2 sm:px-3 md:px-4 border rounded-lg">
                        <div v-if="searchResults.length"
                            class="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-lg z-10">
                            <ul>
                                <li v-for="result in searchResults" :key="result.id"
                                    class="p-2 border-b hover:bg-gray-200">
                                    <router-link :to="`/dashboard/${result.id}`" @click="clearSearch">{{ result.username
                                        }}</router-link>
                                </li>
                            </ul>
                        </div>
                        <select v-model="selectedLanguage" @change="changeLanguage"
                            class="language-selector custom-select">
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                            <option value="it">Italiano</option>
                        </select>
                        <button @click="logout" class="logout-btn">{{ $t('logout') }}</button>
                    </div>
                </nav>

                <!-- Open/Close menu button for mobile -->
                <button v-if="!isMenuOpen" @click="toggleMenu" class="block sm:hidden">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                </button>
                <button v-if="isMenuOpen" @click="toggleMenu" class="absolute top-0 right-0 mt-4 mr-4 block sm:hidden">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>

                <!-- Responsive Menu - Mobile -->
                <div class="sm:hidden w-full" :class="{ 'block': isMenuOpen, 'hidden': !isMenuOpen }">
                    <input type="text" v-model="searchQuery" @input="searchUsers" :placeholder="$t('searchPlaceholder')"
                        class="p-2 sm:px-3 md:px-4 border rounded-lg mt-10 mb-4 w-full">
                    <div v-if="searchResults.length" class="relative w-full">
                        <ul class="absolute top-full left-0 mt-1 w-full bg-white shadow-lg rounded-lg z-10">
                            <li v-for="result in searchResults" :key="result.id" class="p-2 border-b hover:bg-gray-200">
                                <router-link :to="`/dashboard/${result.id}`" @click="clearSearch">{{ result.username
                                    }}</router-link>
                            </li>
                        </ul>
                    </div>
                    <ul class="space-y-2 w-full">
                        <li><router-link to="/" class="block px-4 py-2 rounded-lg nav-link"
                                active-class="router-link-active" exact-active-class="exact-router-link-active">{{
                                    $t('home') }}</router-link></li>
                        <li><router-link to="/community" class="block px-4 py-2 rounded-lg nav-link"
                                active-class="router-link-active" exact-active-class="exact-router-link-active">{{
                                    $t('community')
                                }}</router-link></li>
                        <li><router-link to="/games" class="block px-4 py-2 rounded-lg nav-link"
                                active-class="router-link-active" exact-active-class="exact-router-link-active">{{
                                    $t('games') }}</router-link></li>
                        <li><router-link to="/staff" class="block px-4 py-2 rounded-lg nav-link"
                                active-class="router-link-active" exact-active-class="exact-router-link-active">{{
                                    $t('staff') }}</router-link></li>
                        <li><router-link to="/news" class="block px-4 py-2 rounded-lg nav-link"
                                active-class="router-link-active" exact-active-class="exact-router-link-active">{{
                                    $t('news') }}</router-link></li>
                    </ul>

                    <div class="flex space-x-4 mt-4">
                        <select v-model="selectedLanguage" @change="changeLanguage"
                            class="language-selector custom-select">
                            <option value="en" class="custom-option">English</option>
                            <option value="fr" class="custom-option">Français</option>
                            <option value="it" class="custom-option">Italiano</option>
                        </select>
                        <button @click="logout" class="logout-btn w-full">{{ $t('logout') }}</button>
                    </div>
                </div>

            </div>
        </header>
    </div>
</template>


<script>
import axios from 'axios';

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
    data() {
        return {
            isDarkMode: false,
            searchQuery: '',
            searchResults: [],
            isMenuOpen: false,
            selectedLanguage: localStorage.getItem('locale') || 'en',
            sessionCheckInterval: null,
        };
    },
    methods: {
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
                if (error.response && error.response.status === 401) {
                    // Token expiré, forcer la déconnexion
                    this.logout();
                } else {
                    console.error(this.$t('searchinguserserror'), error);
                }
            }
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
            } catch (error) {
                console.error(this.$t('logouterror'), error);
            } finally {
                localStorage.removeItem('token');
                this.$router.push('/login');
            }
        },
        async checkSession() {
            const token = localStorage.getItem('token');
            if (!token) {
                this.logout();
            } else {
                try {
                    const response = await axios.get(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/check-session`, {
                        headers: { 'x-access-token': token }
                    });
                    if (!response.data.valid) {
                        this.logout();
                    }
                } catch (error) {
                    this.logout();
                }
            }
        },
        changeLanguage(event) {
            const newLocale = event.target.value;
            this.$i18n.locale = newLocale;
            localStorage.setItem('locale', newLocale);
        },
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        clearSearch() {
            this.searchQuery = '';
            this.searchResults = [];
            this.isMenuOpen = false; // Close menu after selecting an item
        }
    },
    created() {
        this.sessionCheckInterval = setInterval(this.checkSession, 60000); // Vérifier la session toutes les 60 secondes
    },
    beforeUnmount() {
        clearInterval(this.sessionCheckInterval);
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

/* Style for active menu link */
.router-link-active {
    @apply text-blue-500 font-bold;
}

/* Optional: exact active class for exact matching */
.exact-router-link-active {
    @apply text-blue-500 font-bold;
}

.language-selector {
    @apply border px-2 py-1 rounded-lg;
}

.custom-select {
    appearance: none;
    padding: 0.5rem 1.5rem;
    border-radius: 0.375rem;
    background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 4 5"%3e%3cpath fill="%23343a40" d="M2 0L0 2h4zm0 5L0 3h4z"/%3e%3c/svg%3e');
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1rem;
    font-size: 1rem;
    color: #495057;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    cursor: pointer;
}

.custom-select:focus {
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.custom-option {
    @apply text-gray-700 bg-white hover:bg-gray-100;
}

.custom-option:focus {
    @apply bg-blue-100;
}
</style>
