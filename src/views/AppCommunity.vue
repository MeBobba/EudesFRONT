<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row">
            <div class="w-full lg:w-2/3 lg:pr-8">
                <div v-if="error" class="text-red-500">{{ errorMessage }}</div>
                <div v-else>
                    <div v-for="post in posts" :key="post.id"
                        class="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <img :src="getAvatarUrl(post.look)"
                                    class="rounded-full border-2 border-blue-500 bg-white" alt="User Profile">
                                <div class="ml-4">
                                    <h3 class="font-semibold">{{ post.username }}</h3>
                                    <p class="text-gray-600">{{ formatDate(post.created_at) }}</p>
                                </div>
                            </div>
                            <button v-if="canDeletePost(post)" @click="deletePost(post.id)" class="text-red-500">
                                <fa-icon icon="trash-alt" />
                            </button>
                        </div>
                        <p class="mb-4">{{ post.content }}</p>
                        <img v-if="post.image" :src="post.image" alt="Post Image"
                            class="w-full h-48 object-cover rounded-lg mb-4">
                        <iframe v-if="post.video" :src="getVideoEmbedUrl(post.video)" frameborder="0" allowfullscreen
                            class="w-full h-48 mb-4"></iframe>
                        <div class="flex items-center">
                            <button @click="toggleLike(post)" class="mr-4 like-button">
                                <fa-icon :icon="['fas', 'heart']"
                                    :class="{ 'text-red-500': post.userLike, 'text-gray-500': !post.userLike }" />
                                <span class="ml-2">{{ post.likesCount }}</span>
                            </button>
                            <button @click="toggleComments(post)" class="flex items-center">
                                <fa-icon icon="comment" class="text-gray-500" />
                                <span class="ml-2">{{ post.commentsCount }}</span>
                            </button>
                        </div>
                        <transition name="slide-fade">
                            <div v-show="post.showComments" class="mt-4">
                                <h4 class="font-semibold mb-2">{{ $t('comments') }}</h4>
                                <div v-for="comment in post.comments" :key="comment.id"
                                    class="mb-2 flex justify-between">
                                    <div class="flex items-center">
                                        <img :src="getAvatarUrl(comment.look, 's')"
                                            class="rounded-full border-2 border-blue-500 p-1 bg-white"
                                            alt="User Profile">
                                        <div class="ml-2">
                                            <p class="font-semibold">{{ comment.username }}</p>
                                            <p>{{ comment.content }}</p>
                                        </div>
                                    </div>
                                    <button v-if="canDeleteComment(comment)" @click="deleteComment(comment.id)"
                                        class="text-red-500">
                                        <fa-icon icon="trash-alt" />
                                    </button>
                                </div>
                                <textarea v-model="post.newComment" placeholder="Add a comment..."
                                    class="w-full p-2 border border-gray-300 rounded-lg"></textarea>
                                <button @click="addComment(post)"
                                    class="mt-2 bg-blue-500 text-white p-2 rounded-lg">{{ $t('comment') }}</button>
                            </div>
                        </transition>
                    </div>
                </div>
                <div v-if="loading" class="text-center mt-4">
                    <span>{{ $t('loading') }}</span>
                </div>
                <div v-if="!loading && noMorePosts" class="text-center mt-4">
                    <span>{{ $t('nomoreposts') }}</span>
                </div>
            </div>
            <div class="w-full lg:w-1/3 lg:pl-8">
                <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                    class="p-4 rounded-lg shadow-md mb-8">
                    <div class="mb-4">
                        <textarea v-model="newPostContent" class="w-full p-4 border border-gray-300 rounded-lg"
                            placeholder="What's on your mind?"></textarea>
                        <div class="mt-2">
                            <input v-model="newPostVideo" type="text"
                                class="w-full p-2 border border-gray-300 rounded-lg" placeholder="Video URL">
                        </div>
                        <div class="mt-2 flex items-center">
                            <select v-model="postVisibility" class="border border-gray-300 rounded-lg p-2 mr-4">
                                <option value="public">Public</option>
                                <option value="friends">Friends</option>
                            </select>
                            <button @click="createPost" class="bg-blue-500 text-white p-2 rounded-lg">Post</button>
                        </div>
                        <div class="relative mt-2">
                            <button @click="toggleEmojiPicker" class="absolute right-0 bottom-0 p-2">
                                <fa-icon icon="smile" />
                            </button>
                            <div v-if="showEmojiPicker" class="absolute z-10 emoji-picker-container">
                                <emoji-picker @emoji-click="addEmoji"></emoji-picker>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-for="card in exampleCards" :key="card.id"
                    :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                    class="p-4 rounded-lg shadow-md mb-8">
                    <h2 class="text-2xl font-bold mb-4">{{ card.title }}</h2>
                    <p>{{ card.content }}</p>
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
import { faHeart, faComment, faTrashAlt, faSmile } from '@fortawesome/free-solid-svg-icons';
import 'emoji-picker-element';

library.add(faHeart, faComment, faTrashAlt, faSmile);

