<template>
    <footer :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
        class="shadow mt-auto">
        <div class="container mx-auto py-6 px-6 flex flex-col sm:flex-row justify-between items-center">
            <div class="flex items-center mb-4 sm:mb-0">
                <router-link to="/" class="hover:text-gray-900 flex items-center space-x-3">
                    <img width="50" :src="footerLogo" alt="MeBobba" class="footer-logo" loading="lazy">
                    <div>
                        <p>MeBobba</p>
                        <p>RELEASE24072024</p>
                    </div>
                </router-link>
            </div>
            <nav class="flex-1 text-center mb-4 sm:mb-0">
                <ul class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-8">
                    <li><router-link to="/musics" class="nav-link">{{ $t('musics') }}</router-link></li>
                    <li><router-link to="/privacy" class="nav-link">{{ $t('privacy') }}</router-link></li>
                    <li><router-link to="/terms" class="nav-link">{{ $t('terms') }}</router-link></li>
                </ul>
            </nav>
        </div>
    </footer>
</template>

<script>
export default {
    props: {
        footerLogo: {
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
