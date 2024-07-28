<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <nav class="bg-primary text-white p-4 rounded-lg shadow-md mb-8">
                <ul class="flex justify-around space-x-4">
                    <li><router-link to="/boutique" class="nav-link">Home</router-link></li>
                    <li><router-link to="/pixels" class="nav-link">Pixel Converter</router-link></li>
                    <li><router-link to="/lottery" class="nav-link">Lotto</router-link></li>
                    <li><router-link to="/tokens" class="nav-link">Buy Tokens</router-link></li>
                    <li><router-link to="/badges" class="nav-link">Buy Badges</router-link></li>
                    <li><router-link to="/furni" class="nav-link">Buy Furni</router-link></li>
                </ul>
            </nav>
            <div class="banner bg-primary text-white p-16 rounded-lg shadow-lg mb-8 flex items-center justify-center"
                :style="{ backgroundImage: `url(${bannerBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
                <h1 class="text-4xl font-bold">Try Your Luck in the Lottery!</h1>
            </div>
            <div class="flex flex-wrap lg:flex-nowrap">
                <div
                    :class="['lottery-section w-full lg:w-2/3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 animate-fade-in relative']">
                    <div v-if="showAlert"
                        class="alert absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black p-4 rounded-lg shadow-lg w-full max-w-xl z-50">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-xl font-semibold">{{ alertMessage.title }}</h3>
                                <p>{{ alertMessage.body }}</p>
                            </div>
                            <button @click="closeAlert" class="text-black font-bold">&times;</button>
                        </div>
                    </div>
                    <h2 class="text-2xl font-semibold mb-4 flex items-center"><span class="mr-2">🔢</span>Select Your
                        Numbers</h2>
                    <div class="grid grid-cols-6 gap-4 mb-4" :class="{ 'blur-sm': showAlert }">
                        <button v-for="number in 49" :key="number"
                            :class="['number-button', selectedNumbers.includes(number) ? 'selected' : '', drawnNumbers.includes(number) ? 'drawn' : '']"
                            @click="toggleNumber(number)" :disabled="showAlert">
                            {{ number }}
                        </button>
                    </div>
                    <div class="flex justify-between mt-4">
                        <button @click="selectAuto" :disabled="points < 150 || showAlert"
                            class="action-button w-1/2 mr-2">Select Auto</button>
                        <button @click="submitNumbers" :disabled="points < 150 || showAlert"
                            class="action-button w-1/2 ml-2">Submit</button>
                    </div>
                    <div class="mt-4">
                        <label for="betAmount" class="block text-white">Enter your bet amount (150-1000 points):</label>
                        <div class="flex items-center mt-2">
                            <input type="number" id="betAmount" v-model.number="betAmount" min="150" max="1000"
                                class="w-1/2 p-2 text-black" :disabled="showAlert || points < 150" />
                            <div class="w-1/2 ml-4">
                                <div class="relative pt-1">
                                    <div class="flex mb-2 items-center justify-between">
                                        <div>
                                            <span
                                                class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-pink-600">
                                                {{ betChance }}%
                                            </span>
                                        </div>
                                    </div>
                                    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-pink-200">
                                        <div :style="{ width: betChance + '%' }"
                                            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full lg:w-1/3 lg:ml-8 mt-8 lg:mt-0">
                    <div
                        class="prizes-section bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 animate-fade-in">
                        <h2 class="text-2xl font-semibold mb-4 flex items-center"><span class="mr-2">🎁</span>Prizes to
                            Win</h2>
                        <ul class="prize-list">
                            <li v-for="multiplier in [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100]" :key="multiplier"
                                class="prize-item">
                                <span class="prize-icon">🏆</span> Points multiplied by: {{ multiplier }}
                            </li>
                        </ul>
                    </div>
                    <div
                        class="last-members-section bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 animate-fade-in mt-8">
                        <h2 class="text-2xl font-semibold mb-4 flex items-center"><span class="mr-2">🏅</span>Last Wins
                            (<span v-if="probability !== null">{{ probability }}%</span><span v-else>Soon</span>)</h2>
                        <div class="last-members-list-container">
                            <ul class="last-members-list">
                                <li v-for="member in lastMembers" :key="member.id"
                                    class="flex items-center justify-between p-4 rounded-lg bg-black bg-opacity-20">
                                    <div class="flex items-center">
                                        <img v-if="member.profileImage" :src="member.profileImage"
                                            :alt="member.username" class="avatar" />
                                        <img v-else-if="member.look"
                                            :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${member.look}&direction=3&head_direction=3&gesture=nor&action=null&size=s&headonly=1&img_format=gif`"
                                            :alt="member.username" class="avatar" />
                                        <div class="ml-4">
                                            <div class="font-bold">{{ member.username }}</div>
                                            <div class="text-sm">Bet: {{ member.betAmount }} <br />Reward: {{
                                                member.rewardAmount }}</div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <AppFooter :footerLogo="footerLogo" />
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import axios from 'axios';
import bannerBackground from '@/assets/images/skeleton/lottery-banner.webp'; // Remplacez par l'image de votre choix

export default {
    components: {
        AppHeader,
        AppFooter
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.webp'),
            footerLogo: require('@/assets/images/skeleton/footerlogo.png'),
            logoImage: require('@/assets/images/skeleton/logo.png'),
            isDarkMode: false,
            selectedNumbers: [],
            drawnNumbers: [],
            reward: null,
            points: 0, // Initial points set to 0, will be fetched from user data
            bannerBackground, // Ajouter cette ligne
            showAlert: false,
            alertMessage: {
                title: '',
                body: ''
            },
            lastMembers: [],
            probability: null,
            currentUser: {},
            betAmount: 150, // Initial bet amount
            betChance: 15 // Initial bet chance
        };
    },
    mounted() {
        this.fetchUserPoints();
        this.fetchLastMembers();
        this.fetchCurrentUser();
    },
    watch: {
        betAmount(newValue) {
            this.updateBetChance(newValue);
        }
    },
    methods: {
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        },
        async fetchUserPoints() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiUrl}/users/points`, {
                    headers: { 'x-access-token': token }
                });
                this.points = response.data.points;
            } catch (error) {
                console.error('Error fetching user points:', error);
            }
        },
        async fetchLastMembers() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiUrl}/shop/last-members`, {
                    headers: { 'x-access-token': token }
                });
                this.lastMembers = response.data;
                this.calculateProbability();
            } catch (error) {
                console.error('Error fetching last members:', error);
            }
        },
        async fetchCurrentUser() {
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const token = localStorage.getItem('token');
                const response = await axios.get(`${apiUrl}/users/profile/me`, {
                    headers: { 'x-access-token': token }
                });
                this.currentUser = response.data;
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        },
        calculateProbability() {
            if (this.lastMembers.length < 10) {
                this.probability = null;
            } else {
                const total = this.lastMembers.length;
                const winners = this.lastMembers.filter(member => member.rewardAmount > 0).length;
                this.probability = ((winners / total) * 100).toFixed(2);
            }
        },
        toggleNumber(number) {
            if (this.selectedNumbers.includes(number)) {
                this.selectedNumbers = this.selectedNumbers.filter(n => n !== number);
            } else if (this.selectedNumbers.length < 6) {
                this.selectedNumbers.push(number);
            }
        },
        async selectAuto() {
            this.selectedNumbers = [];
            const addNumber = () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        let randomNumber;
                        do {
                            randomNumber = Math.floor(Math.random() * 49) + 1;
                        } while (this.selectedNumbers.includes(randomNumber));
                        this.selectedNumbers.push(randomNumber);
                        resolve();
                    }, 300); // 300ms delay for each number
                });
            };
            for (let i = 0; i < 6; i++) {
                await addNumber();
            }
        },
        async submitNumbers() {
            if (this.selectedNumbers.length !== 6) {
                this.showAlertMessage('Error', 'Please select exactly 6 numbers.');
                return;
            }
            if (this.points < this.betAmount) {
                this.showAlertMessage('Error', 'You do not have enough points to play.');
                return;
            }
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const token = localStorage.getItem('token');
                const response = await axios.post(`${apiUrl}/shop/lottery`, {
                    selectedNumbers: this.selectedNumbers,
                    betAmount: this.betAmount
                }, {
                    headers: { 'x-access-token': token }
                });
                if (response.data.success) {
                    this.points -= this.betAmount; // Update points after successful submission
                    this.animateDrawnNumbers(response.data.drawnNumbers).then(() => {
                        this.reward = response.data.reward;
                        const user = this.currentUser || { username: 'Unknown', profileImage: null, look: null };
                        this.addToLastMembers(user, this.betAmount, this.reward ? this.reward.amount : 0);
                        if (this.reward.amount > 0) {
                            this.showAlertMessage('Congratulations!', `You've won ${this.reward.amount} points!`);
                        } else {
                            this.showAlertMessage('Sorry', 'You didn\'t win this time. Try again!');
                        }
                    });
                } else {
                    this.showAlertMessage('Error', response.data.message);
                }
            } catch (error) {
                console.error('Error submitting numbers:', error);
                this.showAlertMessage('Error', 'There was a problem submitting your numbers. Please try again.');
            }
        },
        animateDrawnNumbers(drawnNumbers) {
            this.drawnNumbers = [];
            const animateNumber = (number, index) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        this.drawnNumbers.push(number);
                        resolve();
                    }, index * 500); // delay of 500ms for each number
                });
            };
            return drawnNumbers.reduce((p, number, index) => {
                return p.then(() => animateNumber(number, index));
            }, Promise.resolve());
        },
        addToLastMembers(user, betAmount, rewardAmount) {
            const newMember = {
                id: Date.now(),
                username: user.username,
                betAmount,
                rewardAmount,
                profileImage: user.profileImage,
                look: user.look
            };
            this.lastMembers.unshift(newMember);
            if (this.lastMembers.length > 10) {
                this.lastMembers.pop();
            }
            this.calculateProbability();
        },
        showAlertMessage(title, body) {
            this.alertMessage.title = title;
            this.alertMessage.body = body;
            this.showAlert = true;
        },
        closeAlert() {
            this.showAlert = false;
            this.selectedNumbers = [];
            this.drawnNumbers = [];
            this.reward = null;
        },
        formatProbability(probability) {
            return typeof probability === 'number' ? probability.toFixed(2) : 'N/A';
        },
        updateBetChance(betAmount) {
            this.betChance = Math.round(((betAmount - 150) / (1000 - 150)) * 70); // Facteur de chance limité à 70%
        }
    }
};
</script>

