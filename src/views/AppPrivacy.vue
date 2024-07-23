<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h1 class="text-4xl font-bold mb-4">Privacy Policy</h1>
                <div class="prose dark:prose-dark">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ullamcorper feugiat urna, in
                        cursus risus
                        ultrices eget.</p>
                    <p>Vivamus volutpat, justo nec aliquet tristique, mi eros cursus elit, sit amet sollicitudin erat
                        metus nec
                        leo.</p>
                    <!-- Add more privacy policy content here -->
                </div>
            </div>
        </div>
        <AppFooter :logoImage="logoImage" />
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';

export default {
    components: {
        AppHeader,
        AppFooter
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
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
</style>