<template>
    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
        class="w-full p-4 bg-cover bg-center rounded-lg shadow-md relative transition-all"
        :style="{ backgroundImage: `url(${user.coverImage || backgroundImage})` }">
        <div class="absolute inset-0 bg-black opacity-50 rounded-lg transition-opacity duration-300"></div>
        <div class="relative flex flex-col sm:flex-row items-center justify-between">
            <div
                class="relative w-24 h-24 sm:w-32 sm:h-32 bg-yellow-500 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center z-10 transition-transform hover:scale-105">
                <img v-if="user && user.profileImage" :src="user.profileImage" :alt="user.username" />
                <img v-else-if="user && user.look"
                    :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${user.look}&direction=3&head_direction=3&gesture=nor&action=null&size=l&headonly=0&img_format=gif`"
                    :alt="user.username" />
                <div v-if="isCurrentUser" class="absolute top-0 right-0 flex space-x-1 z-20">
                    <label class="cursor-pointer relative z-20">
                        <input type="file" accept="image/*" @change="uploadProfileImage" class="hidden" />
                        <fa-icon :icon="['fas', 'camera']"
                            class="bg-blue-500 text-white rounded-full p-2 transition-transform hover:scale-110" />
                    </label>
                    <button v-if="user.profileImage" @click="resetProfileImage"
                        class="bg-red-500 text-white rounded-full p-2 z-20 transition-transform hover:scale-110">
                        <fa-icon :icon="['fas', 'times']" />
                    </button>
                </div>
                <div class="absolute -top-6 -right-6 bg-white text-black rounded-lg p-2 shadow-md z-9999"
                    v-if="user.motto">
                    <p class="text-xs">{{ user.motto }}</p>
                </div>
            </div>
            <div class="flex-1 mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                <h2 class="text-xl sm:text-2xl font-semibold text-white relative">{{ user.username }}</h2>
                <div
                    class="flex flex-col sm:flex-row justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                    <div class="text-center text-white relative">
                        <span class="font-bold">{{ user.credits }}</span>
                        <div class="text-gray-300">{{ $t('credits') }}</div>
                    </div>
                    <div class="text-center text-white relative">
                        <span class="font-bold">{{ user.pixels }}</span>
                        <div class="text-gray-300">{{ $t('pixels') }}</div>
                    </div>
                    <div class="text-center text-white relative">
                        <span class="font-bold">{{ user.points }}</span>
                        <div class="text-gray-300">{{ $t('points') }}</div>
                    </div>
                </div>
            </div>
            <div class="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <router-link v-if="isCurrentUser" to="/settings"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg relative text-center transition-transform hover:scale-105">{{
                        $t('settings') }}</router-link>
                <router-link v-if="isCurrentUser" to="/client"
                    class="px-4 py-2 bg-green-500 text-white rounded-lg relative text-center transition-transform hover:scale-105">{{
                        $t('play') }}</router-link>
            </div>
        </div>
        <div class="relative mt-4 text-center sm:text-left">
            <p class="text-gray-300">{{ user.motto }}</p>
        </div>
        <div class="relative grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 animate-fade-in">
            <div v-for="post in user.posts" :key="post.id" class="relative transition-transform hover:scale-105">
                <img :src="post.image" alt="EudesCMS" class="w-full h-32 sm:h-48 object-cover rounded-lg" />
                <div
                    class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <fa-icon :icon="['fas', 'heart']" class="text-white mr-2" />
                    <span class="text-white">{{ post.likes }}</span>
                </div>
            </div>
        </div>
        <div v-if="isCurrentUser" class="relative mt-4">
            <label class="cursor-pointer absolute top-0 right-0 flex space-x-1">
                <input type="file" accept="image/*" @change="uploadCoverImage" class="hidden" />
                <fa-icon :icon="['fas', 'camera']"
                    class="bg-blue-500 text-white rounded-full p-2 transition-transform hover:scale-110" />
            </label>
            <button v-if="user.coverImage" @click="resetCoverImage"
                class="absolute top-0 right-0 mt-2 bg-red-500 text-white px-2 py-1 rounded-lg transition-transform hover:scale-110">
                <fa-icon :icon="['fas', 'times']" />
            </button>
        </div>
        <AppModal v-if="showUploadModal" @close="closeModal" :disableClose="uploadInProgress"
            v-bind:title="$t('uprogress')">
            <div class="flex flex-col items-center justify-center">
                <p class="mb-4" :class="{ 'text-green-500': !uploadError, 'text-red-500': uploadError }">{{
                    uploadMessage }}</p>
                <div class="progress-bar">
                    <div class="progress-bar-fill"
                        :class="{ 'bg-blue-500': uploadInProgress, 'bg-green-500': !uploadInProgress && !uploadError, 'bg-red-500': uploadError }"
                        :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <button @click="closeModal" :disabled="uploadInProgress"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg mt-4">{{ $t('close') }}</button>
            </div>
        </AppModal>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeart, faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import backgroundImage from '@/assets/images/skeleton/topbg.webp';
import axios from 'axios';
import AWS from 'aws-sdk';
import AppModal from '../components/AppModal.vue';

library.add(faHeart, faCamera, faTimes);

export default {
    components: {
        'fa-icon': FontAwesomeIcon,
        AppModal
    },
    props: {
        isDarkMode: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            user: {},
            backgroundImage,
            isCurrentUser: false,
            showUploadModal: false,
            uploadProgress: 0,
            uploadInProgress: false,
            uploadMessage: '',
            uploadError: false,
        };
    },
    async created() {
        const userId = this.$route.params.userId || 'me';
        const currentUserId = localStorage.getItem('userId');
        this.isCurrentUser = userId === currentUserId || userId === 'me';
        await this.fetchUserProfile(userId);
    },
    methods: {
        async fetchUserProfile(userId) {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const url = userId === 'me' || !userId ? `${apiUrl}/profile/me` : `${apiUrl}/profile/${userId}`;
                const response = await axios.get(url, {
                    headers: { 'x-access-token': token }
                });
                this.user = response.data;
            } catch (error) {
                console.error(this.$t('errorfetchinguser'), error);
            }
        },
        async uploadCoverImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            this.showUploadModal = true;
            this.uploadInProgress = true;
            this.uploadMessage = this.$t('uploadcoverimage');
            this.uploadError = false;
            const fileName = `cover_${this.user.id}_${Date.now()}`;
            try {
                const s3 = new AWS.S3({
                    accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY,
                    secretAccessKey: process.env.VUE_APP_AWS_SECRET_KEY,
                    region: process.env.VUE_APP_AWS_REGION
                });
                const params = {
                    Bucket: process.env.VUE_APP_S3_BUCKET,
                    Key: fileName,
                    Body: file,
                    ACL: 'public-read',
                    ContentType: file.type
                };
                s3.upload(params).on('httpUploadProgress', (evt) => {
                    this.uploadProgress = Math.round((evt.loaded / evt.total) * 100);
                }).send(async (err, data) => {
                    if (err) {
                        console.error(this.$t('erroruploadingcover'), err);
                        this.uploadInProgress = false;
                        this.uploadMessage = `Error: ${err.message}`;
                        this.uploadError = true;
                        return;
                    }
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                    try {
                        await axios.put(`${apiUrl}/profile/me`, { coverImage: data.Location }, {
                            headers: { 'x-access-token': token }
                        });
                        this.user.coverImage = data.Location;
                        this.uploadMessage = this.$t('successcoverimage');
                    } catch (err) {
                        console.error(this.$t('errorupdatingcover'), err);
                        this.uploadMessage = `Error: ${err.message}`;
                        this.uploadError = true;
                    } finally {
                        this.uploadInProgress = false;
                    }
                });
            } catch (error) {
                console.error(this.$t('erroruploadingcover'), error);
                this.uploadInProgress = false;
                this.uploadMessage = `Error: ${error.message}`;
                this.uploadError = true;
            }
        },
        async uploadProfileImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            this.showUploadModal = true;
            this.uploadInProgress = true;
            this.uploadMessage = this.$t('uploading');
            this.uploadError = false;
            const fileName = `profile_${this.user.id}_${Date.now()}`;
            try {
                const s3 = new AWS.S3({
                    accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY,
                    secretAccessKey: process.env.VUE_APP_AWS_SECRET_KEY,
                    region: process.env.VUE_APP_AWS_REGION
                });
                const params = {
                    Bucket: process.env.VUE_APP_S3_BUCKET,
                    Key: fileName,
                    Body: file,
                    ACL: 'public-read',
                    ContentType: file.type
                };
                s3.upload(params).on('httpUploadProgress', (evt) => {
                    this.uploadProgress = Math.round((evt.loaded / evt.total) * 100);
                }).send(async (err, data) => {
                    if (err) {
                        console.error(this.$t('erroruploadingprofile'), err);
                        this.uploadInProgress = false;
                        this.uploadMessage = `Error: ${err.message}`;
                        this.uploadError = true;
                        return;
                    }
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                    try {
                        await axios.put(`${apiUrl}/profile/me`, { profileImage: data.Location }, {
                            headers: { 'x-access-token': token }
                        });
                        this.user.profileImage = data.Location;
                        this.uploadMessage = this.$t('successprofileimage');
                    } catch (err) {
                        console.error(this.$t('errorupdatingprofile'), err);
                        this.uploadMessage = `Error: ${err.message}`;
                        this.uploadError = true;
                    } finally {
                        this.uploadInProgress = false;
                    }
                });
            } catch (error) {
                console.error(this.$t('erroruploadingprofile'), error);
                this.uploadInProgress = false;
                this.uploadMessage = `Error: ${error.message}`;
                this.uploadError = true;
            }
        },
        async resetCoverImage() {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.put(`${apiUrl}/profile/me`, { coverImage: '' }, {
                    headers: { 'x-access-token': token }
                });
                this.user.coverImage = '';
            } catch (error) {
                console.error('Error resetting cover image:', error);
            }
        },
        async resetProfileImage() {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.put(`${apiUrl}/profile/me`, { profileImage: '' }, {
                    headers: { 'x-access-token': token }
                });
                this.user.profileImage = '';
            } catch (error) {
                console.error(this.$t('errorresttingprofileimage'), error);
            }
        },
        closeModal() {
            if (!this.uploadInProgress) {
                this.showUploadModal = false;
                this.uploadProgress = 0;
                this.uploadMessage = '';
                this.uploadError = false;
            }
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

.hidden {
    display: none;
}

.bg-cover {
    background-size: cover;
}

.bg-center {
    background-position: center;
}

.flex {
    display: flex;
}

.space-x-1 {
    gap: 0.25rem;
}

.z-10 {
    z-index: 10;
}

.z-20 {
    z-index: 20;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    border-radius: 0.375rem;
}

.bg-blue-500 {
    background-color: #3b82f6;
}

.bg-red-500 {
    background-color: #ef4444;
}

.bg-green-500 {
    background-color: #10b981;
}

.text-green-500 {
    color: #10b981;
}

.text-red-500 {
    color: #ef4444;
}

.transition-transform {
    transition: transform 0.3s ease-in-out;
}

.transition-opacity {
    transition: opacity 0.3s ease-in-out;
}

.transition-all {
    transition: all 0.3s ease-in-out;
}

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
</style>
