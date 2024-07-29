<template>
    <div class="min-h-screen flex flex-col justify-center bg-gray-100 relative" :style="backgroundStyle">
        <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-md"></div>
        <div class="flex items-center justify-center relative z-10">
            <div
                class="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-105">
                <div class="w-full md:w-1/2 flex flex-col justify-center p-8 relative z-10">
                    <h2 class="text-3xl font-bold mb-6 text-center text-gray-800 animate-fade-in">{{
                        $t('lockscreen.title') }}
                    </h2>
                    <form @submit.prevent="unlock" class="space-y-4 relative z-20">
                        <input v-model="password" type="password" placeholder="Password" required
                            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-300 animate-input-fade">
                        <button type="submit"
                            class="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 transition duration-300 ease-in-out">
                            {{ $t('lockscreen.unlock') }}
                        </button>
                        <p v-if="errorMessage" class="text-red-500 mt-4 animate-fade-in">{{ errorMessage }}</p>
                    </form>
                </div>
                <div class="w-full md:w-1/2 relative">
                    <img src="@/assets/images/logreg/filler_ad.webp" alt="Lock Screen Image"
                        class="w-full h-full object-cover md:rounded-r-lg">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="absolute inset-0 bg-transparent"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center animate-fade-in">
                                <button :disabled="isPwaInstalled()" @click="handlePwaButtonClick"
                                    class="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-300 ease-in-out">
                                    {{ $t('downloadapp') }}
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
import backgroundImage from '@/assets/images/skeleton/lockscreen.webp';

export default {
    name: 'AppLocker',
    data() {
        return {
            password: '',
            errorMessage: ''
        };
    },
    computed: {
        backgroundStyle() {
            return {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            };
        }
    },
    methods: {
        async unlock() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/auth/unlock`, { password: this.password }, {
                    headers: { 'x-access-token': token }
                });
                if (response.data.success) {
                    localStorage.setItem('isLocked', 'false');
                    this.$router.push('/dashboard');
                } else {
                    this.errorMessage = 'Invalid password';
                }
            } catch (error) {
                console.error('Error unlocking:', error);
                this.errorMessage = 'Error unlocking. Please try again.';
            }
        },
        async checkSession() {
            const token = localStorage.getItem('token');
            if (!token) {
                this.logout();
            } else {
                try {
                    const response = await axios.get(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/auth/check-session`, {
                        headers: { 'x-access-token': token }
                    });
                    if (!response.data.valid) {
                        this.logout();
                    }
                } catch (error) {
                    console.error('Error checking session:', error);
                    this.logout();
                }
            }
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('isLocked');
            this.$router.push('/logout').then(() => {
                this.$router.push('/login');
            });
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
    beforeCreate() {
        const isLocked = localStorage.getItem('isLocked');
        if (isLocked !== 'true') {
            this.$router.push('/dashboard');
        }
    },
    created() {
        localStorage.setItem('isLocked', 'true');
        this.checkSession();
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
</style>
