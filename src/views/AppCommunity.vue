<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row">
            <div class="w-full lg:w-2/3 lg:pr-8">
                <div v-if="error" class="text-red-500">{{ errorMessage }}</div>
                <div v-else>
                    <div v-for="post in posts" :key="post.id"
                        class="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <img :src="getAvatarUrl(post.look)"
                                    class="rounded-full border-2 border-blue-500 bg-white" :alt="post.username"
                                    loading="lazy">
                                <div class="ml-4">
                                    <h3 class="font-semibold">
                                        <router-link :to="`/dashboard/${post.user_id}`">{{ post.username
                                            }}</router-link>
                                    </h3>
                                    <p class="text-gray-600">{{ formatDate(post.created_at) }}</p>
                                </div>
                            </div>
                            <div class="relative">
                                <button v-if="canEditPost(post) || canDeletePost(post)" @click="togglePostMenu(post.id)"
                                    class="text-gray-500">
                                    <fa-icon icon="ellipsis-v" />
                                </button>
                                <div v-if="showPostMenu === post.id"
                                    class="absolute right-0 bg-white dark:bg-gray-800 rounded shadow-md z-10">
                                    <button v-if="canEditPost(post)" @click="editPost(post)"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">{{
                                            $t('edit') }}</button>
                                    <button v-if="canDeletePost(post)" @click="deletePost(post.id)"
                                        class="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">{{
                                            $t('delete') }}</button>
                                </div>
                            </div>
                        </div>
                        <div class="mb-4" v-html="parsePostContent(post.content)"></div>
                        <img v-if="post.image" :src="post.image" alt="MeBobba"
                            class="w-full object-cover rounded-lg mb-4" loading="lazy">
                        <iframe width="100%" height="500" v-if="post.video" :src="getVideoEmbedUrl(post.video)"
                            frameborder="0" allowfullscreen class="w-full mb-4"></iframe>
                        <div class="flex items-center">
                            <button @click="toggleLike(post)" class="mr-4 like-button">
                                <fa-icon :icon="['fas', 'heart']"
                                    :class="{ 'text-red-500': post.userLike, 'text-gray-500': !post.userLike }" />
                                <span class="ml-2">{{ post.likesCount }}</span>
                            </button>
                            <button @click="toggleComments(post)" class="flex items-center">
                                <fa-icon icon="comment" class="text-gray-500" />
                                <span class="ml-2">{{ post.commentsCount }}</span>
                            </button>
                        </div>
                        <transition name="slide-fade">
                            <div v-show="post.showComments" class="mt-4">
                                <h4 class="font-semibold mb-2">{{ $t('comments') }}</h4>
                                <div v-for="comment in post.comments.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))"
                                    :key="comment.id"
                                    :class="{ 'flex justify-end': comment.user_id === user.id, 'flex justify-start': comment.user_id !== user.id }">
                                    <div class="flex items-center relative">
                                        <div v-if="comment.user_id !== user.id" class="mr-2">
                                            <img :src="getAvatarUrl(comment.look, 's')"
                                                class="rounded-full border-2 border-blue-500 p-1 bg-white"
                                                alt="User Profile" loading="lazy">
                                        </div>
                                        <div
                                            :class="{ 'comment-bubble self-comment': comment.user_id === user.id, 'comment-bubble other-comment': comment.user_id !== user.id }">
                                            <button v-if="canDeleteComment(comment)" @click="deleteComment(comment.id)"
                                                class="delete-button text-white">
                                                <fa-icon :icon="['fas', 'times']" />
                                            </button>
                                            <div class="flex items-center justify-between w-full">
                                                <div>
                                                    <p class="font-semibold text-sm">{{ comment.username }}</p>
                                                    <p class="text-sm">{{ comment.content }}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="comment.user_id === user.id" class="ml-2">
                                            <img :src="getAvatarUrl(comment.look, 's')"
                                                class="rounded-full border-2 border-blue-500 p-1 bg-white"
                                                alt="User Profile" loading="lazy">
                                        </div>
                                    </div>
                                </div>
                                <textarea v-model="post.newComment" :placeholder="$t('addcomment')"
                                    class="w-full mt-5 p-2 border border-gray-300 rounded-lg"></textarea>
                                <button @click="addComment(post)" class="mt-2 bg-blue-500 text-white p-2 rounded-lg">{{
                                    $t('comment')
                                    }}</button>
                            </div>
                        </transition>
                    </div>
                </div>
                <div v-if="loading" class="text-center mt-4">
                    <span>{{ $t('loading') }}</span>
                </div>
                <div v-if="!loading && noMorePosts" class="text-center mt-4">
                    <span>{{ $t('nomoreposts') }}</span>
                </div>
            </div>
            <div class="w-full lg:w-1/3 lg:pl-8">
                <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                    class="p-4 rounded-lg shadow-md mb-8">
                    <div class="mb-4">
                        <div class="tabs">
                            <button :class="{ active: currentTab === 'text' }" @click="selectTab('text')">
                                <fa-icon icon="pencil-alt" />
                            </button>
                            <button :class="{ active: currentTab === 'gif' }" @click="selectTab('gif')">
                                <fa-icon icon="image" />
                            </button>
                            <button :class="{ active: currentTab === 'video' }" @click="selectTab('video')">
                                <fa-icon icon="video" />
                            </button>
                        </div>
                        <div v-if="currentTab === 'text'">
                            <textarea v-model="newPostContent" class="w-full p-4 border border-gray-300 rounded-lg"
                                :placeholder="$t('whatsonyourmind')"></textarea>
                        </div>
                        <div v-if="currentTab === 'gif'" class="relative">
                            <textarea v-model="newPostContent" class="w-full p-4 border border-gray-300 rounded-lg"
                                :placeholder="$t('whatsonyourmind')"></textarea>
                            <button ref="gifButton" @click="toggleGiphyPicker"
                                class="mt-2 bg-blue-500 text-white p-2 rounded-lg">{{ $t('searchgifs') }}</button>
                            <div v-if="showGiphyPicker" class="giphy-picker-container">
                                <input v-model="giphySearchQuery" @input="searchGiphy" :placeholder="$t('searchgifs')"
                                    class="p-2 border rounded-lg mb-2">
                                <div class="giphy-results">
                                    <div v-for="gif in giphyResults" :key="gif.id" class="giphy-result"
                                        @click="addGifToPost(gif.images.fixed_height.url)">
                                        <img :src="gif.images.fixed_height.url" alt="GIF"
                                            class="w-full h-16 object-cover rounded-lg mb-2" loading="lazy">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="currentTab === 'video'">
                            <textarea v-model="newPostContent" class="w-full p-4 border border-gray-300 rounded-lg"
                                :placeholder="$t('whatsonyourmind')"></textarea>
                            <input v-model="newPostVideo" type="text"
                                class="w-full p-2 border border-gray-300 rounded-lg mt-2" placeholder="Video URL"
                                @input="validateVideoUrl">
                            <p v-if="!isValidVideoUrl" class="text-red-500">{{ $t('invalidvideourl') }}</p>
                            <button v-if="newPostVideo" @click="removeVideo"
                                class="mt-2 bg-red-500 text-white p-2 rounded-lg">{{ $t('removevideo') }}</button>
                        </div>
                        <div class="mt-4 flex items-center">
                            <select v-model="postVisibility" class="border border-gray-300 rounded-lg p-2 mr-4">
                                <option value="public">{{ $t('public') }}</option>
                                <option value="friends">{{ $t('friends') }}</option>
                            </select>
                            <button @click="createPost" :disabled="currentTab === 'video' && !isValidVideoUrl"
                                class="bg-blue-500 text-white p-2 rounded-lg">{{ $t('post') }}</button>
                        </div>
                        <div class="relative mt-2 flex items-center">
                            <button @click="toggleEmojiPicker" class="mr-4 p-2">
                                <fa-icon icon="smile" />
                            </button>
                            <div v-if="showEmojiPicker" class="absolute z-10 emoji-picker-container">
                                <emoji-picker @emoji-click="addEmoji"></emoji-picker>
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                    class="p-4 rounded-lg shadow-md mb-8">
                    <!-- Widget Météo -->
                    <WeatherWidget />
                </div>
                <div v-for="card in exampleCards" :key="card.id"
                    :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
                    class="p-4 rounded-lg shadow-md mb-8">
                    <h2 class="text-2xl font-bold mb-4">{{ card.title }} test</h2>
                    <p>{{ card.content }}</p>
                </div>
            </div>
        </div>
        <AppFooter :footerLogo="footerLogo" />
        <AppModal v-if="showEditModal" @close="showEditModal = false" title="Edit Post">
            <label class="block text-sm font-medium text-gray-700">Contents</label>
            <textarea v-model="editPostContent"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none "></textarea>
            <button @click="savePost"
                class="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">{{
                    $t('save') }}</button>
        </AppModal>
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import WeatherWidget from '../components/WeatherWidget.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeart, faComment, faTrashAlt, faTimes, faSmile, faImage, faPencilAlt, faVideo, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import 'emoji-picker-element';
import AppModal from '../components/AppModal.vue';
import DOMPurify from "dompurify";

