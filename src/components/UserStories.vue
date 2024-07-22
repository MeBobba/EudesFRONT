<template>
    <div class="stories-container">
        <div class="story" v-for="story in stories" :key="story.id" @click="viewStory(story)">
            <div class="avatar-background">
                <img v-if="story.userAvatar" :src="story.userAvatar" alt="User Avatar" class="avatar">
            </div>
            <p class="username">{{ story.username }}</p>
        </div>
        <div class="story add-story" @click="showAddStoryModal" @mouseover="showPlusIcon = true"
            @mouseleave="showPlusIcon = false">
            <div class="avatar-background">
                <img v-if="user && user.profileImage" :src="user.profileImage" :alt="user.username" class="avatar">
                <img v-else-if="user && user.look"
                    :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${user.look}&direction=3&head_direction=3&gesture=nor&action=null&size=l&headonly=1&img_format=gif`"
                    :alt="user.username" class="avatar">
                <div class="add-icon" v-if="showPlusIcon">+</div>
            </div>
            <p class="username">Add Story</p>
        </div>
    </div>

    <div v-if="currentStory" class="story-viewer" :class="{ 'story-viewer-active': currentStory }">
        <div class="story-content">
            <img v-if="currentStory.image" :src="currentStory.image" alt="Story Image" class="story-image">
            <p v-if="currentStory.text" class="story-text">{{ currentStory.text }}</p>
            <div class="timer-bar" :style="{ width: timerWidth + '%' }"></div>
        </div>
        <button class="close-button" @click="closeStory">&times;</button>
    </div>

    <div v-if="showAddStory" class="add-story-modal">
        <div class="modal-content">
            <h2>Add New Story</h2>
            <textarea v-model="newStoryText" placeholder="Write something..." required></textarea>
            <div class="file-upload">
                <input type="file" id="file" class="file-input" @change="handleImageUpload" required>
                <label for="file" class="file-label">Choose a file</label>
            </div>
            <div v-if="uploadProgress > 0" class="progress-bar">
                <div class="progress" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" @click="addStory" :disabled="!canSubmit">Add Story</button>
                <button class="btn btn-secondary" @click="closeAddStoryModal">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'UserStories',
    props: {
        user: Object,
        userId: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            stories: [],
            currentStory: null,
            showAddStory: false,
            newStoryText: '',
            newStoryImage: null,
            showPlusIcon: false, // Nouvelle variable pour contrôler l'affichage du bouton +
            timerWidth: 0, // Pour le timer de la story
            timerInterval: null, // Pour le contrôle de l'intervalle du timer
            uploadProgress: 0 // Pour la barre de progression
        };
    },
    async created() {
        await this.fetchStories();
    },
    computed: {
        canSubmit() {
            return this.newStoryText && this.newStoryImage;
        }
    },
    methods: {
        async fetchStories() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/stories/${this.userId}`, {
                    headers: { 'x-access-token': token }
                });
                this.stories = response.data;
            } catch (error) {
                console.error('Error fetching stories:', error);
            }
        },
        viewStory(story) {
            this.currentStory = story;
            this.startTimer();
        },
        closeStory() {
            this.currentStory = null;
            this.resetTimer();
        },
        startTimer() {
            this.timerWidth = 0;
            this.timerInterval = setInterval(() => {
                if (this.timerWidth < 100) {
                    this.timerWidth += (100 / 30); // 30 secondes
                } else {
                    this.closeStory();
                }
            }, 1000);
        },
        resetTimer() {
            clearInterval(this.timerInterval);
            this.timerWidth = 0;
        },
        showAddStoryModal() {
            this.showAddStory = true;
        },
        closeAddStoryModal() {
            this.showAddStory = false;
            this.newStoryText = '';
            this.newStoryImage = null;
            this.uploadProgress = 0;
        },
        handleImageUpload(event) {
            this.newStoryImage = event.target.files[0];
        },
        async addStory() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const formData = new FormData();
                formData.append('text', this.newStoryText);
                if (this.newStoryImage) {
                    formData.append('image', this.newStoryImage);
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                await axios.post(`${apiUrl}/stories`, formData, {
                    headers: {
                        'x-access-token': token,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    }
                });
                this.closeAddStoryModal();
                await this.fetchStories(); // Refresh stories
            } catch (error) {
                console.error('Error adding story:', error);
            }
        }
    }
};
</script>

<style scoped>
.stories-container {
    display: flex;
    overflow-x: auto;
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
}

.story {
    flex: 0 0 80px;
    text-align: center;
    margin-right: 10px;
    cursor: pointer;
    transition: transform 0.3s;
    position: relative;
}

.story:hover {
    transform: scale(1.1);
}

.avatar-background {
    background-color: yellow;
    border-radius: 50%;
    padding: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.story img.avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 2px solid #3490dc;
}

.story .username {
    font-size: 12px;
    color: #333;
}

.add-story .add-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: white;
    background-color: #3490dc;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: none;
    align-items: center;
    justify-content: center;
}

.add-story:hover .add-icon {
    display: flex;
}

.story-viewer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    /* Pour s'assurer que le story viewer est en premier plan */
}

.story-content {
    position: relative;
    max-width: 400px;
    max-height: 600px;
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
}

.story-image {
    max-width: 100%;
    max-height: 100%;
    border-radius: 10px;
}

.story-text {
    font-size: 18px;
    margin-top: 10px;
}

.timer-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 5px;
    background-color: #3490dc;
    transition: width 0.5s linear;
}

.close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
}

.add-story-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    width: 90%;
    max-width: 500px;
    position: relative;
    animation: fadeIn 0.3s ease-in-out;
}

.modal-content h2 {
    margin-bottom: 20px;
    font-size: 24px;
}

.modal-content textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.file-upload {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

.file-input {
    display: none;
}

.file-label {
    background-color: #3490dc;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.file-label:hover {
    background-color: #2176bb;
}

.progress-bar {
    width: 100%;
    background-color: #ddd;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 20px;
}

.progress {
    height: 10px;
    background-color: #3490dc;
    transition: width 0.3s;
}

.modal-buttons {
    display: flex;
    justify-content: space-around;
}

.modal-buttons .btn {
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.modal-buttons .btn-primary {
    background: #3490dc;
    color: #fff;
}

.modal-buttons .btn-primary:hover {
    background: #2176bb;
}

.modal-buttons .btn-secondary {
    background: #ddd;
}

.modal-buttons .btn-secondary:hover {
    background: #ccc;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
