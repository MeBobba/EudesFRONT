<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :headerImage="headerImage" @toggleDarkMode="toggleDarkMode" @logout="logout" />
        <div class="container mx-auto px-4 py-8 mt-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <ul class="space-y-4">
                    <li>
                        <button @click="setTab('account')" :class="{ 'font-bold': currentTab === 'account' }"
                            class="flex items-center text-left w-full">
                            <fa-icon :icon="['fas', 'user']" class="mr-2" /> Account Settings
                        </button>
                    </li>
                    <li>
                        <button @click="setTab('privacy')" :class="{ 'font-bold': currentTab === 'privacy' }"
                            class="flex items-center text-left w-full">
                            <fa-icon :icon="['fas', 'lock']" class="mr-2" /> Privacy Settings
                        </button>
                    </li>
                    <li>
                        <button @click="setTab('security')" :class="{ 'font-bold': currentTab === 'security' }"
                            class="flex items-center text-left w-full">
                            <fa-icon :icon="['fas', 'shield-alt']" class="mr-2" /> Security Settings
                        </button>
                    </li>
                </ul>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md lg:col-span-3">
                <div v-if="currentTab === 'account'">
                    <h2 class="text-xl font-bold mb-4">Account Settings</h2>
                    <form @submit.prevent="updateAccount">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div class="mb-4">
                                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                                    for="username">Username</label>
                                <input v-model="formData.username" @blur="checkUsernameAvailability" type="text"
                                    id="username"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                <span v-if="usernameExists" class="text-red-500 text-sm">Username already taken</span>
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                                    for="real_name">Real Name</label>
                                <input v-model="formData.real_name" type="text" id="real_name"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                                    for="mail">Email</label>
                                <input v-model="formData.mail" @blur="checkEmailAvailability" type="email" id="mail"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                <span v-if="emailExists" class="text-red-500 text-sm">Email already in use</span>
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                                    for="motto">Motto</label>
                                <input v-model="formData.motto" type="text" id="motto"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                                    for="look">Look</label>
                                <input v-model="formData.look" type="text" id="look"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                                    for="gender">Gender</label>
                                <select v-model="formData.gender" id="gender"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded-lg">Save Changes</button>
                    </form>
                </div>
                <div v-if="currentTab === 'privacy'">
                    <h2 class="text-xl font-bold mb-4">Privacy Settings</h2>
                    <!-- Privacy settings form -->
                </div>
                <div v-if="currentTab === 'security'">
                    <h2 class="text-xl font-bold mb-4">Security Settings</h2>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            for="new_password">New Password</label>
                        <input v-model="formData.newPassword" type="password" id="new_password"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            for="confirm_password">Confirm New Password</label>
                        <input v-model="formData.confirmPassword" type="password" id="confirm_password"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Google
                            Authenticator</label>
                        <div v-if="!is2FAEnabled">
                            <button @click="enable2FA" class="bg-blue-500 text-white py-2 px-4 rounded-lg">Enable Google
                                Authenticator</button>
                        </div>
                        <div v-if="is2FAEnabled">
                            <button @click="disable2FA" class="bg-red-500 text-white py-2 px-4 rounded-lg">Disable
                                Google Authenticator</button>
                        </div>
                    </div>
                </div>
                <div class="mt-8">
                    <button @click="downloadData" class="bg-green-500 text-white py-2 px-4 rounded-lg">Download My
                        Data</button>
                    <button @click="deleteAccount" class="bg-red-500 text-white py-2 px-4 rounded-lg ml-4">Delete My
                        Account</button>
                </div>
            </div>
        </div>
        <div v-if="qrCodeURL" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 class="text-xl font-bold mb-4">Scan this QR code with Google Authenticator</h2>
                <img :src="qrCodeURL" alt="QR Code" />
                <div class="mt-4">
                    <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Verification
                        Code</label>
                    <input v-model="verificationToken" type="text"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    <button @click="verify2FA" class="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg">Verify</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faLock, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

library.add(faUser, faLock, faShieldAlt);

export default {
    components: {
        AppHeader,
        'fa-icon': FontAwesomeIcon
    },
    data() {
        return {
            formData: {
                username: '',
                real_name: '',
                mail: '',
                motto: '',
                look: '',
                gender: 'M',
                newPassword: '',
                confirmPassword: ''
            },
            headerImage: require('@/assets/images/skeleton/logo.gif'), // Replace with your own image
            isDarkMode: false,
            currentTab: 'account',
            usernameExists: false,
            emailExists: false,
            is2FAEnabled: false,
            qrCodeURL: '',
            verificationToken: ''
        };
    },
    methods: {
        setTab(tab) {
            this.currentTab = tab;
        },
        async updateAccount() {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/update-account`, this.formData, {
                    headers: {
                        'x-access-token': token
                    }
                });
                alert('Account updated successfully');
            } catch (error) {
                console.error('Error updating account:', error);
                alert('Failed to update account');
            }
        },
        async downloadData() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/download-data`, {
                    headers: {
                        'x-access-token': token
                    }
                });
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'my_data.json';
                link.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading data:', error);
                alert('Failed to download data');
            }
        },
        async deleteAccount() {
            if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                return;
            }
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/delete-account`, {
                    headers: {
                        'x-access-token': token
                    }
                });
                localStorage.removeItem('token');
                this.$router.push('/login');
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Failed to delete account');
            }
        },
        async checkUsernameAvailability() {
            if (this.formData.username) {
                try {
                    const response = await axios.post(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/check-username`, { username: this.formData.username });
                    this.usernameExists = response.data.exists;
                } catch (error) {
                    console.error('Error checking username:', error);
                }
            }
        },
        async checkEmailAvailability() {
            if (this.formData.mail) {
                try {
                    const response = await axios.post(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/check-email`, { email: this.formData.mail });
                    this.emailExists = response.data.exists;
                } catch (error) {
                    console.error('Error checking email:', error);
                }
            }
        },
        async enable2FA() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/enable-2fa`, {}, {
                    headers: {
                        'x-access-token': token
                    }
                });
                this.qrCodeURL = response.data.dataURL;
                this.secret = response.data.secret; // Store the secret for later use
            } catch (error) {
                console.error('Error enabling 2FA:', error);
                alert('Failed to enable 2FA');
            }
        },

        async verify2FA() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/verify-2fa`, { token: this.verificationToken }, {
                    headers: {
                        'x-access-token': token
                    }
                });
                this.is2FAEnabled = true;
                this.qrCodeURL = '';
                this.verificationToken = '';
            } catch (error) {
                console.error('Error verifying 2FA:', error);
                alert('Invalid verification code');
            }
        },
        async disable2FA() {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/disable-2fa`, {}, {
                    headers: {
                        'x-access-token': token
                    }
                });
                this.is2FAEnabled = false;
            } catch (error) {
                console.error('Error disabling 2FA:', error);
                alert('Failed to disable 2FA');
            }
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.classList.toggle('dark', this.isDarkMode);
        },
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        }
    },
    async created() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/dashboard`, {
                headers: {
                    'x-access-token': token
                }
            });
            this.formData = { ...this.formData, ...response.data };
            this.is2FAEnabled = response.data.is_2fa_enabled;
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
