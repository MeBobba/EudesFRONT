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
            <div class="banner bg-primary text-white p-16 rounded-lg shadow-lg mb-8 flex items-center justify-center"
                :style="{ backgroundImage: `url(${bannerBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
                <h1 class="text-4xl font-bold">Buy Tokens</h1>
            </div>
            <div class="flex flex-wrap lg:flex-nowrap">
                <div
                    class="w-full lg:w-2/3 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 animate-fade-in relative">
                    <h2 class="text-2xl font-semibold mb-4">Choose your Token Package</h2>
                    <div class="grid grid-cols-3 gap-4">
                        <div v-for="tokenPackage in tokenPackages" :key="tokenPackage.id"
                            class="bg-white text-black p-4 rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105"
                            @click="redirectToStripe(tokenPackage.id)">
                            <h3 class="text-xl font-bold mb-2">{{ tokenPackage.name }}</h3>
                            <p class="text-lg mb-2">{{ tokenPackage.amount }} Tokens</p>
                            <p class="text-lg font-semibold">{{ tokenPackage.price }} €</p>
                        </div>
                    </div>
                </div>
                <div class="w-full lg:w-1/3 lg:ml-8 mt-8 lg:mt-0">
                    <div
                        class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 animate-fade-in">
                        <h2 class="text-2xl font-semibold mb-4">Why Buy Tokens?</h2>
                        <p>Tokens allow you to access premium features and items within our platform. Buying tokens
                            helps support our development and brings you closer to exclusive content and privileges.</p>
                    </div>
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
import bannerBackground from '@/assets/images/skeleton/tokens-banner.webp'; // Remplacez par l'image de votre choix

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
            tokenPackages: [
                { id: 1, name: 'Small Package', amount: 100, price: 5 },
                { id: 2, name: 'Medium Package', amount: 500, price: 20 },
                { id: 3, name: 'Large Package', amount: 1000, price: 35 }
            ],
            bannerBackground // Ajout de cette ligne pour définir bannerBackground dans data
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
        async redirectToStripe(packageId) {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const token = localStorage.getItem('token');
                const response = await axios.post(`${apiUrl}/payment/create-checkout-session`, { packageId }, {
                    headers: { 'x-access-token': token }
                });
                if (response.data.url) {
                    window.location.href = response.data.url;
                }
            } catch (error) {
                console.error('Error redirecting to Stripe:', error);
            }
        }
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
    background-image: url('@/assets/images/skeleton/tokens-banner.webp');
    min-height: 300px;
}

.banner:hover {
    background-color: darken(var(--primary-color), 10%);
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

.number-button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffffff30;
    color: #ffffff;
    border-radius: var(--border-radius);
    padding: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    font-size: 1.2rem;
    font-weight: bold;
}

.number-button:hover {
    background-color: #ffffff50;
    transform: translateY(-2px);
}

.number-button.selected {
    background-color: var(--secondary-color);
    color: var(--text-color-dark);
}

.number-button.drawn {
    background-color: var(--primary-color);
    color: var(--text-color-dark);
    animation: bounce 1s ease-in-out;
}

@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-30px);
    }

    60% {
        transform: translateY(-15px);
    }
}

.prizes-section {
    transition: transform 0.3s ease-in-out;
    background: linear-gradient(to right, #fbd786, #f7797d);
    color: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.prize-list-container {
    max-height: 200px;
    overflow-y: auto;
}

.prize-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.prize-item {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    transition: transform 0.3s ease, background-color 0.3s ease;
}

.prize-item:hover {
    transform: translateY(-2px);
    background-color: rgba(0, 0, 0, 0.2);
}

.prize-icon {
    margin-right: 1rem;
    font-size: 1.5rem;
}

.last-members-section {
    transition: transform 0.3s ease-in-out;
    background: linear-gradient(to right, #5f2c82, #49a09d);
    color: white;
}

.last-members-list-container {
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--background-color);
}

.last-members-list-container::-webkit-scrollbar {
    width: 8px;
}

.last-members-list-container::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 10px;
}

.last-members-list-container::-webkit-scrollbar-track {
    background-color: var(--background-color);
}

.last-members-list {
    list-style: none;
    padding: 0;
}

.last-members-list li {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: var(--border-radius);
    transition: transform 0.3s ease, background-color 0.3s ease;
    display: flex;
    align-items: center;
}

.last-members-list li:hover {
    transform: translateY(-2px);
    background-color: rgba(0, 0, 0, 0.2);
}

.action-button {
    background-color: var(--primary-color);
    color: white;
    padding: 0.75rem;
    border-radius: var(--border-radius);
    transition: background-color 0.3s ease, transform 0.3s ease;
    text-align: center;
    font-size: 1rem;
    font-weight: bold;
}

.action-button:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
}

.action-button:disabled {
    background-color: grey;
    cursor: not-allowed;
}

.alert {
    z-index: 10;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-left: 1rem;
}
</style>
