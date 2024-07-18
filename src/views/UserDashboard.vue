<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :headerImage="headerImage" @toggleDarkMode="toggleDarkMode" @logout="logout" />
        <div class="container mx-auto px-4 py-8 mt-4">
            <UserProfile v-if="!isLoading && !error" :user="user" :isDarkMode="isDarkMode" />
            <ErrorMessage v-if="error" :message="errorMessage" />

            <div class="flex flex-col lg:flex-row mt-8">
                <!-- Left Sidebar -->
                <div class="w-full lg:w-2/3 lg:pr-8">
                    <!-- Post Input -->
                    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                        class="p-4 rounded-lg shadow-md mb-8">
                        <textarea v-model="newPostContent" class="w-full p-4 border border-gray-300 rounded-lg"
                            placeholder="What's on your mind?"></textarea>
                        <div class="mt-4 flex items-center">
                            <select v-model="postVisibility" class="border border-gray-300 rounded-lg p-2 mr-4">
                                <option value="public">Public</option>
                                <option value="friends">Friends</option>
                            </select>
                            <button @click="createPost" class="bg-blue-500 text-white p-2 rounded-lg">Post</button>
                        </div>
                    </div>

                    <!-- User Posts -->
                    <div v-for="post in posts" :key="post.id"
                        class="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <img :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${post.look}&direction=3&head_direction=3&gesture=nor&action=null&size=m&headonly=1&img_format=gif`"
                                    class="rounded-full border-2 border-blue-500 p-1 bg-white" alt="User Profile">
                                <div class="ml-4">
                                    <h3 class="font-semibold">{{ post.username }}</h3>
                                    <p class="text-gray-600">{{ formatDate(post.created_at) }}</p>
                                </div>
                            </div>
                            <button v-if="post.user_id === user.id" @click="deletePost(post.id)" class="text-red-500">
                                <fa-icon icon="trash-alt" />
                            </button>
                        </div>
                        <p class="mb-4">{{ post.content }}</p>
                        <img v-if="post.image" :src="post.image" alt="Post Image"
                            class="w-full h-48 object-cover rounded-lg mb-4">
                        <div class="flex items-center">
                            <button @click="toggleLike(post)" class="mr-4 like-button">
                                <fa-icon :icon="['fas', 'heart']"
                                    :class="{ 'text-red-500': post.userLike, 'text-gray-500': !post.userLike }" />
                                <span>{{ post.likesCount }}</span>
                            </button>
                            <button @click="toggleComments(post)" class="flex items-center">
                                <fa-icon icon="comment" class="text-gray-500" /><span class="ml-1">{{ post.commentsCount
                                    }}</span>
                            </button>
                        </div>
                        <transition name="slide-fade">
                            <div v-show="post.showComments" class="mt-4">
                                <h4 class="font-semibold mb-2">Comments</h4>
                                <div v-for="comment in post.comments" :key="comment.id"
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
                                        <fa-icon icon="trash-alt" />
                                    </button>
                                </div>
                                <textarea v-model="post.newComment" placeholder="Add a comment..."
                                    class="w-full p-2 border border-gray-300 rounded-lg"></textarea>
                                <button @click="addComment(post)"
                                    class="mt-2 bg-blue-500 text-white p-2 rounded-lg">Comment</button>
                            </div>
                        </transition>
                    </div>
                    <div v-if="loading" class="text-center mt-4">
                        <span>Loading...</span>
                    </div>
                    <div v-if="!loading && noMorePosts" class="text-center mt-4">
                        <span>No more posts</span>
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div class="w-full lg:w-1/3 lg:pl-8 mt-8 lg:mt-0">
                    <!-- Suggestions -->
                    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                        class="p-4 rounded-lg shadow-md mb-8">
                        <h2 class="text-2xl font-bold mb-4">Suggestions For You</h2>
                        <div v-for="suggestion in suggestions" :key="suggestion.id" class="flex items-center mb-4">
                            <img :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${suggestion.look}&direction=3&head_direction=3&gesture=nor&action=null&size=s&headonly=1&img_format=gif`"
                                class="w-12 h-12 rounded-full border-2 border-gray-300" alt="Suggestion Profile">
                            <div class="ml-4">
                                <h3 class="font-semibold">{{ suggestion.username }}</h3>
                                <button class="mt-1 bg-blue-500 text-white p-1 rounded-lg">Follow</button>
                            </div>
                        </div>
                    </div>

                    <!-- Photos -->
                    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                        class="p-4 rounded-lg shadow-md">
                        <h2 class="text-2xl font-bold mb-4">Photos</h2>
                        <div class="grid grid-cols-3 gap-2">
                            <div v-for="photo in photos" :key="photo.id">
                                <img :src="photo.image" alt="Photo" class="w-full h-24 object-cover rounded-lg">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import UserProfile from '../components/UserProfile.vue';
import ErrorMessage from '../components/ErrorMessage.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeart, faComment, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

library.add(faHeart, faComment, faTrashAlt);

export default {
    name: 'UserDashboard',
    components: {
        AppHeader,
        UserProfile,
        ErrorMessage,
        'fa-icon': FontAwesomeIcon
    },
    data() {
        return {
            user: {},
            isLoading: true,
            error: false,
            errorMessage: '',
            newPostContent: '',
            postVisibility: 'public',
            headerImage: require('@/assets/images/skeleton/logo.gif'), // Replace with your own image
            suggestions: [], // Add suggestions data
            photos: [], // Add photos data
            posts: [], // Add posts data
            isDarkMode: false,
            page: 1,
            limit: 10,
            loading: false,
            noMorePosts: false
        };
    },
    async created() {
        await this.fetchUserData();
        await this.fetchPosts();
        this.checkBanInterval = setInterval(this.checkIfBanned, 5000);
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        clearInterval(this.checkBanInterval);
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
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
                this.suggestions = response.data.suggestions; // Assume suggestions are part of the response
                this.photos = response.data.photos; // Assume photos are part of the response
                this.isLoading = false;
            } catch (error) {
                this.error = true;
                this.errorMessage = error.response
                    ? error.response.data || 'Failed to fetch user data. Please try again later.'
                    : 'Failed to fetch user data. Please check your network connection.';
                this.isLoading = false;
            }
        },
        async fetchPosts() {
            if (this.loading) return;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/posts`, {
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
                this.loading = false;
            } catch (error) {
                this.error = true;
                this.errorMessage = error.response
                    ? error.response.data || 'Failed to fetch posts. Please try again later.'
                    : 'Failed to fetch posts. Please check your network connection.';
                this.loading = false;
            }
        },
        handleScroll() {
            const bottomOfWindow = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.loading && !this.noMorePosts) {
                this.fetchPosts();
            }
        },
        async createPost() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.post(`${apiUrl}/posts`, {
                    content: this.newPostContent,
                    visibility: this.postVisibility
                }, {
                    headers: { 'x-access-token': token }
                });
                this.newPostContent = '';
                this.postVisibility = 'public';
                this.page = 1;
                this.posts = [];
                this.noMorePosts = false;
                await this.fetchPosts();
            } catch (error) {
                console.error('Error creating post:', error);
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
                // Remove the comment from the post
                this.posts = this.posts.map(post => {
                    post.comments = post.comments.filter(comment => comment.id !== commentId);
                    return post;
                });
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
                await axios.delete(`${apiUrl}/posts/${postId}`, {
                    headers: { 'x-access-token': token }
                });
                // Remove the post from the list
                this.posts = this.posts.filter(post => post.id !== postId);
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        },
        async toggleLike(post) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.post(`${apiUrl}/likes`, {
                    postId: post.id,
                    isLike: post.userLike !== true
                }, {
                    headers: { 'x-access-token': token }
                });
                post.userLike = post.userLike !== true ? true : null;
                post.likesCount += post.userLike ? 1 : -1;
                const likeIcon = this.$el.querySelector(`#post-${post.id} .fa-heart`);
                if (likeIcon) {
                    likeIcon.classList.add('animate-like');
                    setTimeout(() => {
                        likeIcon.classList.remove('animate-like');
                    }, 500);
                }
            } catch (error) {
                console.error('Error liking post:', error);
            }
        },
        toggleComments(post) {
            post.showComments = !post.showComments;
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
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