export default {
    name: 'AppCommunity',
    components: {
        AppHeader,
        AppFooter,
        'fa-icon': FontAwesomeIcon,
        EmojiPicker: 'emoji-picker'
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
            isDarkMode: false,
            posts: [],
            user: {},
            error: false,
            errorMessage: '',
            page: 1,
            limit: 10,
            loading: false,
            noMorePosts: false,
            newPostContent: '',
            newPostVideo: '',
            postVisibility: 'public',
            showEmojiPicker: false,
            exampleCards: [
                { id: 1, title: 'Example Card 1', content: 'Content goes here...' },
                { id: 2, title: 'Example Card 2', content: 'Content goes here...' }
            ]
        };
    },
    async created() {
        await this.fetchUserData();
        await this.fetchPublicPosts();
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
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
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/dashboard`, {
                    headers: { 'x-access-token': token }
                });
                this.user = response.data;
            } catch (error) {
                this.handleError(error, 'Failed to fetch user data. Please try again later.');
            }
        },
        async fetchPublicPosts() {
            if (this.loading) return;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/public-posts`, {
                    headers: { 'x-access-token': token },
                    params: { page: this.page, limit: this.limit }
                });
                if (response.data.length === 0) {
                    this.noMorePosts = true;
                } else {
                    const newPosts = response.data.filter(post => !this.posts.some(p => p.id === post.id));
                    this.posts = [...this.posts, ...newPosts];
                    this.page++;
                }
            } catch (error) {
                this.handleError(error, 'Failed to fetch posts. Please try again later.');
            } finally {
                this.loading = false;
            }
        },
        handleScroll() {
            const bottomOfWindow = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.loading && !this.noMorePosts) {
                this.fetchPublicPosts();
            }
        },
        async createPost() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/posts`, {
                    content: this.newPostContent,
                    video: this.newPostVideo,
                    visibility: this.postVisibility
                }, {
                    headers: { 'x-access-token': token }
                });

                const newPost = response.data;
                newPost.likesCount = 0;
                newPost.commentsCount = 0;
                newPost.comments = [];
                this.posts.unshift(newPost);

                this.resetPostForm();
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    alert('Please wait 15 seconds before posting again.');
                } else {
                    console.error('Error creating post:', error);
                }
            }
        },
        async addComment(post) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/comments`, {
                    postId: post.id,
                    content: post.newComment
                }, {
                    headers: { 'x-access-token': token }
                });
                const newComment = response.data;
                post.comments.push(newComment);
                post.commentsCount++;
                post.newComment = '';
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        },
        async deleteComment(commentId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.delete(`${apiUrl}/comments/${commentId}`, {
                    headers: { 'x-access-token': token }
                });
                this.removeComment(commentId);
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        },
        async deletePost(postId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.delete(`${apiUrl}/posts/${postId}`, {
                    headers: { 'x-access-token': token }
                });
                if (response.status === 200) {
                    this.posts = this.posts.filter(post => post.id !== postId);
                } else {
                    throw new Error('Failed to delete post');
                }
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post. Please try again later.');
            }
        },
        async toggleLike(post) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/likes`, {
                    postId: post.id,
                    isLike: !post.userLike
                }, {
                    headers: { 'x-access-token': token }
                });
                const data = response.data;
                post.userLike = data.userLike;
                post.likesCount = data.likesCount;
                this.animateLike(post.id);
            } catch (error) {
                console.error('Error liking post:', error);
            }
        },
        toggleComments(post) {
            post.showComments = !post.showComments;
        },
        toggleEmojiPicker() {
            this.showEmojiPicker = !this.showEmojiPicker;
        },
        addEmoji(event) {
            this.newPostContent += event.detail.unicode;
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        getVideoEmbedUrl(url) {
            const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.*?v=))([^?&]+)/);
            if (youtubeMatch) {
                return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
            }
            const vimeoMatch = url.match(/(?:vimeo\.com\/(?:.*#|.*\/videos\/|.*\/)?)([0-9]+)/);
            if (vimeoMatch) {
                return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
            }
            const dailymotionMatch = url.match(/(?:dailymotion\.com\/(?:video|hub)\/([^_]+)|dai\.ly\/([^_]+))/);
            if (dailymotionMatch) {
                return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1] || dailymotionMatch[2]}`;
            }
            return '';
        },
        getAvatarUrl(look, size = 'm') {
            return `http://www.habbo.com/habbo-imaging/avatarimage?figure=${look}&direction=3&head_direction=3&gesture=nor&action=null&size=${size}&headonly=1&img_format=gif`;
        },
        canDeletePost(post) {
            return this.user.rank >= 5 || post.user_id === this.user.id;
        },
        canDeleteComment(comment) {
            return comment.user_id === this.user.id;
        },
        handleError(error, defaultMessage) {
            this.error = true;
            this.errorMessage = error.response ? error.response.data || defaultMessage : defaultMessage;
        },
        resetPostForm() {
            this.newPostContent = '';
            this.newPostVideo = '';
            this.postVisibility = 'public';
        },
        removeComment(commentId) {
            this.posts = this.posts.map(post => {
                post.comments = post.comments.filter(c => c.id !== commentId);
                post.commentsCount = post.comments.length;
                return post;
            });
        },
        animateLike(postId) {
            const likeIcon = this.$el.querySelector(`#post-${postId} .fa-heart`);
            if (likeIcon) {
                likeIcon.classList.add('animate-like');
                setTimeout(() => {
                    likeIcon.classList.remove('animate-like');
                }, 500);
            }
        }
    }
};
</script>

<style scoped>
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

.emoji-picker-container {
    right: 0;
    bottom: 40px;
    z-index: 1000;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
}
</style>
