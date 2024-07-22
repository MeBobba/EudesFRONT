<template>
    <div :class="containerClass" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 mt-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <ul class="space-y-4">
                    <li v-for="tab in tabs" :key="tab.name">
                        <button @click="setTab(tab.name)" :class="{ 'font-bold': currentTab === tab.name }"
                            class="flex items-center text-left w-full hover:scale-105 transform transition-transform duration-300">
                            <fa-icon :icon="tab.icon" class="mr-2" /> {{ tab.label }}
                        </button>
                    </li>
                </ul>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md lg:col-span-3">
                <div v-if="currentTab === 'account'">
                    <h2 class="text-xl font-bold mb-4">Account Settings</h2>
                    <form @submit.prevent="updateAccount">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div v-for="field in accountFields" :key="field.id" class="mb-4">
                                <label :for="field.id"
                                    class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{{ field.label
                                    }}</label>
                                <input v-if="field.type !== 'select'" v-model="formData[field.model]" :type="field.type"
                                    :id="field.id"
                                    @blur="field.onBlur ? $options.methods[field.onBlur].call(this) : null"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                <select v-if="field.type === 'select'" v-model="formData[field.model]" :id="field.id"
                                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option v-for="option in field.options" :key="option.value" :value="option.value">{{
                                        option.label }}</option>
                                </select>
                                <span v-if="field.error && $data[field.error]" class="text-red-500 text-sm">{{
                                    field.errorMsg }}</span>
                            </div>
                        </div>
                        <button type="submit"
                            class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">Save
                            Changes</button>
                    </form>
                </div>
                <div v-if="currentTab === 'privacy'">
                    <h2 class="text-xl font-bold mb-4">Privacy Settings</h2>
                    <!-- Privacy settings form -->
                </div>
                <div v-if="currentTab === 'security'">
                    <h2 class="text-xl font-bold mb-4">Security Settings</h2>
                    <div class="mb-4">
                        <label for="new_password"
                            class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">New Password</label>
                        <input v-model="formData.newPassword" type="password" id="new_password"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div class="mb-4">
                        <label for="confirm_password"
                            class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Confirm New
                            Password</label>
                        <input v-model="formData.confirmPassword" type="password" id="confirm_password"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Google
                            Authenticator</label>
                        <div v-if="!is2FAEnabled">
                            <button @click="enable2FA"
                                class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">Enable
                                Google Authenticator</button>
                        </div>
                        <div v-if="is2FAEnabled">
                            <button @click="disable2FA"
                                class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300">Disable
                                Google Authenticator</button>
                        </div>
                    </div>
                </div>
                <div class="mt-8">
                    <button @click="downloadData"
                        class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300">Download
                        My Data</button>
                    <button @click="deleteAccount"
                        class="bg-red-500 text-white py-2 px-4 rounded-lg ml-4 hover:bg-red-700 transition-colors duration-300">Delete
                        My Account</button>
                </div>
            </div>
        </div>
        <AppFooter :logoImage="logoImage" />
        <Modal v-if="qrCodeURL" @close="closeModal" title="Scan this QR code with Google Authenticator">
            <div class="text-center">
                <img :src="qrCodeURL" alt="QR Code" class="mx-auto" />
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mt-4 mb-2">Verification
                    Code</label>
                <input v-model="verificationToken" type="text"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                <button @click="verify2FA"
                    class="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">Verify</button>
            </div>
        </Modal>
    </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import Modal from '../components/AppModal.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faLock, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

library.add(faUser, faLock, faShieldAlt);

export default {
    components: {
        AppHeader,
        AppFooter,
        Modal,
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
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
            isDarkMode: false,
            currentTab: 'account',
            usernameExists: false,
            emailExists: false,
            is2FAEnabled: false,
            qrCodeURL: '',
            verificationToken: '',
            tabs: [
                { name: 'account', label: 'Account Settings', icon: ['fas', 'user'] },
                { name: 'privacy', label: 'Privacy Settings', icon: ['fas', 'lock'] },
                { name: 'security', label: 'Security Settings', icon: ['fas', 'shield-alt'] }
            ],
            accountFields: [
                { id: 'username', model: 'username', label: 'Username', type: 'text', onBlur: 'checkUsernameAvailability', error: 'usernameExists', errorMsg: 'Username already taken' },
                { id: 'real_name', model: 'real_name', label: 'Real Name', type: 'text' },
                { id: 'mail', model: 'mail', label: 'Email', type: 'email', onBlur: 'checkEmailAvailability', error: 'emailExists', errorMsg: 'Email already in use' },
                { id: 'motto', model: 'motto', label: 'Motto', type: 'text' },
                { id: 'look', model: 'look', label: 'Look', type: 'text' },
                { id: 'gender', model: 'gender', label: 'Gender', type: 'select', options: [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }] }
            ]
        };
    },
    computed: {
        containerClass() {
            return {
                'bg-gray-900 text-white': this.isDarkMode,
                'bg-gray-100 text-black': !this.isDarkMode
            };
        }
    },
    methods: {
        setTab(tab) {
            this.currentTab = tab;
        },
        async updateAccount() {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${process.env.VUE_APP_API_URL}/update-account`, this.formData, {
                    headers: { 'x-access-token': token }
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
                const response = await axios.get(`${process.env.VUE_APP_API_URL}/download-data`, {
                    headers: { 'x-access-token': token }
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
            if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${process.env.VUE_APP_API_URL}/delete-account`, {
                    headers: { 'x-access-token': token }
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
                    const response = await axios.post(`${process.env.VUE_APP_API_URL}/check-username`, { username: this.formData.username });
                    this.usernameExists = response.data.exists;
                } catch (error) {
                    console.error('Error checking username:', error);
                }
            }
        },
        async checkEmailAvailability() {
            if (this.formData.mail) {
                try {
                    const response = await axios.post(`${process.env.VUE_APP_API_URL}/check-email`, { email: this.formData.mail });
                    this.emailExists = response.data.exists;
                } catch (error) {
                    console.error('Error checking email:', error);
                }
            }
        },
        async enable2FA() {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.post(`${process.env.VUE_APP_API_URL}/enable-2fa`, {}, {
                    headers: { 'x-access-token': token }
                });
                this.qrCodeURL = data.dataURL;
                this.secret = data.secret; // Store the secret for later use
            } catch (error) {
                console.error('Error enabling 2FA:', error);
                alert('Failed to enable 2FA');
            }
        },
        async verify2FA() {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${process.env.VUE_APP_API_URL}/verify-2fa`, { token: this.verificationToken }, {
                    headers: { 'x-access-token': token }
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
                await axios.post(`${process.env.VUE_APP_API_URL}/disable-2fa`, {}, {
                    headers: { 'x-access-token': token }
                });
                this.is2FAEnabled = false;
            } catch (error) {
                console.error('Error disabling 2FA:', error);
                alert('Failed to disable 2FA');
            }
        },
        closeModal() {
            this.qrCodeURL = '';
            this.verificationToken = '';
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
            const response = await axios.get(`${process.env.VUE_APP_API_URL}/dashboard`, {
                headers: { 'x-access-token': token }
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
button {
    transition: transform 0.2s ease-in-out;
}

button:hover {
    transform: scale(1.05);
}
</style>
