<template>
    <div class="min-h-screen relative">
        <div class="background-overlay" :style="backgroundStyle"></div>
        <div class="relative flex items-center justify-center min-h-screen">
            <div class="max-w-4xl w-full mx-auto p-8">
                <div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row mb-8">
                    <div class="w-full md:w-1/2 flex items-center justify-center p-8">
                        <div class="text-center md:text-left">
                            <img src="../assets/images/skeleton/logo.webp" alt="Logo" class="mb-4">
                            <h1 class="text-1xl font-bold mb-4 text-gray-800">Maintenance en cours</h1>
                            <p class="text-gray-600 mb-4">Notre site est actuellement en maintenance. Merci de revenir
                                plus tard.</p>
                            <p class="text-gray-600">Si vous avez un compte avec un rang égal ou supérieur à 5, veuillez
                                vous connecter ci-dessous.</p>
                        </div>
                    </div>
                    <div class="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-200">
                        <div class="w-full">
                            <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">Connexion</h2>
                            <form @submit.prevent="login" class="space-y-4">
                                <input v-model="username" type="text" placeholder="Nom d'utilisateur" required
                                    class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-300">
                                <input v-model="password" type="password" placeholder="Mot de passe" required
                                    class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-300">
                                <button type="submit"
                                    class="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-300 ease-in-out">Connexion</button>
                                <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <div class="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                        <img :style="featureOne" class="w-32 h-32 mb-4 rounded-full border-4 border-gray-300 shadow-md">
                        <h3 class="text-xl font-bold mb-2">Feature 1</h3>
                        <p class="text-gray-600 text-center">Description of the first feature or update related to the
                            maintenance.</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                        <img :style="featureTwo" class="w-32 h-32 mb-4 rounded-full border-4 border-gray-300 shadow-md">
                        <h3 class="text-xl font-bold mb-2">Feature 2</h3>
                        <p class="text-gray-600 text-center">Description of the second feature or update related to the
                            maintenance.</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
                        <img :style="featureThree"
                            class="w-32 h-32 mb-4 rounded-full border-4 border-gray-300 shadow-md">
                        <h3 class="text-xl font-bold mb-2">Feature 3</h3>
                        <p class="text-gray-600 text-center">Description of the third feature or update related to the
                            maintenance.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import crypto from 'crypto-browserify';
import backgroundImage from '@/assets/images/maintenance/bg.webp';
import bgFeature1 from '@/assets/images/maintenance/1.webp';
import bgFeature2 from '@/assets/images/maintenance/2.webp';
import bgFeature3 from '@/assets/images/maintenance/3.webp';

export default {
    name: 'AppMaintenance',
    data() {
        return {
            username: '',
            password: '',
            errorMessage: ''
        };
    },
    computed: {
        backgroundStyle() {
            return {
                backgroundImage: `url(${backgroundImage})`,
                filter: 'brightness(0.5)',
            };
        },
        featureOne() {
            return {
                backgroundImage: `url(${bgFeature1})`,
                backgroundPosition: 'center',
            };
        },
        featureTwo() {
            return {
                backgroundImage: `url(${bgFeature2})`,
                backgroundPosition: 'center',
            };
        },
        featureThree() {
            return {
                backgroundImage: `url(${bgFeature3})`,
            };
        },
    },
    methods: {
        async login() {
            try {
                const machineId = crypto.createHash('sha256').update(navigator.userAgent + Date.now().toString()).digest('hex');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/auth/login`, {
                    username: this.username,
                    password: this.password,
                    machine_id: machineId
                });

                localStorage.setItem('token', response.data.token);
                const userResponse = await axios.get(`${apiUrl}/dashboard`, {
                    headers: { 'x-access-token': localStorage.getItem('token') }
                });
                const userRank = userResponse.data.rank;

                if (userRank >= 5) {
                    this.$router.push('/dashboard');
                } else {
                    this.errorMessage = 'Vous n\'avez pas les permissions nécessaires pour accéder au site pendant la maintenance.';
                    localStorage.removeItem('token');
                    await axios.post(`${apiUrl}/auth/logout`, {}, {
                        headers: { 'x-access-token': localStorage.getItem('token') }
                    });
                }
            } catch (error) {
                this.errorMessage = error.response ? error.response.data : 'Échec de la connexion';
            }
        }
    }
};
</script>

<style scoped>
.background-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    filter: brightness(0.1);
    z-index: -1;
}
</style>

