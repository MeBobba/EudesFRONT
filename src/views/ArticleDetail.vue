<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }"
        class="min-h-screen transition-all">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Article Content -->
            <div class="lg:col-span-2">
                <div
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                    <img v-if="article.image" :src="article.image" alt="Article Image" class="w-full h-64 object-cover">
                    <div class="p-4">
                        <h1 class="text-3xl font-bold mb-2">{{ article.title }}</h1>
                        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ formatDate(article.date) }}</p>
                        <div class="mb-4" v-html="article.content" style="word-break: break-word;"></div>
                        <!-- Like and Comment Section -->
                        <div class="flex items-center mb-4">
                            <button @click="toggleLike(article)" class="mr-4 like-button">
                                <font-awesome-icon :icon="['fas', 'heart']" :class="likeIconClass(article)" />
                                <span class="ml-2">{{ article.likesCount }}</span>
                            </button>
                            <button @click="toggleComments(article)" class="flex items-center">
                                <font-awesome-icon icon="comment" class="text-gray-500" />
                                <span class="ml-2">{{ article.commentsCount }}</span>
                            </button>
                        </div>
                        <transition name="slide-fade">
                            <div v-show="article.showComments" class="mt-4">
                                <h4 class="font-semibold mb-2">{{ $t('comments') }}</h4>
                                <div v-for="comment in article.comments.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))"
                                    :key="comment.id"
                                    :class="{ 'flex justify-end': comment.user_id === user.id, 'flex justify-start': comment.user_id !== user.id }">
                                    <div class="flex items-center relative">
                                        <div v-if="comment.user_id !== user.id" class="mr-2">
                                            <img :src="getAvatarUrl(comment.look, 's')"
                                                class="rounded-full border-2 border-blue-500 p-1 bg-white"
                                                alt="User Profile" loading="lazy">
                                        </div>
                                        <div
                                            :class="{ 'comment-bubble self-comment': comment.user_id === user.id, 'comment-bubble other-comment': comment.user_id !== user.id }">
                                            <button v-if="comment.user_id === user.id"
                                                @click="deleteComment(article.id, comment.id)"
                                                class="delete-button text-white">
                                                <font-awesome-icon :icon="['fas', 'times']" />
                                            </button>
                                            <div class="flex items-center justify-between w-full">
                                                <div>
                                                    <p class="font-semibold text-sm">{{ comment.username }}</p>
                                                    <p class="text-sm">{{ comment.content }}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="comment.user_id === user.id" class="ml-2">
                                            <img :src="getAvatarUrl(comment.look, 's')"
                                                class="rounded-full border-2 border-blue-500 p-1 bg-white"
                                                alt="User Profile" loading="lazy">
                                        </div>
                                    </div>
                                </div>
                                <textarea v-model="article.newComment" placeholder="Add a comment..."
                                    class="w-full mt-5 p-2 border border-gray-300 rounded-lg"></textarea>
                                <button @click="addComment(article)"
                                    class="mt-2 bg-blue-500 text-white p-2 rounded-lg">Comment</button>
                            </div>
                        </transition>
                        <div v-if="user.rank >= 5" class="flex space-x-2 mt-4">
                            <button @click="showEditModal(article)"
                                class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                            <button @click="deleteArticle(article.id)"
                                class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                        </div>
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
        <AppFooter :footerLogo="footerLogo" />
        <AppModal v-if="showModal" @close="closeModal" :title="modalTitle">
            <form @submit.prevent="submitForm" class="max-h-screen">
                <div class="modal-body">
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
                        <div ref="editorContainer" class="w-full p-2 border border-gray-300 rounded-lg" required></div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-200">Image URL</label>
                        <input v-model="form.image" type="text" class="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-lg">Submit</button>
                </div>
            </form>
        </AppModal>
    </div>
</template>

<script>
import axios from 'axios';
import Quill from 'quill'; // Ajoutez cette ligne
import 'quill/dist/quill.snow.css'; // Ajoutez cette ligne
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import AppModal from '../components/AppModal.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeart, faComment, faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
const moment = require('moment-timezone');

library.add(faHeart, faComment, faTrashAlt, faTimes);

