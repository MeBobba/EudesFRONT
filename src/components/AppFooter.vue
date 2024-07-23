<template>
    <footer :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
        class="shadow mt-auto">
        <div class="container mx-auto py-6 px-6 flex flex-col sm:flex-row justify-between items-center">
            <router-link to="/" class="hover:text-gray-900 mb-4 sm:mb-0">
                <img :src="logoImage" alt="EudesCMS" class="footer-logo">
            </router-link>
            <nav class="flex-1 text-center mb-4 sm:mb-0">
                <ul class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-8">
                    <li><router-link to="/musics" class="nav-link">{{ $t('musics') }}</router-link></li>
                    <li><router-link to="/privacy" class="nav-link">{{ $t('privacy') }}</router-link></li>
                    <li><router-link to="/terms" class="nav-link">{{ $t('terms') }}</router-link></li>
                </ul>
            </nav>
            <div class="flex space-x-4">
                <p>EudesCMS 0.0.1 2024</p>
            </div>
        </div>
    </footer>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

library.add(faSun, faMoon);

export default {
    props: {
        logoImage: {
            type: String,
            required: true
        }
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
                console.error(this.$t('logouterror'), error);
            }
        }
    }
};
</script>

<style scoped>
.footer-logo {
    width: 100px;
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