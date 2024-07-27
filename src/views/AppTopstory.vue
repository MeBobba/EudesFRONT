<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <div v-if="!isAdmin" class="text-center text-red-500">You do not have access to this page.</div>
            <div v-else>
                <div class="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h2 class="text-2xl font-semibold mb-4">How to Use This Page</h2>
                    <p class="mb-2">1. Browse through the gallery of images below.</p>
                    <p class="mb-2">2. Click on the image URL to copy it to your clipboard.</p>
                    <p class="mb-2">3. Use the pagination buttons to navigate through the gallery.</p>
                    <p class="text-red-500"><b>Note: Only administrators have access to this page.</b></p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <div v-for="image in paginatedImages" :key="image.name"
                        class="flex flex-col items-center bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                        <img :src="image.path" :alt="image.name" class="w-full h-64 object-cover" />
                        <div class="p-4">
                            <input @click="copyToClipboard(image.path)"
                                class="w-full text-center text-blue-500 bg-transparent border-none focus:outline-none cursor-pointer"
                                type="text" :value="image.path" readonly />
                        </div>
                    </div>
                </div>
                <div class="flex justify-center items-center mt-8 space-x-4">
                    <button @click="prevPage" :disabled="isFirstPage"
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105">Previous</button>
                    <span class="text-lg">{{ currentPage }} / {{ totalPages }}</span>
                    <button @click="nextPage" :disabled="isLastPage"
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105">Next</button>
                </div>
            </div>
        </div>
        <AppFooter :footerLogo="footerLogo" />
        <div v-if="showCopyNotification"
            class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Link copied to clipboard!
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';

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
            images: [],
            currentPage: 1,
            imagesPerPage: 8,
            isAdmin: false, // To be set based on user's role
            showCopyNotification: false
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.images.length / this.imagesPerPage);
        },
        paginatedImages() {
            const start = (this.currentPage - 1) * this.imagesPerPage;
            return this.images.slice(start, start + this.imagesPerPage);
        },
        isFirstPage() {
            return this.currentPage === 1;
        },
        isLastPage() {
            return this.currentPage === this.totalPages;
        }
    },
    async created() {
        await this.fetchImages();
        await this.checkAdmin();
    },
    methods: {
        async fetchImages() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/articles/topstory`, {
                    headers: this.getAuthHeaders()
                });
                this.images = response.data.map(image => ({
                    ...image,
                    path: `${apiUrl}${image.path}`
                }));
            } catch (error) {
                console.error('Error fetching images:', error);
                console.log(error.response);
            }
        },
        async checkAdmin() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/profile/me`, {
                    headers: this.getAuthHeaders()
                });
                this.isAdmin = response.data.rank >= 5;
            } catch (error) {
                console.error('Error checking admin status:', error);
            }
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        getAuthHeaders() {
            const token = localStorage.getItem('token');
            return token ? { 'x-access-token': token } : {};
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.showCopyNotification = true;
                setTimeout(() => {
                    this.showCopyNotification = false;
                }, 2000);
            });
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

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.disabled\:opacity-50 {
    opacity: 0.5;
    pointer-events: none;
}

.transition-transform {
    transition: transform 0.3s ease-in-out;
}

.transform:hover {
    transform: scale(1.05);
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}
</style>
