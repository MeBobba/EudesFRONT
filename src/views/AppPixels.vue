<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <nav class="bg-primary text-white p-4 rounded-lg shadow-md mb-8">
                <ul class="flex justify-around space-x-4">
                    <li><router-link to="/boutique" class="nav-link">Home</router-link></li>
                    <li><router-link to="/pixels" class="nav-link">Pixel Converter</router-link></li>
                    <li><router-link to="/lottery" class="nav-link">Lotto</router-link></li>
                    <li><router-link to="/tokens" class="nav-link">Buy Tokens</router-link></li>
                    <li><router-link to="/badges" class="nav-link">Buy Badges</router-link></li>
                    <li><router-link to="/furni" class="nav-link">Buy Furni</router-link></li>
                </ul>
            </nav>
            <div class="banner bg-primary text-white p-16 rounded-lg shadow-lg mb-8 flex items-center justify-center relative overflow-hidden"
                :style="{ backgroundImage: `url(${bannerBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
                <h1 class="text-5xl font-extrabold tracking-tight text-white">Welcome to Pixel Converter</h1>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <!-- Carte du générateur de pixels -->
                <div
                    class="pixel-generator-card bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-lg shadow-lg p-6 text-center transform transition-transform hover:scale-105">
                    <h2 class="text-3xl font-semibold mb-4">Generate Pixels</h2>
                    <p class="mb-4">If you have less than 10k pixels, you can generate 10k more pixels.</p>
                    <button @click="generatePixels" :disabled="user.pixels >= 10000"
                        :class="{ 'bg-gray-400 cursor-not-allowed': user.pixels >= 10000, 'bg-primary text-white': user.pixels < 10000 }"
                        class="py-2 px-4 rounded-lg transition duration-300">
                        Generate Pixels
                    </button>
                    <p v-if="pixelMessage" class="mt-4">{{ pixelMessage }}</p>
                </div>
                <!-- Carte du portefeuille -->
                <div
                    class="wallet-card bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-lg shadow-lg p-6 text-center transform transition-transform hover:scale-105">
                    <h2 class="text-3xl font-semibold mb-4">Your Wallet</h2>
                    <p class="mb-2"><strong>Points:</strong> {{ user.points }}</p>
                    <p class="mb-2"><strong>Credits:</strong> {{ user.credits }}</p>
                    <p class="mb-2"><strong>Pixels:</strong> {{ user.pixels }}</p>
                </div>
            </div>
        </div>
        <AppFooter :footerLogo="footerLogo" />
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import axios from 'axios';
import bannerBackground from '@/assets/images/skeleton/shop-banner.webp';

export default {
    components: {
        AppHeader,
        AppFooter
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.webp'),
            footerLogo: require('@/assets/images/skeleton/footerlogo.png'),
            logoImage: require('@/assets/images/skeleton/logo.png'),
            isDarkMode: false,
            user: {
                points: 0,
                credits: 0,
                pixels: 0
            },
            pixelMessage: '',
            bannerBackground
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
        async fetchUserData() {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/user/wallet`, {
                    headers: {
                        'x-access-token': token
                    }
                });
                this.user = response.data;
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        },
        async generatePixels() {
            if (this.user.pixels < 10000) {
                try {
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                    const response = await axios.post(`${apiUrl}/generate-pixels`, {}, {
                        headers: {
                            'x-access-token': token
                        }
                    });
                    this.user.pixels += response.data.generatedPixels;
                    this.pixelMessage = '10k pixels have been added to your account.';
                } catch (error) {
                    console.error('Error generating pixels:', error);
                }
            } else {
                this.pixelMessage = 'You have enough pixels.';
            }
        }
    },
    created() {
        this.fetchUserData();
    }
};
</script>

<style scoped>
:root {
    --primary-color: #3490dc;
    --secondary-color: #ff6f61;
    --background-color-light: #f5f5f5;
    --background-color-dark: #2c3e50;
    --text-color-light: #2c3e50;
    --text-color-dark: #ecf0f1;
    --border-radius: 10px;
    --shadow-color: rgba(0, 0, 0, 0.1);
}

body.dark {
    --background-color: var(--background-color-dark);
    --text-color: var(--text-color-dark);
}

body {
    --background-color: var(--background-color-light);
    --text-color: var(--text-color-light);
}

.animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.container {
    background-color: var(--background-color);
    color: var(--text-color);
}

.banner {
    background-color: var(--primary-color);
    color: var(--text-color-dark);
    transition: background-color 0.3s ease;
    min-height: 300px;
    position: relative;
}

.bg-primary {
    background-color: var(--primary-color);
}

.text-primary {
    color: var(--primary-color);
}

.text-secondary {
    color: var(--secondary-color);
}

.nav-link {
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    background-color: var(--primary-color);
    color: var(--text-color-dark);
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.3s ease;
    text-align: center;
}

.nav-link:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
}

nav ul {
    display: flex;
    justify-content: space-between;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 1rem;
}

nav li {
    flex: 1;
    text-align: center;
}

.overlay {
    background: rgba(0, 0, 0, 0.5);
}

.pixel-generator-card,
.wallet-card {
    transition: transform 0.3s ease;
}

.pixel-generator-card:hover,
.wallet-card:hover {
    transform: scale(1.05);
}
</style>
