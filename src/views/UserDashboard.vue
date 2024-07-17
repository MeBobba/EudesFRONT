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
import AppHeader from '../components/AppHeader.vue';
import UserCard from '../components/UserCard.vue';
import ErrorMessage from '../components/ErrorMessage.vue';

export default {
    name: 'UserDashboard',
    components: {
        AppHeader,
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
        await this.fetchUserData();
        this.checkBanInterval = setInterval(this.checkIfBanned, 5000); // Vérifier toutes les 5 secondes
    },
    beforeUnmount() {
        clearInterval(this.checkBanInterval);
    },
    methods: {
        async fetchUserData() {
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
        },
        async checkIfBanned() {
            try {
                console.log('Checking if user is banned...');
                const token = localStorage.getItem('token');
                await axios.get('http://localhost:3000/check-ban', {
                    headers: { 'x-access-token': token }
                });
                console.log('User is not banned.');
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    // L'utilisateur est banni
                    console.log('User is banned.');
                    localStorage.removeItem('token');
                    this.$router.push('/login');
                } else {
                    console.error('Failed to check ban status:', error);
                }
            }
        }
    }
};
</script>

<style scoped>
/* Add Tailwind or custom styles as needed */
</style>
