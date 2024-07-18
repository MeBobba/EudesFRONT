<template>
    <header :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }" class="shadow">
        <div class="container mx-auto py-4 px-6 flex justify-between items-center">
            <router-link to="/" class="hover:text-gray-900"> <img :src="headerImage"
                    alt="Header Image"></router-link>
            <nav>
                <ul class="flex space-x-4">
                    <li><router-link to="/" class="hover:text-gray-900">Home</router-link></li>
                    <li><router-link to="/community" class="hover:text-gray-900">Community</router-link></li>
                    <li><router-link to="/staff" class="hover:text-gray-900">Staff</router-link></li>
                    <li><router-link to="/news" class="hover:text-gray-900">News</router-link></li>
                </ul>
            </nav>
            <div class="flex space-x-4">
                <button @click="toggleDarkMode" class="px-4 py-2 rounded-lg"
                    :class="{ 'bg-gray-700 text-white': isDarkMode, 'bg-gray-200 text-black': !isDarkMode }">
                    {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                </button>
                <button @click="logout" class="px-4 py-2 bg-red-500 text-white rounded-lg">Logout</button>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    props: {
        headerImage: {
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
                console.error('Logout error:', error);
                // Handle error (show message, etc.)
            }
        }
    }
}
</script>


<style scoped>
/* Ajoutez des styles personnalisés ici si nécessaire */
</style>