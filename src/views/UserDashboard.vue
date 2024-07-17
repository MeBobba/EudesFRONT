<!-- UserDashboard.vue -->
<template>
    <div class="min-h-screen bg-gray-100">
        <AppHeader :headerImage="headerImage" />
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <UserCard v-if="!isLoading && !error" :user="user" />
                    <ErrorMessage v-if="error" :message="errorMessage" />
                </div>
                <div>
                    <!-- Add here the box to write a post -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue'; // Update import to use new component name
import UserCard from '../components/UserCard.vue';
import ErrorMessage from '../components/ErrorMessage.vue';

export default {
    name: 'UserDashboard',
    components: {
        AppHeader, // Update component registration
        UserCard,
        ErrorMessage
    },
    data() {
        return {
            user: {},
            isLoading: true,
            error: false,
            errorMessage: '',
            headerImage: require('@/assets/images/skeleton/topbg.png') // Replace with your own image
        };
    },
    async created() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/dashboard', {
                headers: { 'x-access-token': token }
            });
            this.user = response.data;
            this.isLoading = false;
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            this.error = true;
            this.errorMessage = 'Failed to fetch user data. Please try again later.';
        }
    }
};
</script>

<style scoped>
/* Add Tailwind or custom styles as needed */
</style>