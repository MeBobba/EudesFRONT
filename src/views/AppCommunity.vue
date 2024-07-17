<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :headerImage="headerImage" @toggleDarkMode="toggleDarkMode" @logout="logout" />
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-4">Community Page</h1>
            <!-- Add your content here -->
        </div>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';

export default {
    components: {
        AppHeader
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/logo.gif'), // Replace with your own image
            isDarkMode: false
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
        }
    }
}
</script>

<style scoped>
/* Add custom styles here if needed */
</style>