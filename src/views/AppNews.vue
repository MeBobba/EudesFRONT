<template>
    <div :class="containerClass" class="min-h-screen transition-all">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8">
            <div class="mb-6">
                <input v-model="searchQuery" @input="filterArticles" type="text" placeholder="Search news..."
                    class="w-full p-4 border border-gray-300 rounded-lg" />
            </div>
            <div v-if="user.rank >= 5" class="mb-6">
                <button @click="showAddModal" class="bg-green-500 text-white px-4 py-2 rounded-lg">Add News</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                <div v-for="article in paginatedArticles" :key="article.id"
                    class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                    <router-link :to="{ name: 'ArticleDetail', params: { id: article.id } }" class="block">
                        <img v-if="article.image" :src="article.image" alt="Article Image"
                            class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h2 class="text-xl font-bold mb-2">{{ article.title }}</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(article.date) }}</p>
                            <p class="mt-2">{{ article.summary }}</p>
                        </div>
                    </router-link>
                    <div v-if="user.rank >= 5" class="absolute top-0 right-0 m-4 flex space-x-2">
                        <button @click="showEditModal(article)"
                            class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                        <button @click="deleteArticle(article.id)"
                            class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                    </div>
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <button @click="prevPage" :disabled="currentPage === 1"
                    class="mx-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Previous</button>
                <button @click="nextPage" :disabled="currentPage === totalPages"
                    class="mx-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Next</button>
            </div>
        </div>
        <AppFooter :footerLogo="footerLogo" />

        <AppModal v-if="showModal" @close="closeModal" :title="modalTitle">
            <form @submit.prevent="submitForm">
                <div class="mb-4">
                    <label class="block text-gray-700 dark:text-gray-200">Title</label>
                    <input v-model="form.title" type="text" class="w-full p-2 border border-gray-300 rounded-lg"
                        required />
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 dark:text-gray-200">Summary</label>
                    <textarea v-model="form.summary" class="w-full p-2 border border-gray-300 rounded-lg"
                        required></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 dark:text-gray-200">Content</label>
                    <textarea v-model="form.content" class="w-full p-2 border border-gray-300 rounded-lg"
                        required></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 dark:text-gray-200">Image URL (<router-link to="/topstories"
                            custom>
                            <template v-slot="{ href, navigate }">
                                <a :href="href" @click="navigate" target="_blank"
                                    class="hover:text-gray-900 mb-4 sm:mb-0">here</a>
                            </template>
                        </router-link>
                        )</label>
                    <input v-model="form.image" type="text" class="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Submit</button>
            </form>
        </AppModal>
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import AppModal from '../components/AppModal.vue';
const moment = require('moment-timezone');

export default {
    name: 'AppNews',
    components: {
        AppHeader,
        AppFooter,
        AppModal
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.webp'),
            footerLogo: require('@/assets/images/skeleton/footerlogo.png'),
            logoImage: require('@/assets/images/skeleton/logo.png'),
            isDarkMode: false,
            articles: [],
            filteredArticles: [],
            searchQuery: '',
            currentPage: 1,
            articlesPerPage: 6,
            user: {},
            showModal: false,
            modalTitle: '',
            form: {
                id: null,
                title: '',
                summary: '',
                content: '',
                image: ''
            }
        };
    },
    computed: {
        containerClass() {
            return {
                'bg-gray-900 text-white': this.isDarkMode,
                'bg-gray-100 text-black': !this.isDarkMode
            };
        },
        totalPages() {
            return Math.ceil(this.filteredArticles.length / this.articlesPerPage);
        },
        paginatedArticles() {
            const start = (this.currentPage - 1) * this.articlesPerPage;
            return this.filteredArticles.slice(start, start + this.articlesPerPage);
        }
    },
    async created() {
        await this.fetchUserData();
        await this.fetchArticles();
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
                if (!token) throw new Error('No token found');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/dashboard`, { headers: { 'x-access-token': token } });
                this.user = response.data;
            } catch (error) {
                console.error('Error fetching user data:', error);
                this.$router.push('/login');
            }
        },
        async fetchArticles() {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/articles`, {
                    headers: { 'x-access-token': token }
                });
                this.articles = response.data;
                this.filteredArticles = this.articles;
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        },
        filterArticles() {
            const query = this.searchQuery.toLowerCase();
            this.filteredArticles = this.articles.filter(article =>
                article.title.toLowerCase().includes(query) || article.summary.toLowerCase().includes(query)
            );
            this.currentPage = 1;
        },
        formatDate(dateString) {
            if (!dateString) return ''; // handle empty date

            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const date = moment(dateString).tz(userTimeZone);

            if (!date.isValid()) {
                // handle invalid date
                return 'Invalid Date';
            }

            return date.format('YYYY-MM-DD HH:mm:ss'); // or any desired format
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },
        showAddModal() {
            this.resetForm();
            this.modalTitle = 'Add News';
            this.showModal = true;
        },
        showEditModal(article) {
            this.form = { ...article };
            this.modalTitle = 'Edit News';
            this.showModal = true;
        },
        async submitForm() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const formData = {
                    ...this.form,
                    user_id: this.user.id // Ajoutez cet élément
                };
                if (this.form.id) {
                    await axios.put(`${apiUrl}/articles/${this.form.id}`, formData, {
                        headers: { 'x-access-token': localStorage.getItem('token') }
                    });
                } else {
                    await axios.post(`${apiUrl}/articles`, formData, {
                        headers: { 'x-access-token': localStorage.getItem('token') }
                    });
                }
                await this.fetchArticles();
                this.closeModal();
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        },
        async deleteArticle(articleId) {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.delete(`${apiUrl}/articles/${articleId}`, {
                    headers: { 'x-access-token': localStorage.getItem('token') }
                });
                this.articles = this.articles.filter(article => article.id !== articleId);
                this.filteredArticles = this.filteredArticles.filter(article => article.id !== articleId);
            } catch (error) {
                console.error('Error deleting article:', error);
            }
        },
        resetForm() {
            this.form = {
                id: null,
                title: '',
                summary: '',
                content: '',
                image: ''
            };
        },
        closeModal() {
            this.showModal = false;
        }
    }
};
</script>

<style scoped>
.container {
    padding-top: 20px;
    padding-bottom: 20px;
}

h1 {
    font-size: 2.5rem;
    font-weight: 700;
}

p {
    line-height: 1.6;
}

img {
    border-bottom: 1px solid #eaeaea;
}

.shadow-md {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:disabled {
    cursor: not-allowed;
}

.transition-all {
    transition: all 0.3s ease;
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
</style>
