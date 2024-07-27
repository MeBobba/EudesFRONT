<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <h1 class="text-4xl font-bold mb-4">Staff Page</h1>
            <div class="flex">
                <div class="flex-grow">
                    <div v-for="section in staffSections" :key="section.rank_name" class="mb-8">
                        <h2 class="text-2xl font-semibold mb-4">{{ section.rank_name }}</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <div v-for="user in section.users" :key="user.id"
                                class="bg-cover bg-center rounded-lg shadow-md relative flex items-center justify-center transition-transform transform hover:scale-105"
                                :style="{ backgroundImage: `url(${user.coverImage || backgroundImage})` }">
                                <div class="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
                                <div class="relative flex flex-col items-center p-4 animate-fade-in z-10">
                                    <div class="relative">
                                        <div
                                            class="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center z-10">
                                            <img v-if="user.profileImage" :src="user.profileImage" alt="Profile" />
                                            <img v-else-if="user.look"
                                                :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${user.look}&direction=3&head_direction=3&gesture=nor&action=null&size=m&headonly=1&img_format=gif`"
                                                alt="Profile" />
                                        </div>
                                        <button v-if="canEditStaff" @click="openEditModal(user)"
                                            class="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-2 z-20">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M15.232 5.232l3.536 3.536m-2.036-4.036a2.5 2.5 0 113.536 3.536L6.5 18.5H3v-3.5L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <router-link :to="`/dashboard/${user.id}`"
                                        class="text-xl sm:text-2xl font-semibold text-white relative mt-4 z-10">
                                        {{ user.username }}
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="w-1/4 ml-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 animate-fade-in">
                    <h2 class="text-2xl font-semibold mb-4">Important Information</h2>
                    <p class="text-gray-700 dark:text-gray-300">
                        Welcome to the staff information page. Here, you will find essential details about our dedicated
                        team members, their roles, and their responsibilities. Our staff is committed to providing the
                        highest level of service and support. Stay updated with the latest news, team announcements, and
                        key updates. If you have any questions or need assistance, feel free to reach out to any of our
                        team members.
                    </p>
                </div>
            </div>
        </div>
        <div v-if="loading" class="text-center py-4 animate-fade-in">Loading...</div>
        <AppFooter :footerLogo="footerLogo" />
        <!-- Modal for editing user -->
        <AppModal v-if="showModal" @close="closeModal" title="Modifier le staff">
            <div class="space-y-4 p-4">
                <div>
                    <label for="rank" class="block text-sm font-medium text-gray-700">Rank</label>
                    <input v-model="selectedUser.rank" type="number" id="rank"
                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-300" />
                </div>
                <div>
                    <label for="mail" class="block text-sm font-medium text-gray-700">Email</label>
                    <input v-model="selectedUser.mail" type="email" id="mail"
                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-300" />
                </div>
                <div>
                    <label for="motto" class="block text-sm font-medium text-gray-700">Motto</label>
                    <input v-model="selectedUser.motto" type="text" id="motto"
                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-300" />
                </div>
                <button @click="saveChanges"
                    class="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    Enregistrer
                </button>
            </div>
        </AppModal>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import AppModal from '../components/AppModal.vue'; // Importation du composant AppModal
import axios from 'axios';
import backgroundImage from '@/assets/images/skeleton/topbg.webp';

export default {
    components: {
        AppHeader,
        AppFooter,
        AppModal // Déclaration du composant AppModal
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.webp'),
            footerLogo: require('@/assets/images/skeleton/footerlogo.png'),
            logoImage: require('@/assets/images/skeleton/logo.png'),
            isDarkMode: false,
            staffSections: [],
            rankNames: {}, // Ajouté pour stocker les noms des rangs
            backgroundImage,
            page: 1,
            limit: 20,
            loading: false,
            noMoreData: false,
            showModal: false, // Gestion de l'affichage du modal
            selectedUser: null, // Utilisateur sélectionné pour modification
            canEditStaff: false // Variable pour vérifier si l'utilisateur peut modifier le staff
        };
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
        async fetchStaffData() {
            if (this.loading || this.noMoreData) return;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/staff`, {
                    headers: { 'x-access-token': token },
                    params: { page: this.page, limit: this.limit }
                });
                if (response.data.staffSections.length) {
                    console.log("Fetched staff data: ", response.data.staffSections);
                    this.staffSections = response.data.staffSections.filter(section => section.users.some(user => user.rank >= 5));
                    this.rankNames = response.data.ranks.reduce((acc, rank) => {
                        acc[rank.level] = rank.rank_name;
                        return acc;
                    }, {});
                    console.log("Filtered sections after fetch: ", this.staffSections);
                    this.page++;
                } else {
                    this.noMoreData = true;
                }
            } catch (error) {
                console.error('Error fetching staff data:', error);
            } finally {
                this.loading = false;
            }
        },
        handleScroll() {
            const bottomOfWindow = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
            if (bottomOfWindow) {
                this.fetchStaffData();
            }
        },
        async checkUserRank() {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
            try {
                const response = await axios.get(`${apiUrl}/profile/me`, {
                    headers: { 'x-access-token': token }
                });
                this.canEditStaff = response.data.rank >= 6;
                console.log("User rank checked: ", response.data.rank);
            } catch (error) {
                console.error('Error checking user rank:', error);
            }
        },
        openEditModal(user) {
            this.selectedUser = user;
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
            this.selectedUser = null;
        },
        updateUserInSections(user) {
            // Retirer l'utilisateur des sections actuelles
            this.staffSections.forEach(section => {
                section.users = section.users.filter(u => u.id !== user.id);
            });

            // Ajouter l'utilisateur à la section appropriée s'il a un rang >= 5
            if (user.rank >= 5) {
                const rankName = this.rankNames[user.rank] || `Rank ${user.rank}`;
                let section = this.staffSections.find(s => s.rank_name === rankName);
                if (!section) {
                    section = { rank_name: rankName, users: [] };
                    this.staffSections.push(section);
                }
                section.users.push(user);
            }

            // Supprimer les sections vides
            this.staffSections = this.staffSections.filter(section => section.users.length > 0);

            // Trier les sections par rang
            this.staffSections.sort((a, b) => {
                const rankA = parseInt(a.rank_name.split(' ').pop());
                const rankB = parseInt(b.rank_name.split(' ').pop());
                return rankA - rankB;
            });

            console.log("Updated sections after user update: ", this.staffSections);
        },
        async saveChanges() {
            if (!this.selectedUser) return;
            const token = localStorage.getItem('token');
            const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
            try {
                await axios.put(`${apiUrl}/users/${this.selectedUser.id}`, this.selectedUser, {
                    headers: { 'x-access-token': token }
                });
                this.updateUserInSections(this.selectedUser);
                this.closeModal();
            } catch (error) {
                console.error('Error saving changes:', error);
            }
        },
        getRankName(rank) {
            return this.rankNames[rank] || `Rank ${rank}`;
        }
    },
    created() {
        this.fetchStaffData();
        this.checkUserRank();
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
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

.animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
}

.bg-cover {
    background-size: cover;
}

.bg-center {
    background-position: center;
}

.text-center {
    text-align: center;
}

.flex-col.items-center.p-4 {
    padding: 16px;
    text-align: center;
}

.transition-transform {
    transition: transform 0.3s ease-in-out;
}

.transform:hover {
    transform: scale(1.05);
}

button {
    z-index: 20;
    /* Ensure the button is always on top */
}
</style>
