<template>
    <!-- Cover Image -->
    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
        class="w-full p-4 bg-cover bg-center rounded-lg shadow-md relative transition-all cover-image-container"
        :style="{ backgroundImage: `url(${user.coverImage || backgroundImage})`, filter: user.coverImageBlurred ? 'blur(10px)' : 'none' }"
        @mouseover="isCoverHovered = true" @mouseleave="isCoverHovered = false">
        <div v-if="user.coverImageBlurred"
            class="absolute inset-0 bg-black opacity-50 rounded-lg transition-opacity duration-300"></div>
        <div v-if="isCurrentUser && isCoverHovered"
            class="absolute inset-0 flex rounded-lg overflow-hidden cover-hover-overlay">
            <div v-if="!user.coverImage" @click="triggerCoverImageUpload"
                class="w-full flex items-center justify-center rounded-lg">
                <div class="absolute inset-0 bg-blue-500 bg-opacity-50"></div>
                <fa-icon :icon="['fas', 'plus']" class="text-white text-2xl z-10" />
            </div>
            <div v-else class="flex w-full h-full">
                <div class="relative w-1/2 flex items-center justify-center rounded-l-lg"
                    @click="triggerCoverImageUpload">
                    <div class="absolute inset-0 bg-blue-500 bg-opacity-50"></div>
                    <fa-icon :icon="['fas', 'plus']" class="text-white text-2xl z-10" />
                </div>
                <div class="relative w-1/2 flex items-center justify-center rounded-r-lg" @click="deleteCoverImage">
                    <div class="absolute inset-0 bg-red-500 bg-opacity-50"></div>
                    <fa-icon :icon="['fas', 'trash']" class="text-white text-2xl z-10" />
                </div>
            </div>
        </div>
        <div v-if="uploadInProgressCover"
            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div class="progress-bar-cover">
                <div class="progress-bar-fill" :style="{ width: uploadProgressCover + '%' }"></div>
            </div>
        </div>
        <div class="relative flex flex-col sm:flex-row items-center justify-between">
            <!-- Profile Image -->
            <div :class="{ 'blur-sm': user.profileImageBlurred }"
                class="relative w-24 h-24 sm:w-32 sm:h-32 bg-yellow-500 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center z-10 transition-transform hover:scale-105 profile-image-container"
                @mouseover="isProfileHovered = true" @mouseleave="isProfileHovered = false">
                <img v-if="user.profileImage" :src="user.profileImage" :alt="user.username"
                    class="object-cover w-full h-full" />
                <img v-else-if="user.look"
                    :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${user.look}&direction=3&head_direction=3&gesture=nor&action=null&size=l&headonly=0&img_format=gif`"
                    :alt="user.username" class="object-cover w-full h-full" />
                <div v-if="isCurrentUser && isProfileHovered"
                    class="absolute inset-0 flex rounded-full overflow-hidden profile-hover-overlay">
                    <div class="absolute inset-0 bg-blue-500 bg-opacity-50 rounded-full"></div>
                    <div v-if="!user.profileImage" @click="triggerProfileImageUpload"
                        class="w-full flex items-center justify-center">
                        <fa-icon :icon="['fas', 'plus']" class="text-white text-xl z-10" />
                    </div>
                    <div v-else class="flex w-full h-full">
                        <div class="relative w-1/2 flex items-center justify-center" @click="triggerProfileImageUpload">
                            <div class="absolute inset-0 bg-blue-500 bg-opacity-50 rounded-full"></div>
                            <fa-icon :icon="['fas', 'plus']" class="text-white text-xl z-10" />
                        </div>
                        <div class="relative w-1/2 flex items-center justify-center" @click="deleteProfileImage">
                            <div class="absolute inset-0 bg-red-500 bg-opacity-50 rounded-full"></div>
                            <fa-icon :icon="['fas', 'trash']" class="text-white text-xl z-10" />
                        </div>
                    </div>
                </div>
                <input type="file" accept="image/*" @change="uploadProfileImage" ref="profileImageInput"
                    class="hidden" />
                <div v-if="uploadInProgressProfile"
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div class="progress-bar-profile">
                        <div class="progress-bar-fill" :style="{ width: uploadProgressProfile + '%' }"></div>
                    </div>
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
        </div>
        <div class="relative mt-4 text-center sm:text-left">
            <p class="text-gray-300">{{ user.motto }}</p>
        </div>
        <div class="relative grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 animate-fade-in">
            <div v-for="post in user.posts" :key="post.id" class="relative transition-transform hover:scale-105">
                <img :src="post.image" alt="MeBobba" class="w-full h-32 sm:h-48 object-cover rounded-lg" />
                <div
                    class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <fa-icon :icon="['fas', 'heart']" class="text-white mr-2" />
                    <span class="text-white">{{ post.likes }}</span>
                </div>
            </div>
        </div>
        <input type="file" accept="image/*" @change="uploadCoverImage" ref="coverImageInput" class="hidden" />
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeart, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import backgroundImage from '@/assets/images/skeleton/topbg.webp';
import axios from 'axios';

// Ajouter les icônes à la bibliothèque
library.add(faHeart, faPlus, faTrash);

export default {
    components: {
        'fa-icon': FontAwesomeIcon,
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
            isProfileHovered: false,
            isCoverHovered: false,
            uploadInProgressProfile: false,
            uploadProgressProfile: 0,
            uploadInProgressCover: false,
            uploadProgressCover: 0,
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
                const url = userId === 'me' || !userId ? `${apiUrl}/users/profile/me` : `${apiUrl}/users/profile/${userId}`;
                const response = await axios.get(url, {
                    headers: { 'x-access-token': token }
                });
                this.user = response.data;
                this.user.profileImage = this.user.profile_image || null;
                this.user.coverImage = this.user.cover_image || null;
                this.user.profileImageBlurred = this.user.profile_image_blurred || false;
                this.user.coverImageBlurred = this.user.cover_image_blurred || false;
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        },
        async uploadCoverImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('coverImage', file);
            try {
                this.uploadInProgressCover = true;
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.put(`${apiUrl}/users/profile/me/cover`, formData, {
                    headers: { 'x-access-token': token, 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: progressEvent => {
                        this.uploadProgressCover = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    }
                });
                console.log('Cover image response:', response.data);
                this.user.coverImage = response.data.coverImage;
                this.user.coverImageBlurred = response.data.coverImageBlurred;
                this.uploadInProgressCover = false;
            } catch (error) {
                console.error('Error uploading cover image:', error);
                this.uploadInProgressCover = false;
            }
        },
        async uploadProfileImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('profileImage', file);
            try {
                this.uploadInProgressProfile = true;
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.put(`${apiUrl}/users/profile/me/profile`, formData, {
                    headers: { 'x-access-token': token, 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: progressEvent => {
                        this.uploadProgressProfile = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    }
                });
                console.log('Profile image response:', response.data);
                this.user.profileImage = response.data.profileImage;
                this.user.profileImageBlurred = response.data.profileImageBlurred;
                this.uploadInProgressProfile = false;
            } catch (error) {
                console.error('Error uploading profile image:', error);
                this.uploadInProgressProfile = false;
            }
        },
        async deleteCoverImage() {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.delete(`${apiUrl}/users/profile/me/cover`, {
                    headers: { 'x-access-token': token }
                });
                console.log('Delete cover image response:', response.data);
                this.user.coverImage = null;
                this.user.coverImageBlurred = false;
            } catch (error) {
                console.error('Error deleting cover image:', error);
            }
        },
        async deleteProfileImage() {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.delete(`${apiUrl}/users/profile/me/profile`, {
                    headers: { 'x-access-token': token }
                });
                console.log('Delete profile image response:', response.data);
                this.user.profileImage = null;
                this.user.profileImageBlurred = false;
            } catch (error) {
                console.error('Error deleting profile image:', error);
            }
        },
        triggerProfileImageUpload() {
            this.$refs.profileImageInput.click();
        },
        triggerCoverImageUpload() {
            this.$refs.coverImageInput.click();
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
    background-color: #3b82f6;
    border-radius: 0.375rem;
}

.bg-blue-500 {
    background-color: #3b82f6;
}

.bg-red-500 {
    background-color: #ef4444;
}

.text-white {
    color: #ffffff;
}

.text-2xl {
    font-size: 1.5rem;
}

.text-xl {
    font-size: 1.25rem;
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

.object-cover {
    object-fit: cover;
    width: 100%;
    height: 100%;
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

.profile-image-container {
    position: relative;
}

.cover-image-container {
    position: relative;
    border-radius: 0.75rem;
    filter: blur(0);
}

.cover-image-container:hover .cover-hover-overlay {
    display: flex;
}

.profile-image-container:hover .profile-hover-overlay {
    display: flex;
}

.progress-bar-cover,
.progress-bar-profile {
    width: 80%;
    height: 8px;
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background-color: #3b82f6;
    border-radius: 0.375rem;
}

.blur-sm {
    filter: blur(10px);
}
</style>
