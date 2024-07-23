<template>
    <div class="min-h-screen flex flex-col justify-between bg-gray-100" :style="backgroundStyle">
        <div class="flex items-center justify-center flex-grow">
            <div
                class="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-105">
                <div class="w-full md:w-1/2">
                    <img src="@/assets/images/logreg/uk_party_frontpage_image.webp" alt="Register Image"
                        class="w-full h-full object-cover md:rounded-l-lg">
                </div>
                <div class="w-full md:w-1/2 p-8">
                    <div v-if="step === 1" class="animate-fade-in">
                        <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">Step 1: Account Information</h2>
                        <form class="space-y-4" @submit.prevent="nextStep">
                            <div class="flex items-center">
                                <input v-model="username" @input="checkUsername" type="text" placeholder="Username"
                                    required
                                    class="input-field w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-300 animate-input-fade">
                                <button type="button" @click="generateUsername"
                                    class="bg-blue-500 text-white p-3 rounded ml-2 hover:bg-blue-600 transition duration-300 ease-in-out">Generate</button>
                            </div>
                            <p v-if="usernameError" class="text-red-500 text-sm animate-fade-in">{{ usernameError }}</p>
                            <button type="submit" :disabled="!canProceedToStep2"
                                class="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600 disabled:opacity-50 transition duration-300 ease-in-out">Next</button>
                        </form>
                    </div>
                    <div v-if="step === 2" class="animate-fade-in">
                        <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">Step 2: Confidential Information
                        </h2>
                        <form class="space-y-4" @submit.prevent="nextStep">
                            <input v-model="password" type="password" placeholder="Password" required
                                class="input-field w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-300 animate-input-fade">
                            <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required
                                class="input-field w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-300 animate-input-fade">
                            <p v-if="passwordError" class="text-red-500 text-sm animate-fade-in">{{ passwordError }}</p>
                            <input v-model="mail" @input="checkEmail" type="email" placeholder="Email" required
                                class="input-field w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-300 animate-input-fade">
                            <p v-if="emailError" class="text-red-500 text-sm animate-fade-in">{{ emailError }}</p>
                            <button type="submit" :disabled="!canProceedToStep3"
                                class="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600 disabled:opacity-50 transition duration-300 ease-in-out">Next</button>
                            <button type="button" @click="previousStep"
                                class="w-full bg-gray-500 text-white p-3 rounded hover:bg-gray-600 transition duration-300 ease-in-out">Back</button>
                        </form>
                    </div>
                    <div v-if="step === 3" class="animate-fade-in">
                        <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">Step 3: Anti-Robot Verification
                        </h2>
                        <form @submit.prevent="register" class="space-y-4">
                            <label class="block">
                                {{ robotQuestion.question }}
                                <input v-model="antiRobotAnswer" type="text" placeholder="Answer" required
                                    class="input-field w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-300 animate-input-fade">
                            </label>
                            <button type="submit" :disabled="parseInt(antiRobotAnswer) !== robotQuestion.answer"
                                class="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600 disabled:opacity-50 transition duration-300 ease-in-out">Register</button>
                            <button type="button" @click="previousStep"
                                class="w-full bg-gray-500 text-white p-3 rounded hover:bg-gray-600 transition duration-300 ease-in-out">Back</button>
                            <p v-if="errorMessage" class="text-red-500 mt-4 animate-fade-in">{{ errorMessage }}</p>
                        </form>
                    </div>
                    <div class="mt-6 text-center animate-fade-in">
                        <p class="text-gray-600">Already have an account?</p>
                        <router-link to="/login" class="text-blue-500 hover:underline">Login</router-link>
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
    name: 'UserRegister',
    data() {
        return {
            step: 1,
            username: '',
            password: '',
            confirmPassword: '',
            mail: '',
            antiRobotAnswer: '',
            errorMessage: '',
            usernameError: '',
            emailError: '',
            passwordError: '',
            canProceedToStep2: false,
            canProceedToStep3: false,
            robotQuestion: {
                question: '',
                answer: null
            }
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
        async checkUsername() {
            if (this.username.length > 3) {
                try {
                    const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                    const response = await axios.post(`${apiUrl}/check-username`, { username: this.username });
                    this.usernameError = response.data.exists ? 'Username already exists' : '';
                    this.canProceedToStep2 = !response.data.exists && this.username;
                } catch (error) {
                    this.usernameError = 'Error checking username';
                }
            } else {
                this.usernameError = 'Username must be at least 4 characters long';
                this.canProceedToStep2 = false;
            }
        },
        async checkEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(this.mail)) {
                try {
                    const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                    const response = await axios.post(`${apiUrl}/check-email`, { email: this.mail });
                    this.emailError = response.data.exists ? 'Email already exists' : '';
                    this.canProceedToStep3 = !response.data.exists && this.password && this.mail && this.password === this.confirmPassword;
                } catch (error) {
                    this.emailError = 'Error checking email';
                }
            } else {
                this.emailError = 'Invalid email format';
                this.canProceedToStep3 = false;
            }
        },
        validatePasswords() {
            if (this.password !== this.confirmPassword) {
                this.passwordError = 'Passwords do not match';
                this.canProceedToStep3 = false;
            } else {
                this.passwordError = '';
                this.canProceedToStep3 = this.mail && !this.emailError;
            }
        },
        async nextStep() {
            if (this.step === 1 && this.canProceedToStep2) {
                this.step = 2;
            } else if (this.step === 2 && this.canProceedToStep3) {
                await this.getAntiRobotQuestion();
                this.step = 3;
            }
        },
        previousStep() {
            if (this.step > 1) {
                this.step--;
            }
        },
        async getAntiRobotQuestion() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/anti-robot-question`);
                this.robotQuestion = response.data;
            } catch (error) {
                this.errorMessage = 'Error fetching anti-robot question';
            }
        },
        async register() {
            try {
                const machineId = crypto.createHash('sha256').update(navigator.userAgent + Date.now().toString()).digest('hex');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/register`, {
                    username: this.username,
                    password: this.password,
                    mail: this.mail,
                    machine_id: machineId
                });
                localStorage.setItem('token', response.data.token);
                this.$router.push('/dashboard');
            } catch (error) {
                this.errorMessage = error.response ? error.response.data : 'Registration failed';
            }
        },
        generateUsername() {
            const adjectives = ['Brave', 'Clever', 'Eager', 'Mighty', 'Noble', 'Swift'];
            const nouns = ['Lion', 'Tiger', 'Falcon', 'Shark', 'Wolf', 'Bear'];
            const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
            this.username = randomAdjective + randomNoun + Math.floor(Math.random() * 100);
            this.checkUsername();
        }
    },
    watch: {
        password: 'validatePasswords',
        confirmPassword: 'validatePasswords'
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

.input-field {
    box-sizing: border-box;
    height: 2.5rem;
    padding: 0.5rem;
    font-size: 1rem;
    transition: none;
}

form .text-red-500 {
    min-height: 1.5rem;
}
</style>
