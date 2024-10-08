<template>
  <div :class="containerClass" class="min-h-screen">
    <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode" @logout="logout" />
    <div class="container mx-auto px-4 py-8 mt-4">
      <UserProfile v-if="!isLoading && !error" :user="user" :isDarkMode="isDarkMode" />
      <ErrorMessage v-if="error" :message="errorMessage" />
      <div class="flex flex-col lg:flex-row mt-8">
        <div class="w-full lg:w-2/3 lg:pr-8">
          <div v-if="isCurrentUser" :class="postInputClass" class="p-4 rounded-lg shadow-md mb-8">
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
                placeholder="What's on your mind?"></textarea>
            </div>
            <div v-if="currentTab === 'gif'" class="relative">
              <textarea v-model="newPostContent" class="w-full p-4 border border-gray-300 rounded-lg"
                placeholder="What's on your mind?"></textarea>
              <button ref="gifButton" @click="toggleGiphyPicker"
                class="mt-2 bg-blue-500 text-white p-2 rounded-lg">Search GIF
              </button>
              <div v-if="showGiphyPicker" class="giphy-picker-container">
                <input v-model="giphySearchQuery" @input="searchGiphy" placeholder="Search GIFs"
                  class="p-2 border rounded-lg mb-2">
                <div class="giphy-results">
                  <div v-for="gif in giphyResults" :key="gif.id" class="giphy-result"
                    @click="addGifToPost(gif.images.fixed_height.url)">
                    <img :src="gif.images.fixed_height.url" alt="GIF" class="w-full h-16 object-cover rounded-lg mb-2"
                      loading="lazy">
                  </div>
                </div>
              </div>
            </div>
            <div v-if="currentTab === 'video'">
              <textarea v-model="newPostContent" class="w-full p-4 border border-gray-300 rounded-lg"
                placeholder="What's on your mind?"></textarea>
              <input v-model="newPostVideo" type="text" class="w-full p-2 border border-gray-300 rounded-lg mt-2"
                placeholder="Video URL" @input="validateVideoUrl">
              <p v-if="!isValidVideoUrl" class="text-red-500">Invalid Video URL</p>
              <button v-if="newPostVideo" @click="removeVideo" class="mt-2 bg-red-500 text-white p-2 rounded-lg">Remove
                Video
              </button>
            </div>
            <div class="mt-4 flex items-center">
              <select v-model="postVisibility" class="border border-gray-300 rounded-lg p-2 mr-4">
                <option value="public">Public</option>
                <option value="friends">Friends</option>
              </select>
              <button @click="createPost" :disabled="currentTab === 'video' && !isValidVideoUrl"
                class="bg-blue-500 text-white p-2 rounded-lg">Post
              </button>
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

          <div v-for="post in posts" :key="post.id" class="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <img :src="getUserAvatar(post.look)" class="rounded-full border-2 border-blue-500 bg-white"
                  :alt="post.username" loading="lazy">
                <div class="ml-4">
                  <h3 class="font-semibold">{{ post.username }}</h3>
                  <p class="text-gray-600">{{ formatDate(post.created_at) }}</p>
                </div>
              </div>
              <div class="relative">
                <button @click="togglePostMenu(post.id)" class="text-gray-500">
                  <fa-icon icon="ellipsis-v" />
                </button>
                <div v-if="showPostMenu === post.id"
                  class="absolute right-0 bg-white dark:bg-gray-800 rounded shadow-md z-10">
                  <button v-if="canEditPost(post)" @click="editPost(post)"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">Edit
                  </button>
                  <button @click="deletePost(post.id)"
                    class="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Delete
                  </button>
                </div>
              </div>
            </div>
            <p class="mb-4" v-html="parsePostContent(post.content)"></p>
            <img v-if="post.image" :src="post.image" alt="Post Image" class="w-full object-cover rounded-lg mb-4"
              loading="lazy">
            <iframe width="100%" height="500" v-if="post.video" :src="getVideoEmbedUrl(post.video)" frameborder="0"
              allowfullscreen class="w-full mb-4"></iframe>
            <div class="flex items-center">
              <button @click="toggleLike(post)" class="mr-4 like-button">
                <fa-icon :icon="['fas', 'heart']" :class="likeIconClass(post)" />
                <span class="ml-2">{{ post.likesCount }}</span>
              </button>
              <button @click="toggleComments(post)" class="flex items-center">
                <fa-icon icon="comment" class="text-gray-500" />
                <span class="ml-2">{{ post.commentsCount }}</span>
              </button>
            </div>
            <transition name="slide-fade">
              <div v-show="post.showComments" class="mt-4">
                <h4 class="font-semibold mb-2">Comments</h4>
                <div
                  v-for="comment in post.comments.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))"
                  :key="comment.id"
                  :class="{ 'flex justify-end': comment.user_id === user.id, 'flex justify-start': comment.user_id !== user.id }">
                  <div class="flex items-center relative">
                    <div v-if="comment.user_id !== user.id" class="mr-2">
                      <img :src="getAvatarUrl(comment.look, 's')"
                        class="rounded-full border-2 border-blue-500 p-1 bg-white" alt="User Profile" loading="lazy">
                    </div>
                    <div
                      :class="{ 'comment-bubble self-comment': comment.user_id === user.id, 'comment-bubble other-comment': comment.user_id !== user.id }">
                      <button v-if="canDeleteComment(comment)" @click="deleteComment(comment.id)" class="delete-button">
                        <fa-icon icon="times" />
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
                        class="rounded-full border-2 border-blue-500 p-1 bg-white" alt="User Profile" loading="lazy">
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
          <div v-if="loading" class="text-center mt-4">
            <span>Loading...</span>
          </div>
          <div v-if="!loading && noMorePosts" class="text-center mt-4">
            <span>No more posts</span>
          </div>
        </div>

        <div class="w-full lg:w-1/3 lg:pl-8 mt-8 lg:mt-0">
          <div :class="sidebarClass" class="p-4 rounded-lg shadow-md mb-8">
            <h2 class="text-2xl font-bold mb-4">Suggestions For You</h2>
            <div v-for="suggestion in suggestions" :key="suggestion.id" class="flex items-center mb-4 p-4">
              <img :src="getUserAvatar(suggestion.look)" class="w-10 h-10 rounded-full border-2 border-gray-300"
                alt="Suggestion Profile" loading="lazy">
              <div class="ml-4 flex-grow">
                <h3 class="font-semibold">{{ suggestion.username }}</h3>
                <div class="flex mt-2">
                  <button v-if="suggestion.request_status === 'not_requested'" @click="followUser(suggestion.id)"
                    class="bg-blue-500 text-white p-2 rounded-lg mr-2">Follow</button>
                  <button v-else class="bg-gray-500 text-white p-2 rounded-lg mr-2" disabled>En attente</button>
                  <router-link :to="`/dashboard/${suggestion.id}`"
                    class="bg-green-500 text-white p-2 rounded-lg">Visiter</router-link>
                </div>

              </div>
              <hr />
            </div>

          </div>
          <div :class="sidebarClass" class="p-4 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4">Photos</h2>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="photo in photos" :key="photo.id">
                <img :src="photo.url" alt="Photo" class="w-full h-24 object-cover rounded-lg" loading="lazy">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AppFooter :footerLogo="footerLogo" />
    <AppModal v-if="showEditModal" @close="showEditModal = false" title="Edit Post">
      <textarea v-model="editPostContent" class="w-full p-4 border border-gray-300 rounded-lg mb-4"></textarea>
      <button @click="savePost" class="bg-blue-500 text-white p-2 rounded-lg">Save</button>
    </AppModal>
  </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import UserProfile from '../components/UserProfile.vue';
