<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Article Content -->
            <div class="lg:col-span-2">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <img v-if="article.image" :src="article.image" alt="Article Image" class="w-full h-64 object-cover">
                    <div class="p-4">
                        <h1 class="text-3xl font-bold mb-2">{{ article.title }}</h1>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ formatDate(article.date) }}</p>
                        <p class="mb-4">{{ article.content }}</p>
                        <!-- Like and Comment Section -->
                        <div class="flex items-center">
                            <button @click="toggleLike(article)" class="mr-4 like-button">
                                <font-awesome-icon :icon="['fas', 'heart']"
                                    :class="{ 'text-red-500': article.userLike, 'text-gray-500': !article.userLike }" />
                                <span class="ml-2">{{ article.likesCount }}</span>
                            </button>
                            <button @click="toggleComments(article)" class="flex items-center">
                                <font-awesome-icon icon="comment" class="text-gray-500" />
                                <span class="ml-2">{{ article.commentsCount }}</span>
                            </button>
                        </div>
                        <transition name="slide-fade">
                            <div v-show="article.showComments" class="mt-4">
                                <h4 class="font-semibold mb-2">Comments</h4>
                                <div v-for="comment in article.comments" :key="comment.id"
                                    class="mb-2 flex justify-between">
                                    <div class="flex items-center">
                                        <img :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${comment.look}&direction=3&head_direction=3&gesture=nor&action=null&size=s&headonly=1&img_format=gif`"
                                            class="rounded-full border-2 border-blue-500 p-1 bg-white"
                                            alt="User Profile">
                                        <div class="ml-2">
                                            <p class="font-semibold">{{ comment.username }}</p>
                                            <p>{{ comment.content }}</p>
                                        </div>
                                    </div>
                                    <button v-if="comment.user_id === user.id" @click="deleteComment(comment.id)"
                                        class="text-red-500">
                                        <font-awesome-icon icon="trash-alt" />
                                    </button>
                                </div>
                                <textarea v-model="article.newComment" placeholder="Add a comment..."
                                    class="w-full p-2 border border-gray-300 rounded-lg"></textarea>
                                <button @click="addComment(article)"
                                    class="mt-2 bg-blue-500 text-white p-2 rounded-lg">Comment</button>
                                <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
            <!-- Sidebar with other articles -->
            <div>
                <h2 class="text-2xl font-bold mb-4">Other Articles</h2>
                <div v-for="otherArticle in otherArticles.slice(0, 10)" :key="otherArticle.id" class="mb-4">
                    <router-link :to="{ name: 'ArticleDetail', params: { id: otherArticle.id } }"
                        :class="['block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-4 hover:bg-gray-100 dark:hover:bg-gray-700', { 'active-article': otherArticle.id === article.id }]">
                        <div class="flex items-center">
                            <img v-if="otherArticle.image" :src="otherArticle.image" alt="Article Image"
                                class="w-16 h-16 object-cover rounded-lg mr-4">
                            <div>
                                <h3 class="text-xl font-semibold">{{ otherArticle.title }}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(otherArticle.date) }}
                                </p>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
        <AppFooter :logoImage="logoImage" />
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeart, faComment, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

library.add(faHeart, faComment, faTrashAlt);

export default {
    name: 'ArticleDetail',
    components: {
        AppHeader,
        AppFooter,
        'font-awesome-icon': FontAwesomeIcon
    },
    data() {
        return {
            article: {
                comments: [],
                newComment: '',
                likesCount: 0,
                commentsCount: 0,
                userLike: null,
                showComments: false,
            },
            otherArticles: [],
            isDarkMode: false,
            user: {},
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
            error: null
        };
    },
    async created() {
        await this.fetchUser();
        await this.fetchArticle();
        await this.fetchOtherArticles();
    },
    watch: {
        '$route.params.id': 'fetchArticle'
    },
    methods: {
        async fetchUser() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.get('http://localhost:3000/dashboard', {
                    headers: { 'x-access-token': token }
                });
                this.user = response.data;
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        },
        async fetchArticle() {
            const articleId = this.$route.params.id;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/articles/${articleId}`, {
                    headers: { 'x-access-token': token }
                });
                this.article = response.data;
                this.article.newComment = '';
                this.article.showComments = false;
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        },
        async fetchOtherArticles() {
            try {
                const response = await axios.get('http://localhost:3000/articles');
                this.otherArticles = response.data.filter(article => article.id !== this.$route.params.id);
            } catch (error) {
                console.error('Error fetching other articles:', error);
            }
        },
        async addComment(article) {
            if (!article.comments) {
                article.comments = [];
            }
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.post(`http://localhost:3000/articles/${article.id}/comments`, {
                    content: article.newComment
                }, {
                    headers: { 'x-access-token': token }
                });
                const newComment = response.data;
                article.comments.push(newComment);
                article.commentsCount++;
                article.newComment = '';
                this.error = null; // Reset error message
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    this.error = 'You must wait 15 seconds before commenting again.';
                } else {
                    console.error('Error adding comment:', error);
                }
            }
        },
        async deleteComment(commentId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                await axios.delete(`http://localhost:3000/article-comments/${commentId}`, {
                    headers: { 'x-access-token': token }
                });
                // Remove the comment from the article
                this.article.comments = this.article.comments.filter(comment => comment.id !== commentId);
                this.article.commentsCount--;
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        },

        async toggleLike(article) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.post(`http://localhost:3000/articles/${article.id}/likes`, {
                    isLike: !article.userLike // Toggle the like status
                }, {
                    headers: { 'x-access-token': token }
                });

                article.userLike = response.data.userLike;
                article.likesCount = response.data.likesCount;
            } catch (error) {
                console.error('Error liking article:', error);
            }
        },
        toggleComments(article) {
            article.showComments = !article.showComments;
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
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

.active-article {
    background-color: #f0f8ff;
}

.active-article .text-xl {
    color: #1e90ff;
}

.like-button .fa-heart.animate-like {
    animation: like-animation 0.5s;
}

@keyframes like-animation {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.5);
    }

    100% {
        transform: scale(1);
    }
}

.slide-fade-enter-active {
    transition: all 0.3s ease;
}

.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to

/* .slide-fade-leave-active in <2.1.8 */
    {
    transform: translateY(10px);
    opacity: 0;
}
</style>
