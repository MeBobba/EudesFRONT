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
                <div class="flex space-x-4">
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
            isDarkMode: false
        };
    },
    methods: {
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        async logout() {
            try {
                const token = localStorage.getItem('token');
                await fetch('http://localhost:3000/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                });
                localStorage.removeItem('token');
                this.$router.push('/login');
            } catch (error) {
                console.error('Logout error:', error);
                // Handle error (show message, etc.)
            }
        }
    }
}
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