export default {
    name: 'ArticleDetail',
    components: {
        AppHeader,
        AppFooter,
        AppModal,
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
            headerImage: require('@/assets/images/skeleton/header.webp'),
            footerLogo: require('@/assets/images/skeleton/footerlogo.png'),
            logoImage: require('@/assets/images/skeleton/logo.png'),
            error: null,
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
    async created() {
        await this.fetchUser();
        await this.fetchArticle();
        await this.fetchOtherArticles();
    },
    watch: {
        '$route.params.id': 'fetchArticle',
        showModal(newValue) {
            if (newValue) {
                this.$nextTick(() => {
                    this.initQuill();
                });
            }
        }
    },
    methods: {
        initQuill() {
            if (this.$refs.editorContainer) {
                this.quill = new Quill(this.$refs.editorContainer, {
                    theme: 'snow'
                });

                this.quill.on('text-change', () => {
                    this.form.content = this.quill.root.innerHTML;
                });

                if (this.form.content) {
                    this.quill.root.innerHTML = this.form.content;
                }
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
        async fetchUser() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/users/profile/me`, {
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
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/articles/${articleId}`, {
                    headers: { 'x-access-token': localStorage.getItem('token') }
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
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/articles`, {
                    headers: { 'x-access-token': token }
                });
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
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/articles/${article.id}/comments`, {
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
        async deleteComment(articleId, commentId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.delete(`${apiUrl}/articles/${articleId}/comments/${commentId}`, {
                    headers: { 'x-access-token': token }
                });
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
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/articles/${article.id}/likes`, {
                    isLike: !article.userLike
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
            if (!dateString) return ''; // handle empty date

            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const date = moment(dateString).tz(userTimeZone);

            if (!date.isValid()) {
                // handle invalid date
                return 'Invalid Date';
            }

            return date.format('YYYY-MM-DD HH:mm:ss'); // or any desired format
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
                await this.fetchArticle();
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
                this.$router.push('/');
            } catch (error) {
                console.error('Error deleting article:', error);
            }
        },
        closeModal() {
            this.showModal = false;
        },
        getAvatarUrl(look) {
            return `http://www.habbo.com/habbo-imaging/avatarimage?figure=${look}&direction=3&head_direction=3&gesture=nor&action=null&size=s&headonly=1&img_format=gif`;
        },
        likeIconClass(article) {
            return {
                'text-red-500': article.userLike,
                'text-gray-500': !article.userLike
            };
        }
    }
};
</script>

<style scoped>
@import '~quill/dist/quill.snow.css';

.article-content p {
    word-break: break-word;
    /* Ajoutez cette ligne */
}

.modal-body {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    padding-right: 1rem;
    /* pour éviter que le texte touche le bord droit */
}

.modal-footer {
    padding-top: 1rem;
    border-top: 1px solid #eaeaea;
    display: flex;
    justify-content: flex-end;
}

.modal-body::-webkit-scrollbar {
    width: 8px;
}

.modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #888;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Votre style existant */
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
.slide-fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
}

.transition-all {
    transition: all 0.3s ease;
}

.comment-bubble {
    padding: 8px 12px;
    border-radius: 18px;
    max-width: 75%;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 5px;
    display: block;
    position: relative;
    white-space: normal;
}

.self-comment {
    background-color: #007AFF;
    color: white;
    align-self: flex-end;
    text-align: right;
    margin-left: auto;
}

.other-comment {
    background-color: #E5E5EA;
    color: black;
    align-self: flex-start;
    text-align: left;
    margin-right: auto;
}

.dark .self-comment {
    background-color: #007AFF;
    color: white;
}

.dark .other-comment {
    background-color: #3A3A3C;
    color: white;
}

.comment-bubble p {
    margin: 0;
    line-height: 1.25;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal;
}

.delete-button {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #FF3B30;
    border: none;
    color: white;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s;
    padding: 0;
}

.delete-button:hover {
    background-color: #D32F2F;
}

.dark .delete-button {
    background-color: #FF3B30;
}

.dark .delete-button:hover {
    background-color: #D32F2F;
}

/* Adaptabilité responsive */
@media (max-width: 600px) {
    .comment-bubble {
        width: 100%;
        border-radius: 12px;
    }

    .delete-button {
        width: 16px;
        height: 16px;
        top: -8px;
        right: -8px;
    }

    .comment-bubble p {
        font-size: 0.75rem;
    }
}
</style>