<style scoped>
:root {
    --primary-color: #3490dc;
    --secondary-color: #ff6f61;
    --background-color-light: #f5f5f5;
    --background-color-dark: #2c3e50;
    --text-color-light: #2c3e50;
    --text-color-dark: #ecf0f1;
    --border-radius: 10px;
    --shadow-color: rgba(0, 0, 0, 0.1);
}

body.dark {
    --background-color: var(--background-color-dark);
    --text-color: var(--text-color-dark);
}

body {
    --background-color: var(--background-color-light);
    --text-color: var(--text-color-light);
}

.animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.container {
    background-color: var(--background-color);
    color: var(--text-color);
}

.banner {
    background-color: var(--primary-color);
    color: var(--text-color-dark);
    transition: background-color 0.3s ease;
    background-image: url('@/assets/images/skeleton/lottery-banner.webp');
    min-height: 300px;
}

.banner:hover {
    background-color: darken(var(--primary-color), 10%);
}

.bg-primary {
    background-color: var(--primary-color);
}

.text-primary {
    color: var(--primary-color);
}

.text-secondary {
    color: var(--secondary-color);
}

.lottery-section {
    transition: transform 0.3s ease-in-out;
    background: linear-gradient(to right, #6a11cb, #2575fc);
}

.number-button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffffff30;
    color: #ffffff;
    border-radius: var(--border-radius);
    padding: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    font-size: 1.2rem;
    font-weight: bold;
}

