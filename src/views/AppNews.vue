<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-4">News Page</h1>
            <div class="mb-6">
                <input v-model="searchQuery" @input="filterArticles" type="text" placeholder="Search news..."
                    class="w-full p-4 border border-gray-300 rounded-lg" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="article in paginatedArticles" :key="article.id"
                    class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <router-link :to="{ name: 'ArticleDetail', params: { id: article.id } }" class="block">
                        <img v-if="article.image" :src="article.image" alt="Article Image"
                            class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h2 class="text-xl font-bold mb-2">{{ article.title }}</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(article.date) }}</p>
                            <p class="mt-2">{{ article.summary }}</p>
                        </div>
                    </router-link>
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <button @click="prevPage" :disabled="currentPage === 1"
                    class="mx-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Previous</button>
                <button @click="nextPage" :disabled="currentPage === totalPages"
                    class="mx-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Next</button>
            </div>
        </div>
        <AppFooter :logoImage="logoImage" />
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';

export default {
    name: 'AppNews',
    components: {
        AppHeader,
        AppFooter
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'), // Remplacez par votre propre image
            isDarkMode: false,
            articles: [],
            filteredArticles: [],
            searchQuery: '',
            currentPage: 1,
            articlesPerPage: 6
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.filteredArticles.length / this.articlesPerPage);
        },
        paginatedArticles() {
            const start = (this.currentPage - 1) * this.articlesPerPage;
            const end = start + this.articlesPerPage;
            return this.filteredArticles.slice(start, end);
        }
    },
    async created() {
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
        async fetchArticles() {
            try {
                const response = await axios.get('http://localhost:3000/articles'); // Remplacez par l'URL de votre API
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
            this.currentPage = 1; // Reset to the first page after filtering
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
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
</style>