import ErrorMessage from '../components/ErrorMessage.vue';
import AppModal from '../components/AppModal.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faHeart,
  faComment,
  faTrashAlt,
  faSmile,
  faImage,
  faPencilAlt,
  faVideo,
  faEllipsisV,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import 'emoji-picker-element';
import DOMPurify from 'dompurify';

library.add(faHeart, faComment, faTimes, faTrashAlt, faSmile, faImage, faPencilAlt, faVideo, faEllipsisV);

export default {
  name: 'UserDashboard',
  components: {
    AppHeader,
    AppFooter,
    UserProfile,
    AppModal,
    ErrorMessage,
    'fa-icon': FontAwesomeIcon,
    EmojiPicker: 'emoji-picker'
  },
  data() {
    return {
      user: {},
      isLoading: true,
      error: false,
      errorMessage: '',
      newPostContent: '',
      newPostVideo: '',
      postVisibility: 'public',
      headerImage: require('@/assets/images/skeleton/header.webp'),
      footerLogo: require('@/assets/images/skeleton/footerlogo.png'),
      logoImage: require('@/assets/images/skeleton/logo.png'),
      suggestions: [],
      photos: [],
      posts: [],
      isDarkMode: false,
      page: 1,
      limit: 10,
      loading: false,
      noMorePosts: false,
      showEmojiPicker: false,
      showGiphyPicker: false,
      giphySearchQuery: '',
      giphyResults: [],
      isCurrentUser: true,
      currentTab: 'text',
      isValidVideoUrl: true,
      showPostMenu: null,
      showEditModal: false,
      selectedPost: null,
      editPostContent: '',
      lastPostTime: 0,
    };
  },
  computed: {
    containerClass() {
      return {
        'bg-gray-900 text-white': this.isDarkMode,
        'bg-gray-100 text-black': !this.isDarkMode
      };
    },
    postInputClass() {
      return {
        'bg-gray-800 text-white': this.isDarkMode,
        'bg-white text-black': !this.isDarkMode
      };
    },
    sidebarClass() {
      return {
        'bg-gray-800 text-white': this.isDarkMode,
        'bg-white text-black': !this.isDarkMode
      };
    },
    likeIconClass() {
      return (post) => ({
        'text-red-500': post.userLike,
        'text-gray-500': !post.userLike
      });
    }
  },
  async created() {
    const userId = this.$route.params.userId || 'me';
    await this.fetchUserData(userId);
    await this.fetchPosts(userId);
    await this.fetchUserPhotos(userId);
    await this.fetchSuggestions();
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  watch: {
    '$route.params.userId': {
      handler(newUserId) {
        this.resetPosts();
        const userId = newUserId || 'me';
        this.fetchUserData(userId);
        this.fetchPosts(userId);
        this.fetchUserPhotos(userId);
        this.fetchSuggestions();
      },
      immediate: true
    }
  },
  methods: {
    getAvatarUrl(look, size = 's') {
      return `http://www.habbo.com/habbo-imaging/avatarimage?figure=${look}&direction=3&head_direction=3&gesture=nor&action=null&size=${size}&headonly=1&img_format=gif`;
    },
    resetPosts() {
      this.posts = [];
      this.page = 1;
      this.noMorePosts = false;
    },
    async fetchUserData(userId) {
      this.isLoading = true;
      this.error = false;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
        const url = userId === 'me' || !userId ? `${apiUrl}/users/profile/me` : `${apiUrl}/users/profile/${userId}`;
        const response = await axios.get(url, {
          headers: { 'x-access-token': token }
        });
        this.user = response.data;
        // Assurez-vous que profileImage et coverImage sont correctement mappés
        if (this.user.profile_image) {
          this.user.profileImage = this.user.profile_image;
        }
        if (this.user.cover_image) {
          this.user.coverImage = this.user.cover_image;
        }
        this.isCurrentUser = userId === 'me' || userId == localStorage.getItem('userId');
        this.isLoading = false;
      } catch (error) {
        this.error = true;
        this.errorMessage = error.response ? error.response.data || 'Failed to fetch user data. Please try again later.' : 'Failed to fetch user data. Please check your network connection.';
        this.isLoading = false;
      }
    },
    async fetchUserPhotos(userId) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
        const url = userId === 'me' ? `${apiUrl}/users/photos/me` : `${apiUrl}/users/photos/${userId}`;
        const response = await axios.get(url, {
          headers: { 'x-access-token': token }
        });
        this.photos = response.data;
      } catch (error) {
        console.error('Error fetching user photos:', error);
      }
    },
    async fetchPosts(userId) {
      if (this.loading) return;
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
        const url = `${apiUrl}/posts/${userId}`;
        const response = await axios.get(url, {
          headers: { 'x-access-token': token },
          params: { page: this.page, limit: this.limit }
        });
        if (response.data.length === 0) {
          this.noMorePosts = true;
        } else {
          const newPosts = response.data.filter(post => !this.posts.some(p => p.id === post.id));
          newPosts.forEach(post => {
            post.likesCount = post.likesCount || 0;
            post.commentsCount = post.commentsCount || 0;
          });
          this.posts = [...this.posts, ...newPosts];
          this.page++;
        }
        this.loading = false;
      } catch (error) {
        this.error = true;
        this.errorMessage = error.response ? error.response.data || 'Failed to fetch posts. Please try again later.' : 'Failed to fetch posts. Please check your network connection.';
        this.loading = false;
      }
    },
    handleScroll() {
      const bottomOfWindow = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight;
      if (bottomOfWindow && !this.loading && !this.noMorePosts) {
        this.fetchPosts();
      }
    },
    async fetchSuggestions() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${apiUrl}/users/suggestions`, {
          headers: { 'x-access-token': token }
        });
        this.suggestions = response.data;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
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

        this.newPostContent = '';
        this.newPostVideo = '';
        this.postVisibility = 'public';
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
          content: await this.applyWordFilter(commentContent)
        }, {
          headers: { 'x-access-token': token }
        });

        const newComment = response.data;
        post.comments.push(newComment);
        post.commentsCount++;
        post.newComment = '';
      } catch (error) {
        console.error('Error adding comment:', error.message);
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
          this.showPostMenu = null;
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
    canDeletePost(post) {
      return this.user.rank >= 5 || post.user_id === this.user.id;
    },
    canDeleteComment(comment) {
      return this.user.rank >= 5 || comment.user_id === this.user.id;
    },
    canEditPost(post) {
      return this.user.rank >= 5 || post.user_id === this.user.id;
    },
    editPost(post) {
      this.selectedPost = post;
      this.editPostContent = post.content;
      this.showEditModal = true;
      this.showPostMenu = null;
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
    toggleComments(post) {
      post.showComments = !post.showComments;
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    toggleGiphyPicker() {
      this.showGiphyPicker = !this.showGiphyPicker;
    },

    async searchGiphy() {
      if (this.giphySearchQuery.trim() === '') {
        this.giphyResults = [];
        return;
      }
      const apiKey = '4B6hLBP7tVbreKD0wySAywzh52awMQhf';
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${this.giphySearchQuery}&limit=10`;
      try {
        const response = await axios.get(url);
        this.giphyResults = response.data.data;
      } catch (error) {
        console.error('Error fetching GIFs:', error);
      }
    },

    addGifToPost(gifUrl) {
      this.newPostContent += `[img]${gifUrl}[/img]`;
      this.showGiphyPicker = false;
    },
    addEmoji(event) {
      if (event.detail && event.detail.unicode) {
        this.newPostContent += event.detail.unicode;
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.classList.toggle('dark', this.isDarkMode);
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
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
    getUserAvatar(look) {
      return `http://www.habbo.com/habbo-imaging/avatarimage?figure=${look}&direction=3&head_direction=3&gesture=nor&action=null&size=s&headonly=1&img_format=gif`;
    },
    parsePostContent(content) {
      content = DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }); // permet d'echapper proprement le html
      console.log(content);
      const gifRegex = /\[img\](.*?)\[\/img\]/g;
      return content.replace(gifRegex, '<img src="$1" alt="GIF" class="h-48 object-cover rounded-lg mb-4">');
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
    togglePostMenu(postId) {
      this.showPostMenu = this.showPostMenu === postId ? null : postId;
    },
    selectTab(tab) {
      this.currentTab = tab;
    },
    async followUser(userId) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000';
        await axios.post(`${apiUrl}/users/follow`, { userId }, {
          headers: { 'x-access-token': token }
        });
        const userIndex = this.suggestions.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          this.suggestions[userIndex].request_status = 'pending';
        }
      } catch (error) {
        console.error('Error following user:', error);
      }
    }
  }
};
</script>

