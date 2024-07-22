<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <div class="banner bg-primary text-white p-12 rounded-lg shadow-md mb-8 flex items-center justify-center"
                :style="{ backgroundImage: `url(${bannerBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
                <h1 class="text-4xl font-bold">Welcome to Our Boutique</h1>
            </div>
            <nav class="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-8">
                <ul class="flex justify-around space-x-4">
                    <li><router-link to="/credits" class="nav-link">Credit Converter</router-link></li>
                    <li><router-link to="/pixels" class="nav-link">Pixel Converter</router-link></li>
                    <li><router-link to="/lottery" class="nav-link">Lotto</router-link></li>
                    <li><router-link to="/tokens" class="nav-link">Buy Tokens</router-link></li>
                    <li><router-link to="/badges" class="nav-link">Buy Badges</router-link></li>
                    <li><router-link to="/furni" class="nav-link">Buy Furni</router-link></li>
                </ul>
            </nav>
            <h2 class="text-3xl font-semibold mb-6">Featured Products</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div v-for="product in products" :key="product.id"
                    class="product-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-transform transform hover:scale-105">
                    <img :src="product.image" alt="Product Image" class="w-full h-48 object-cover rounded-t-lg mb-4">
                    <div class="p-2">
                        <h3 class="text-xl font-semibold">{{ product.name }}</h3>
                        <p class="text-gray-700 dark:text-gray-300">{{ product.description }}</p>
                        <p class="text-primary font-bold mt-2">{{ formatCurrency(product.price) }}</p>
                    </div>
                </div>
            </div>
        </div>
        <AppFooter :logoImage="logoImage" />
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import axios from 'axios';
import bannerBackground from '@/assets/images/skeleton/shop-banner.png'; // Remplacez par l'image de votre choix

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
            products: [],
            bannerBackground // Ajouter cette ligne
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
        async fetchProducts() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/products`);
                this.products = response.data;
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        },
        formatCurrency(value) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        }
    },
    created() {
        this.fetchProducts();
    }
};
</script>

<style scoped>
:root {
    --primary-color: #3490dc;
    /* Bleu vif */
    --secondary-color: #ff6f61;
    /* Rouge corail */
    --background-color-light: #f5f5f5;
    /* Gris clair */
    --background-color-dark: #2c3e50;
    /* Bleu nuit */
    --text-color-light: #2c3e50;
    /* Bleu nuit */
    --text-color-dark: #ecf0f1;
    /* Blanc cassé */
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

.product-card {
    transition: transform 0.3s ease-in-out;
}

.banner {
    background-color: var(--primary-color);
    color: var(--text-color-dark);
    transition: background-color 0.3s ease;
    background-image: url('@/assets/images/skeleton/shop-banner.png');
    min-height: 300px;
    /* Augmenter la hauteur de la bannière */
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
</style>
