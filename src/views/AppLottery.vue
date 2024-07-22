<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <div class="banner bg-primary text-white p-16 rounded-lg shadow-lg mb-8 flex items-center justify-center"
                :style="{ backgroundImage: `url(${bannerBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
                <h1 class="text-4xl font-bold">Try Your Luck in the Lottery!</h1>
            </div>
            <div class="flex flex-wrap lg:flex-nowrap">
                <div
                    :class="['lottery-section w-full lg:w-2/3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 animate-fade-in relative', { 'opacity-50': showAlert }]">
                    <div v-if="showAlert"
                        class="alert absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black p-4 rounded-lg shadow-lg w-full max-w-xl">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-xl font-semibold">{{ alertMessage.title }}</h3>
                                <p>{{ alertMessage.body }}</p>
                            </div>
                            <button @click="closeAlert" class="text-black font-bold">&times;</button>
                        </div>
                    </div>
                    <h2 class="text-2xl font-semibold mb-4">Select Your Numbers</h2>
                    <div class="grid grid-cols-6 gap-4 mb-4" :class="{ 'blur-sm': showAlert }">
                        <button v-for="number in 49" :key="number"
                            :class="['number-button', selectedNumbers.includes(number) ? 'selected' : '', drawnNumbers.includes(number) ? 'drawn' : '']"
                            @click="toggleNumber(number)">
                            {{ number }}
                        </button>
                    </div>
                    <div class="flex justify-between mt-4">
                        <button @click="selectAuto" :disabled="points < 150" class="action-button w-1/2 mr-2">
                            Select Auto
                        </button>
                        <button @click="submitNumbers" :disabled="points < 150" class="action-button w-1/2 ml-2">
                            Submit
                        </button>
                    </div>
                </div>
                <div
                    class="prizes-section w-full lg:w-1/3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 animate-fade-in lg:ml-8 mt-8 lg:mt-0">
                    <h2 class="text-2xl font-semibold mb-4">Prizes to Win</h2>
                    <ul class="prize-list">
                        <li>5,000,000 Credits</li>
                        <li>5,000,000 Pixels</li>
                        <li>150 Points</li>
                    </ul>
                </div>
            </div>
        </div>
        <AppFooter :logoImage="logoImage" />
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import axios from 'axios';
import bannerBackground from '@/assets/images/skeleton/lottery-banner.png'; // Remplacez par l'image de votre choix

export default {
    components: {
        AppHeader,
        AppFooter
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
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
            }
        };
    },
    mounted() {
        this.fetchUserPoints();
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
                const response = await axios.get(`${apiUrl}/user/points`, {
                    headers: { 'x-access-token': token }
                });
                this.points = response.data.points;
            } catch (error) {
                console.error('Error fetching user points:', error);
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
            if (this.points < 150) {
                this.showAlertMessage('Error', 'You do not have enough points to play.');
                return;
            }
            try {
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const token = localStorage.getItem('token');
                const response = await axios.post(`${apiUrl}/lottery`, {
                    selectedNumbers: this.selectedNumbers
                }, {
                    headers: { 'x-access-token': token }
                });
                if (response.data.success) {
                    this.points -= 150; // Update points after successful submission
                    this.animateDrawnNumbers(response.data.drawnNumbers);
                    this.reward = response.data.reward;
                    if (this.reward) {
                        this.showAlertMessage('Congratulations!', `You've won ${this.reward.amount} ${this.reward.type}!`);
                    } else {
                        this.showAlertMessage('Sorry', 'You didn\'t win this time. Try again!');
                    }
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
            drawnNumbers.reduce((p, number, index) => {
                return p.then(() => animateNumber(number, index));
            }, Promise.resolve()).then(() => {
                // Show alert only after the animation is done
                if (this.reward) {
                    this.showAlertMessage('Congratulations!', `You've won ${this.reward.amount} ${this.reward.type}!`);
                } else {
                    this.showAlertMessage('Sorry', 'You didn\'t win this time. Try again!');
                }
            });
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
        }
    }
};
</script>

<style scoped>
:root {
    --primary-color: #3490dc;
    /* Bleu vif */
    --secondary-color: #ff6f61;
    /* Rouge corail */
    --background-color-light: #f5f5f5;
    /* Gris clair */
    --background-color-dark: #2c3e50;
    /* Bleu nuit */
    --text-color-light: #2c3e50;
    /* Bleu nuit */
    --text-color-dark: #ecf0f1;
    /* Blanc cassé */
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
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
    {
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
    background-image: url('@/assets/images/skeleton/lottery-banner.png');
    min-height: 300px;
    /* Augmenter la hauteur de la bannière */
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
}

.prize-list {
    list-style: none;
    padding: 0;
}

.prize-list li {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: var(--border-radius);
    transition: transform 0.3s ease, background-color 0.3s ease;
}

.prize-list li:hover {
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
</style>