.number-button:hover {
    background-color: #ffffff50;
    transform: translateY(-2px);
}

.number-button.selected {
    background-color: var(--secondary-color);
    color: var(--text-color-dark);
}

.number-button.drawn {
    background-color: var(--primary-color);
    color: var(--text-color-dark);
    animation: bounce 1s ease-in-out;
}

@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-30px);
    }

    60% {
        transform: translateY(-15px);
    }
}

.prizes-section {
    transition: transform 0.3s ease-in-out;
    background: linear-gradient(to right, #fbd786, #f7797d);
    color: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.prize-list-container {
    max-height: 200px;
    overflow-y: auto;
}

.prize-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.prize-item {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    transition: transform 0.3s ease, background-color 0.3s ease;
}

.prize-item:hover {
    transform: translateY(-2px);
    background-color: rgba(0, 0, 0, 0.2);
}

.prize-icon {
    margin-right: 1rem;
    font-size: 1.5rem;
}

.last-members-section {
    transition: transform 0.3s ease-in-out;
    background: linear-gradient(to right, #5f2c82, #49a09d);
    color: white;
}

.last-members-list-container {
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--background-color);
}

.last-members-list-container::-webkit-scrollbar {
    width: 8px;
}

.last-members-list-container::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 10px;
}

.last-members-list-container::-webkit-scrollbar-track {
    background-color: var(--background-color);
}

.last-members-list {
    list-style: none;
    padding: 0;
}

.last-members-list li {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: var(--border-radius);
    transition: transform 0.3s ease, background-color 0.3s ease;
    display: flex;
    align-items: center;
}

.last-members-list li:hover {
    transform: translateY(-2px);
    background-color: rgba(0, 0, 0, 0.2);
}

.action-button {
    background-color: var(--primary-color);
    color: white;
    padding: 0.75rem;
    border-radius: var(--border-radius);
    transition: background-color 0.3s ease, transform 0.3s ease;
    text-align: center;
    font-size: 1rem;
    font-weight: bold;
}

.action-button:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
}

.action-button:disabled {
    background-color: grey;
    cursor: not-allowed;
}

.alert {
    z-index: 10;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-left: 1rem;
}
</style>