<style scoped>
.like-button .fa-heart.animate-like {
  animation: like-animation 0.5s;
}

.suggestions-card {
  background-color: var(--color-bg);
  color: var(--color-text);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, color 0.3s;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.3s;
}

.suggestion-item:hover {
  background-color: var(--color-bg-hover);
}

.suggestion-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  border: 2px solid var(--color-border);
}

.suggestion-info {
  margin-left: 1rem;
  flex-grow: 1;
}

.suggestion-username {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.suggestion-actions {
  display: flex;
  gap: 0.5rem;
}

.suggestion-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
}

.suggestion-button.follow {
  background-color: var(--color-primary);
  color: #fff;
}

.suggestion-button.pending {
  background-color: var(--color-muted);
  color: #fff;
}

.suggestion-button.visit {
  background-color: var(--color-secondary);
  color: #fff;
}

/* Define your color variables */
:root {
  --color-bg: #fff;
  --color-text: #333;
  --color-border: #ccc;
  --color-bg-hover: #f9f9f9;
  --color-primary: #3490dc;
  --color-secondary: #38c172;
  --color-muted: #6c757d;
}

/* Dark mode */
:root.dark {
  --color-bg: #1f2937;
  --color-text: #e5e7eb;
  --color-border: #4b5563;
  --color-bg-hover: #374151;
  --color-primary: #2563eb;
  --color-secondary: #22c55e;
  --color-muted: #9ca3af;
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
