<template>
    <div class="min-h-screen flex flex-col justify-between bg-gray-100" :style="backgroundStyle">
        <div class="flex items-center justify-center flex-grow relative">
            <div
                class="bg-white rounded-lg shadow-md flex flex-col md:flex-row w-full max-w-4xl overflow-hidden relative">
                <div class="w-full md:w-1/2 flex flex-col justify-center p-8 relative z-10">
                    <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
                    <form @submit.prevent="login" class="space-y-4 relative z-20">
                        <input v-model="username" type="text" placeholder="Username" required
                            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-300">
                        <input v-model="password" type="password" placeholder="Password" required
                            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-300">
                        <div v-if="is2FAEnabled" class="relative">
                            <input v-model="token2fa" type="text" placeholder="2FA Token" required
                                class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-300">
                        </div>
                        <button type="submit"
                            class="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600">Login</button>
                        <div class="mt-6 text-center">
                            <p class="text-gray-600">Don't have an account?</p>
                            <router-link to="/register" class="text-blue-500 hover:underline">Register</router-link>
                        </div>
                        <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
                    </form>
                    <div class="background-overlay"></div>
                </div>
                <div class="w-full md:w-1/2 relative">
                    <img src="@/assets/images/logreg/filler_ad.png" alt="Login Image"
                        class="w-full h-full object-cover md:rounded-r-lg cursor-pointer" @click="handlePwaButtonClick">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="absolute inset-0 bg-transparent"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center">
                                <button :disabled="isPwaInstalled()" @click="handlePwaButtonClick"
                                    class="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
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
import backgroundImage from '@/assets/images/skeleton/bg.png'; // Replace with the actual image file

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
        async check2FA() {
            try {
                const response = await axios.get('http://localhost:3000/check-2fa', {
                    params: { username: this.username }
                });
                this.is2FAEnabled = response.data.is2FAEnabled;
            } catch (error) {
                console.error('Error checking 2FA status:', error);
            }
        },
        async login() {
            try {
                const machineId = crypto.createHash('sha256').update(navigator.userAgent + Date.now().toString()).digest('hex');
                const response = await axios.post('http://localhost:3000/login', {
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
.relative {
    position: relative;
}

.absolute {
    position: absolute;
}

.z-0 {
    z-index: 0;
}

.z-10 {
    z-index: 10;
}

.z-20 {
    z-index: 20;
}

.background-overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/images/logreg/info_background_overlay.png');
    background-repeat: no-repeat;
    background-size: cover;
    z-index: 0;
    opacity: 0.75;
}

.bg-transparent {
    pointer-events: none;
}

.w-full.h-full.object-cover.md\:rounded-r-lg {
    cursor: pointer;
}
</style>