library.add(faHeart, faComment, faTimes, faTrashAlt, faSmile, faImage, faPencilAlt, faVideo, faEllipsisV);

export default {
    name: 'AppCommunity',
    components: {
        AppHeader,
        AppFooter,
        AppModal,
        WeatherWidget,
        'fa-icon': FontAwesomeIcon,
        EmojiPicker: 'emoji-picker'
    },
    data() {
        return {
            headerImage: require('@/assets/images/skeleton/header.webp'),
            footerLogo: require('@/assets/images/skeleton/footerlogo.png'),
            logoImage: require('@/assets/images/skeleton/logo.png'),
            isDarkMode: false,
            posts: [],
            user: {},
            error: false,
            errorMessage: '',
            page: 1,
            limit: 10,
            loading: false,
            noMorePosts: false,
            newPostContent: '',
            newPostVideo: '',
            postVisibility: 'public',
            showEmojiPicker: false,
            showGiphyPicker: false,
            giphySearchQuery: '',
            giphyResults: [],
            exampleCards: [
                { id: 1, title: 'Example Card 1', content: 'Content goes here...' },
            ],
            currentTab: 'text',
            isValidVideoUrl: true,
            showEditModal: false,
            selectedPost: null,
            editPostContent: '',
            showPostMenu: null,
            lastPostTime: 0,
        };
    },
    async created() {
        await this.fetchUserData();
        await this.fetchPublicPosts();
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
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
        async fetchUserData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/users/profile/me`, {
                    headers: { 'x-access-token': token }
                });
                this.user = response.data;
            } catch (error) {
                this.handleError(error, 'Failed to fetch user data. Please try again later.');
            }
        },
        async fetchPublicPosts() {
            if (this.loading) return;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/posts/public`, {
                    headers: { 'x-access-token': token },
                    params: { page: this.page, limit: this.limit }
                });
                if (response.data.length === 0) {
                    this.noMorePosts = true;
                } else {
                    const newPosts = response.data.filter(post => !this.posts.some(p => p.id === post.id));
                    this.posts = [...this.posts, ...newPosts];
                    this.page++;
                }
            } catch (error) {
                this.handleError(error, 'Failed to fetch posts. Please try again later.');
            } finally {
                this.loading = false;
            }
        },
        handleScroll() {
            const bottomOfWindow = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.loading && !this.noMorePosts) {
                this.fetchPublicPosts();
            }
        },
        async createPost() {
            const currentTime = Date.now();
            const timeSinceLastPost = currentTime - this.lastPostTime;

            if (timeSinceLastPost < 15000) {
                alert('Please wait 15 seconds before posting again.');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                // on verifie si le contenu est pas vide
                if (this.newPostContent.trim() === '') {
                    alert('Please enter some content before posting.');
                    return;
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/posts`, {
                    content: await this.applyWordFilter(this.newPostContent),
                    video: this.newPostVideo,
                    visibility: this.postVisibility
                }, {
                    headers: { 'x-access-token': token }
                });

                const newPost = response.data;
                newPost.likesCount = 0;
                newPost.commentsCount = 0;
                newPost.comments = [];
                this.posts.unshift(newPost);

                this.resetPostForm();
                this.isValidVideoUrl = true;

                this.lastPostTime = currentTime;
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    alert('Please wait 15 seconds before posting again.');
                } else {
                    console.error('Error creating post:', error);
                }
            }
        },
        async addComment(post) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                // verifie si le contenu du commentaire n'est pas vide
                const commentContent = (post.newComment || '').trim();
                if (!commentContent) {
                    alert('Comment cannot be empty');
                    return;
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/posts/comments`, {
                    postId: post.id,
                    content: await this.applyWordFilter(post.newComment)
                }, {
                    headers: { 'x-access-token': token }
                });
                const newComment = response.data;
                post.comments.push(newComment);
                post.commentsCount++;
                post.newComment = '';
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        },
        async deleteComment(commentId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';

                // Mettre à jour l'interface utilisateur immédiatement
                this.posts = this.posts.map(post => {
                    const commentIndex = post.comments.findIndex(c => c.id === commentId);
                    if (commentIndex !== -1) {
                        post.comments.splice(commentIndex, 1); // Supprimer le commentaire
                        post.commentsCount--; // Décrémenter le compteur de commentaires
                    }
                    return post;
                });

                // Ensuite, faire la requête pour supprimer le commentaire sur le serveur
                await axios.delete(`${apiUrl}/posts/comments/${commentId}`, {
                    headers: { 'x-access-token': token }
                });
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        },
        async deletePost(postId) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.delete(`${apiUrl}/posts/${postId}`, {
                    headers: { 'x-access-token': token }
                });
                if (response.status === 200) {
                    this.posts = this.posts.filter(post => post.id !== postId);
                } else {
                    throw new Error('Failed to delete post');
                }
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post. Please try again later.');
            }
        },
        async toggleLike(post) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.post(`${apiUrl}/posts/likes`, {
                    postId: post.id,
                    isLike: !post.userLike
                }, {
                    headers: { 'x-access-token': token }
                });
                const data = response.data;
                post.userLike = data.userLike;
                post.likesCount = data.likesCount;
            } catch (error) {
                console.error('Error liking post:', error);
            }
        },
        toggleComments(post) {
            post.showComments = !post.showComments;
        },
        toggleEmojiPicker() {
            this.showEmojiPicker = !this.showEmojiPicker;
        },
        toggleGiphyPicker() {
            this.showGiphyPicker = !this.showGiphyPicker;
            if (this.showGiphyPicker) {
                this.$nextTick(() => {
                    const gifButton = this.$refs.gifButton;
                    const pickerContainer = this.$el.querySelector('.giphy-picker-container');
                    if (gifButton && pickerContainer) {
                        const offsetTop = gifButton.offsetTop - pickerContainer.offsetHeight - 10;
                        pickerContainer.style.top = `${offsetTop}px`;
                    }
                });
            }
        },
        addEmoji(event) {
            if (event.detail && event.detail.unicode) {
                this.newPostContent += event.detail.unicode;
            }
        },
        async searchGiphy() {
            try {
                const apiKey = '4B6hLBP7tVbreKD0wySAywzh52awMQhf';
                const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
                    params: {
                        api_key: apiKey,
                        q: this.giphySearchQuery,
                        limit: 10
                    }
                });
                this.giphyResults = response.data.data;
            } catch (error) {
                console.error('Error searching GIPHY:', error);
            }
        },
        addGifToPost(gifUrl) {
            this.newPostContent += `[img]${gifUrl}[/img]`;
            this.showGiphyPicker = false;
        },
        validateVideoUrl() {
            const youtubeMatch = this.newPostVideo.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.*?v=))([^?&]+)/);
            const vimeoMatch = this.newPostVideo.match(/(?:vimeo\.com\/(?:.*#|.*\/videos\/|.*\/)?)([0-9]+)/);
            const dailymotionMatch = this.newPostVideo.match(/(?:dailymotion\.com\/(?:video|hub)\/([^_]+)|dai\.ly\/([^_]+))/);
            this.isValidVideoUrl = !!(youtubeMatch || vimeoMatch || dailymotionMatch);
        },
        removeVideo() {
            this.newPostVideo = '';
            this.isValidVideoUrl = true;
        },
        parsePostContent(content) {
            content = DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }); // permet d'echapper proprement le html
            console.log(content);
            const gifRegex = /\[img\](.*?)\[\/img\]/g;
            return content.replace(gifRegex, '<img src="$1" alt="GIF" class="h-48 object-cover rounded-lg mb-4">');
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        getVideoEmbedUrl(url) {
            const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.*?v=))([^?&]+)/);
            if (youtubeMatch) {
                return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
            }
            const vimeoMatch = url.match(/(?:vimeo\.com\/(?:.*#|.*\/videos\/|.*\/)?)([0-9]+)/);
            if (vimeoMatch) {
                return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
            }
            const dailymotionMatch = url.match(/(?:dailymotion\.com\/(?:video|hub)\/([^_]+)|dai\.ly\/([^_]+))/);
            if (dailymotionMatch) {
                return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1] || dailymotionMatch[2]}`;
            }
            return '';
        },
        getAvatarUrl(look, size = 's') {
            return `http://www.habbo.com/habbo-imaging/avatarimage?figure=${look}&direction=3&head_direction=3&gesture=nor&action=null&size=${size}&headonly=1&img_format=gif`;
        },
        canDeletePost(post) {
            return this.user.rank >= 5 || post.user_id === this.user.id;
        },
        canDeleteComment(comment) {
            return comment.user_id === this.user.id;
        },
        canEditPost(post) {
            return this.user.rank >= 5 || post.user_id === this.user.id;
        },
        editPost(post) {
            this.selectedPost = post;
            this.editPostContent = post.content;
            this.showEditModal = true;
        },
        async savePost() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.put(`${apiUrl}/posts/${this.selectedPost.id}`, {
                    content: await this.applyWordFilter(this.editPostContent)
                }, {
                    headers: { 'x-access-token': token }
                });
                if (response.status === 200) {
                    this.selectedPost.content = response.data.content;
                    this.showEditModal = false;
                } else {
                    throw new Error('Failed to update post');
                }
            } catch (error) {
                console.error('Error updating post:', error);
                alert('Failed to update post. Please try again later.');
            }
        },
        handleError(error, defaultMessage) {
            this.error = true;
            this.errorMessage = error.response ? error.response.data || defaultMessage : defaultMessage;
        },
        resetPostForm() {
            this.newPostContent = '';
            this.newPostVideo = '';
            this.postVisibility = 'public';
        },
        async applyWordFilter(content) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/posts/wordfilter`, {
                    headers: { 'x-access-token': token }
                });

                const wordFilters = response.data;
                wordFilters.forEach(filter => {
                    const regex = new RegExp(`\\b${filter.key}\\b`, 'gi');
                    content = content.replace(regex, filter.replacement);
                });
                return content;
            } catch (error) {
                console.error('Error fetching word filters:', error);
                return content;
            }
        },
        removeComment(commentId) {
            this.posts = this.posts.map(post => {
                post.comments = post.comments.filter(c => c.id !== commentId);
                return post;
            });
        },
        togglePostMenu(postId) {
            this.showPostMenu = this.showPostMenu === postId ? null : postId;
        },
        selectTab(tab) {
            this.currentTab = tab;
        }
    }
};
</script>

<style scoped>
.like-button .fa-heart.animate-like {
    animation: like-animation 0.5s;
}

@keyframes like-animation {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.5);
    }

    100% {
        transform: scale(1);
    }
}

.tabs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.tabs button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
}

.tabs button.active {
    border-bottom: 2px solid #3490dc;
}

.emoji-picker-container {
    bottom: 40px;
    z-index: 9999;
}

.giphy-picker-container {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 0;
    background: white;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 300px;
    max-height: 400px;
    overflow-y: scroll;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    min-height: 100px;
}

.giphy-result img {
    cursor: pointer;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(10px);
    opacity: 0;
}

.comment-bubble {
    padding: 8px 12px;
    border-radius: 18px;
    max-width: 75%;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 5px;
    display: block;
    position: relative;
    white-space: normal;
}

.self-comment {
    background-color: #007AFF;
    color: white;
    align-self: flex-end;
    text-align: right;
    margin-left: auto;
    /* Ajouté pour forcer l'alignement à droite */
}

.other-comment {
    background-color: #E5E5EA;
    color: black;
    align-self: flex-start;
    text-align: left;
    margin-right: auto;
    /* Ajouté pour forcer l'alignement à gauche */
}

.dark .self-comment {
    background-color: #007AFF;
    color: white;
}

.dark .other-comment {
    background-color: #3A3A3C;
    color: white;
}

.comment-bubble p {
    margin: 0;
    line-height: 1.25;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal;
}

.delete-button {
    position: absolute;
    top: -10px;
    /* Positionner le bouton croix en haut */
    right: -10px;
    /* Positionner le bouton croix à droite */
    background-color: #FF3B30;
    border: none;
    color: white;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s;
    padding: 0;
}

.delete-button:hover {
    background-color: #D32F2F;
}

.dark .delete-button {
    background-color: #FF3B30;
}

.dark .delete-button:hover {
    background-color: #D32F2F;
}

/* Adaptabilité responsive */
@media (max-width: 600px) {
    .comment-bubble {
        width: 100%;
        /* Faire en sorte que les bulles prennent toute la largeur sur petits écrans */
        border-radius: 12px;
        /* Ajuster le border-radius pour petits écrans */
    }

    .delete-button {
        width: 16px;
        height: 16px;
        top: -8px;
        right: -8px;
    }

    .comment-bubble p {
        font-size: 0.75rem;
        /* Réduire la taille de la police pour petits écrans */
    }
}
</style>