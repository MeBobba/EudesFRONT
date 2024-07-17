<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :headerImage="headerImage" @toggleDarkMode="toggleDarkMode" @logout="logout"
            :isDarkMode="isDarkMode" />
        <div class="container mx-auto px-4 py-8 mt-4">
            <UserProfile v-if="!isLoading && !error" :user="user" :isDarkMode="isDarkMode" />
            <ErrorMessage v-if="error" :message="errorMessage" />

            <div class="flex flex-col lg:flex-row mt-8">
                <!-- Left Sidebar -->
                <div class="w-full lg:w-2/3 lg:pr-8">
                    <!-- Post Input -->
                    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                        class="p-4 rounded-lg shadow-md mb-8">
                        <textarea v-model="newPost" class="w-full p-4 border border-gray-300 rounded-lg"
                            placeholder="What's on your mind?"></textarea>
                        <button @click="postTweet" class="mt-4 bg-blue-500 text-white p-2 rounded-lg">Post</button>
                    </div>

                    <!-- User Posts -->
                    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                        class="p-4 rounded-lg shadow-md">
                        <h2 class="text-2xl font-bold mb-4">Posts</h2>
                        <div class="grid grid-cols-3 gap-4">
                            <div v-for="post in user.posts" :key="post.id" class="relative">
                                <img :src="post.image" alt="Post Image" class="w-full h-48 object-cover rounded-lg">
                                <div
                                    class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <fa-icon :icon="['fas', 'heart']" class="text-white mr-2" />
                                    <span class="text-white">{{ post.likes }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div class="w-full lg:w-1/3 lg:pl-8 mt-8 lg:mt-0">
                    <!-- Suggestions -->
                    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                        class="p-4 rounded-lg shadow-md mb-8">
                        <h2 class="text-2xl font-bold mb-4">Suggestions For You</h2>
                        <div v-for="suggestion in suggestions" :key="suggestion.id" class="flex items-center mb-4">
                            <img :src="suggestion.profileImage" class="w-12 h-12 rounded-full border-2 border-gray-300"
                                alt="Suggestion Profile">
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
import { faHeart } from '@fortawesome/free-solid-svg-icons';

library.add(faHeart);

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
            newPost: '',
            headerImage: require('@/assets/images/skeleton/logo.gif'), // Replace with your own image
            suggestions: [], // Add suggestions data
            photos: [], // Add photos data
            isDarkMode: false
        };
    },
    async created() {
        await this.fetchUserData();
        this.checkBanInterval = setInterval(this.checkIfBanned, 5000);
    },
    beforeUnmount() {
        clearInterval(this.checkBanInterval);
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
        async checkIfBanned() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.get(`${apiUrl}/check-ban`, {
                    headers: { 'x-access-token': token }
                });
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    localStorage.removeItem('token');
                    this.$router.push('/login');
                } else {
                    console.error('Failed to check ban status:', error);
                }
            }
        },
        async postTweet() {
            // Implement the functionality to post a tweet
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
/* Add Tailwind or custom styles as needed */
</style>