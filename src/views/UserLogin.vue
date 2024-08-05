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
                        <button @click="openFaceIdModal" type="button"
                            class="w-full mt-4 bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-300 ease-in-out">Login
                            with Face ID</button>
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

        <!-- Face ID Modal -->
        <Modal v-if="showFaceIdModal" @close="closeFaceIdModal" title="Login with Face ID">
            <div class="text-center">
                <p class="mb-4">Please position your face within the frame.</p>
                <div class="relative inline-block">
                    <video ref="video" class="w-full h-auto rounded-md" autoplay muted></video>
                    <div class="absolute inset-0 border-4 border-blue-500"></div> <!-- Zone de cadrage -->
                </div>
                <button @click="captureFaceId"
                    class="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">Capture
                    and Login</button>
            </div>
        </Modal>
    </div>
</template>

<script>
import axios from 'axios';
import crypto from 'crypto-browserify';
import backgroundImage from '@/assets/images/skeleton/bg.webp';
import Modal from '../components/AppModal.vue';

export default {
    name: 'UserLogin',
    components: {
        Modal
    },
    data() {
        return {
            username: '',
            password: '',
            token2fa: '',
            is2FAEnabled: false,
            errorMessage: '',
            showFaceIdModal: false
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
                    this.errorMessage = error.response ? error.response.data.message : 'Login failed';
                }
            }
        },
        openFaceIdModal() {
            this.showFaceIdModal = true;
            this.startVideo();
        },
        async captureFaceId() {
            try {
                const canvas = document.createElement('canvas');
                const video = this.$refs.video;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const image = canvas.toDataURL('image/jpeg');

                console.log('Image Base64 length:', image.length);
                console.log('Image Base64:', image.slice(0, 100)); // Log initial part of the image data for debugging

                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/auth/login-face`, { image });

                localStorage.setItem('token', response.data.token);
                this.$router.push('/dashboard');
            } catch (error) {
                console.error('Error logging in with Face ID:', error); // Log the error for more details
                this.errorMessage = error.response ? error.response.data.message : 'Face ID login failed';
            } finally {
                this.closeFaceIdModal();
            }
        },
        closeFaceIdModal() {
            this.showFaceIdModal = false;
            this.stopVideo();
        },
        async startVideo() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                this.$refs.video.srcObject = stream;
                this.$refs.video.play();
            } catch (error) {
                console.error('Error accessing camera:', error);
                alert('Failed to access camera');
            }
        },
        stopVideo() {
            const stream = this.$refs.video.srcObject;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                this.$refs.video.srcObject = null;
            }
        },
        async check2FA() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/users/check-2fa`, {
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

.relative.inline-block video {
    width: 100%;
    height: auto;
    border-radius: 10px;
}

.relative.inline-block .absolute {
    top: 50%;
    left: 50%;
    width: 60%;
    height: 60%;
    transform: translate(-50%, -50%);
    border: 4px solid blue;
    border-radius: 10px;
}
</style>