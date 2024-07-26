<template>
    <div class="min-h-screen flex flex-col justify-between bg-gray-100" :style="backgroundStyle">
        <div class="flex items-center justify-center flex-grow relative">
            <div
                class="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-105">
                <div class="w-full md:w-1/2 flex flex-col justify-center p-8 relative z-10">
                    <h2 class="text-3xl font-bold mb-6 text-center text-gray-800 animate-fade-in">Login</h2>
                    <form @submit.prevent="login" class="space-y-4 relative z-20">
                        <input v-model="username" type="text" placeholder="Username" required
                            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-300 animate-input-fade">
                        <input v-model="password" type="password" placeholder="Password" required
                            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-300 animate-input-fade">
                        <div v-if="is2FAEnabled" class="relative">
                            <input v-model="token2fa" type="text" placeholder="2FA Token" required
                                class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-300 animate-input-fade">
                        </div>
                        <button type="submit"
                            class="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 transition duration-300 ease-in-out">Login</button>
                        <div class="mt-6 text-center">
                            <p class="text-gray-600">Don't have an account?</p>
                            <router-link to="/register" class="text-blue-500 hover:underline">Register</router-link>
                        </div>
                        <p v-if="errorMessage" class="text-red-500 mt-4 animate-fade-in">{{ errorMessage }}</p>
                    </form>
                </div>
                <div class="w-full md:w-1/2 relative">
                    <img src="@/assets/images/logreg/filler_ad.webp" alt="Login Image"
                        class="w-full h-full object-cover md:rounded-r-lg cursor-pointer" @click="handlePwaButtonClick">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="absolute inset-0 bg-transparent"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center animate-fade-in">
                                <button :disabled="isPwaInstalled()" @click="handlePwaButtonClick"
                                    class="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-300 ease-in-out">
                                    Télécharger notre app
                                </button>
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
import crypto from 'crypto-browserify';
import backgroundImage from '@/assets/images/skeleton/bg.webp';

export default {
    name: 'UserLogin',
    data() {
        return {
            username: '',
            password: '',
            token2fa: '',
            is2FAEnabled: false,
            errorMessage: ''
        };
    },
    computed: {
        backgroundStyle() {
            return {
                backgroundImage: `url(${backgroundImage})`,
            };
        }
    },
    methods: {
        async login() {
            try {
                const machineId = crypto.createHash('sha256').update(navigator.userAgent + Date.now().toString()).digest('hex');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/auth/login`, {
                    username: this.username,
                    password: this.password,
                    token2fa: this.token2fa,
                    machine_id: machineId
                });

                localStorage.setItem('token', response.data.token);
                this.$router.push('/dashboard');
            } catch (error) {
                if (error.response && error.response.status === 403 && error.response.data === 'User is banned') {
                    this.errorMessage = 'Your account has been banned.';
                } else {
                    this.errorMessage = error.response ? error.response.data : 'Login failed';
                }
            }
        },
        async check2FA() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/check-2fa`, {
                    params: { username: this.username }
                });
                this.is2FAEnabled = response.data.is2FAEnabled;
            } catch (error) {
                console.error('Error checking 2FA status:', error);
            }
        },
        handlePwaButtonClick() {
            if (window.matchMedia('(display-mode: standalone)').matches) {
                console.log('PWA is already installed.');
            } else {
                console.log('Prompt user to install the PWA.');
            }
        },
        isPwaInstalled() {
            return window.matchMedia('(display-mode: standalone)').matches;
        }
    },
    watch: {
        username() {
            this.check2FA();
        }
    },
    beforeCreate() {
        const isAuthenticated = !!localStorage.getItem('token');
        if (isAuthenticated) {
            this.$router.push('/dashboard');
        }
    }
};
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes input-fade {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
}

.animate-input-fade {
    animation: input-fade 0.7s ease-in-out;
}

.bg-transparent {
    pointer-events: none;
}

.w-full.h-full.object-cover.md\:rounded-r-lg {
    cursor: pointer;
}
</style>
