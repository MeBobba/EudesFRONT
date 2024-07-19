<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }" class="min-h-screen">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8">
            <input type="text" v-model="searchQuery" @input="debouncedSearchMusic" placeholder="Search for music..."
                class="search-bar" />
            <section>
                <h2 class="text-2xl font-semibold mb-4">Latest Releases</h2>
                <div class="latest-releases grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div v-for="track in latestTracks" :key="track.id" class="track-item" @click="playTrack(track)">
                        <img :src="track.album.images[0]?.url" :alt="track.name" class="w-full h-auto rounded-lg" />
                        <div class="mt-2">
                            <h3 class="text-lg font-medium">{{ track.name }}</h3>
                            <p class="text-sm text-gray-500">{{ track.artists[0].name }}</p>
                        </div>
                    </div>
                </div>
            </section>
            <section v-if="searchResults.tracks.length || searchResults.artists.length">
                <h2 class="text-2xl font-semibold mb-4">Search Results</h2>
                <div class="search-results">
                    <h3 class="text-xl font-semibold mb-2">Artists</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div v-for="artist in searchResults.artists" :key="artist.id" class="artist-item">
                            <img :src="artist.images[0]?.url" :alt="artist.name" class="w-16 h-16 rounded-full" />
                            <div class="mt-2">
                                <h3 class="text-lg font-medium">{{ artist.name }}</h3>
                            </div>
                        </div>
                    </div>
                    <h3 class="text-xl font-semibold mt-4 mb-2">Songs</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div v-for="result in searchResults.tracks" :key="result.id" class="track-item"
                            @click="playTrack(result)">
                            <img :src="result.album.images[0]?.url" :alt="result.name"
                                class="w-full h-auto rounded-lg" />
                            <div class="mt-2">
                                <h3 class="text-lg font-medium">{{ result.name }}</h3>
                                <p class="text-sm text-gray-500">{{ result.artists[0].name }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <div v-if="currentTrack"
            class="music-player fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between rounded-t-lg shadow-lg">
            <div class="flex items-center">
                <img :src="currentTrack.album.images[0]?.url" alt="Album cover" class="w-16 h-16 rounded-lg" />
                <div class="track-info ml-4">
                    <h3 class="text-lg font-medium">{{ currentTrack.name }}</h3>
                    <p class="text-sm text-gray-400">{{ currentTrack.artists[0].name }}</p>
                </div>
            </div>
            <div class="controls flex items-center flex-1 mx-4">
                <i class="fas fa-step-backward control-icon mx-2" @click="previousTrack"></i>
                <i :class="[isPlaying ? 'fas fa-pause' : 'fas fa-play']" @click="togglePlayPause"
                    class="control-icon mx-2"></i>
                <i class="fas fa-step-forward control-icon mx-2" @click="nextTrack"></i>
                <span class="mx-2">{{ formatTime(currentTime) }}</span>
                <input type="range" min="0" :max="duration" v-model="currentTime" @input="seek"
                    class="progress-bar mx-2 flex-1" />
                <span class="mx-2">{{ formatTime(duration) }}</span>
            </div>
            <div class="flex items-center">
                <i :class="volumeIcon" class="control-icon mx-2 volume-icon"></i>
                <input type="range" min="0" max="100" v-model="volume" @input="changeVolume"
                    class="volume-slider mx-2" />
                <i class="fas fa-align-left control-icon mx-2" @click="showLyricsModal"></i>
                <i class="fas fa-user control-icon mx-2" @click="showBioModal"></i>
            </div>
        </div>
        <AppFooter :logoImage="logoImage" />
        <div v-if="showModal" class="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div class="modal-content bg-white p-4 rounded-lg w-3/4 max-w-lg">
                <pre class="whitespace-pre-wrap" v-html="modalContent"></pre>
                <button @click="closeModal" class="mt-4 p-2 bg-blue-500 text-white rounded">Close</button>
            </div>
        </div>
        <div ref="youtubePlayer" style="display:none;"></div>
    </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import _ from 'lodash';

export default {
    name: 'AppMusics',
    components: {
        AppHeader,
        AppFooter
    },
    data() {
        return {
            searchQuery: '',
            searchResults: { tracks: [], artists: [] },
            latestTracks: [],
            currentTrack: null,
            youtubeVideoId: null,
            spotifyToken: '',
            lyrics: null,
            artistBio: null,
            isPlaying: false,
            volume: 50,
            currentTime: 0,
            duration: 0,
            isDarkMode: false,
            showModal: false,
            modalTitle: '',
            modalContent: '',
            headerImage: require('@/assets/images/skeleton/header.png'),
            logoImage: require('@/assets/images/skeleton/logo.gif'),
            cache: {},
            player: null,
            nextPage: 1,
            loading: false,
            noMorePosts: false,
            lyricsTimer: null
        };
    },
    computed: {
        volumeIcon() {
            if (this.volume === 0) return 'fas fa-volume-mute';
            if (this.volume <= 50) return 'fas fa-volume-down';
            return 'fas fa-volume-up';
        }
    },
    methods: {
        async fetchSpotifyToken() {
            const clientId = 'c977a9c0addb40fb8ce10dfefd5bbf81';
            const clientSecret = '2ec6a460145f44fc845dfc771f5f701b';
            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                new URLSearchParams({
                    grant_type: 'client_credentials',
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                    },
                }
            );
            this.spotifyToken = response.data.access_token;
        },
        async fetchLatestTracks() {
            const cacheKey = 'latestTracks';
            if (this.cache[cacheKey]) {
                this.latestTracks = this.cache[cacheKey];
                return;
            }

            try {
                await this.fetchSpotifyToken();
                const response = await this.retryRequest(
                    'https://api.spotify.com/v1/browse/new-releases',
                    {
                        headers: {
                            Authorization: `Bearer ${this.spotifyToken}`,
                        },
                    }
                );

                if (response.data && response.data.albums && response.data.albums.items) {
                    const tracks = response.data.albums.items.map((album) => album.tracks?.items || []).flat().slice(0, 8);
                    this.latestTracks = tracks.filter(track => track); // filter out undefined tracks
                    this.cache[cacheKey] = this.latestTracks;
                } else {
                    console.error('Unexpected response structure:', response.data);
                    this.latestTracks = [];
                }
            } catch (error) {
                console.error('Error fetching latest tracks:', error);
                this.latestTracks = [];
            }
        },
        async searchMusic(page = 1) {
            if (this.searchQuery.trim() === '') {
                this.searchResults = { tracks: [], artists: [] };
                return;
            }

            const cacheKey = `search_${this.searchQuery}_page_${page}`;
            if (this.cache[cacheKey]) {
                this.updateSearchResults(this.cache[cacheKey], page);
                return;
            }

            try {
                const response = await this.retryRequest(
                    'https://api.spotify.com/v1/search',
                    {
                        headers: {
                            Authorization: `Bearer ${this.spotifyToken}`,
                        },
                        params: {
                            q: this.searchQuery,
                            type: 'track,artist',
                            limit: 20,
                            offset: (page - 1) * 20,
                        },
                    }
                );

                if (response.data) {
                    this.updateSearchResults(response.data, page);
                    this.cache[cacheKey] = response.data;
                } else {
                    console.error('Unexpected response structure:', response.data);
                    if (page === 1) this.searchResults = { tracks: [], artists: [] };
                }
            } catch (error) {
                console.error('Error searching music:', error);
                if (page === 1) this.searchResults = { tracks: [], artists: [] };
            }
        },
        updateSearchResults(data, page) {
            if (page === 1) {
                this.searchResults = { tracks: this.filterUnique(data.tracks.items), artists: data.artists.items };
            } else {
                this.searchResults.tracks.push(...this.filterUnique(data.tracks.items));
                this.searchResults.artists.push(...data.artists.items);
            }
            if (data.tracks.items.length === 0 && data.artists.items.length === 0) {
                this.noMorePosts = true;
            }
            this.nextPage = page + 1;
        },
        filterUnique(tracks) {
            const uniqueTracks = [];
            const trackIds = new Set();
            tracks.forEach((track) => {
                if (!trackIds.has(track.id)) {
                    uniqueTracks.push(track);
                    trackIds.add(track.id);
                }
            });
            return uniqueTracks;
        },
        async checkTrackExists(spotifyId) {
            try {
                const response = await axios.get(`http://localhost:8080/tracks/${spotifyId}`);
                return response.data.exists;
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log('Track not found:', spotifyId);
                } else {
                    console.error('Error checking track existence:', error);
                }
                return false;
            }
        },
        async playTrack(track) {
            this.currentTrack = track;
            const query = `${track.name} ${track.artists[0].name}`;
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        q: query,
                        key: 'AIzaSyBDrrXAygbwfJkv7nAzeXWPTAIE3DfCRgI',
                        type: 'video',
                    },
                });
                if (response.data && response.data.items && response.data.items.length > 0) {
                    this.youtubeVideoId = response.data.items[0].id.videoId;
                    await this.initializePlayer();
                } else {
                    console.error('No YouTube video found for the track:', track);
                    this.youtubeVideoId = null;
                }
            } catch (error) {
                console.error('Error fetching YouTube video:', error);
                this.youtubeVideoId = null;
            }
        },
        async initializePlayer() {
            await this.loadYouTubeApi();
            if (!this.player) {
                this.player = new window.YT.Player(this.$refs.youtubePlayer, {
                    videoId: this.youtubeVideoId,
                    events: {
                        'onReady': this.onPlayerReady,
                        'onStateChange': this.onPlayerStateChange
                    }
                });
            } else {
                this.player.loadVideoById(this.youtubeVideoId);
            }
        },
        loadYouTubeApi() {
            return new Promise((resolve) => {
                if (window.YT) {
                    resolve();
                    return;
                }
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                window.onYouTubeIframeAPIReady = () => resolve();
            });
        },
        onPlayerReady(event) {
            event.target.playVideo();
            this.isPlaying = true;
            this.setVolume(this.volume);
            this.duration = event.target.getDuration();
            this.updateTime();
            this.syncLyrics();
        },
        onPlayerStateChange(event) {
            if (event.data === window.YT.PlayerState.ENDED) {
                this.isPlaying = false;
                clearInterval(this.lyricsTimer);
            }
        },
        playVideo() {
            if (this.player) {
                this.player.playVideo();
                this.isPlaying = true;
                this.syncLyrics();
            }
        },
        pauseVideo() {
            if (this.player) {
                this.player.pauseVideo();
                this.isPlaying = false;
                clearInterval(this.lyricsTimer);
            }
        },
        togglePlayPause() {
            if (this.isPlaying) {
                this.pauseVideo();
            } else {
                this.playVideo();
            }
        },
        changeVolume(event) {
            const volume = event.target.value;
            this.volume = volume;
            this.setVolume(volume);
        },
        setVolume(volume) {
            if (this.player) {
                this.player.setVolume(volume);
            }
        },
        seek(event) {
            const time = event.target.value;
            this.currentTime = time;
            if (this.player) {
                this.player.seekTo(time, true);
                this.syncLyrics();
            }
        },
        updateTime() {
            if (this.player && this.isPlaying) {
                this.currentTime = this.player.getCurrentTime();
                requestAnimationFrame(this.updateTime);
            }
        },
        showLyricsModal() {
            this.fetchLyrics(this.currentTrack).then(() => {
                this.modalTitle = 'Lyrics';
                this.modalContent = this.lyrics ? this.formatLyrics(this.lyrics) : 'Lyrics not available.';
                this.showModal = true;
            });
        },
        formatLyrics(lyrics) {
            // Placeholder for formatting lyrics to sync with the music
            return lyrics.split('\n').map((line, index) => `<span class="lyric-line" data-index="${index}">${line}</span>`).join('<br>');        },
        showBioModal() {
            this.fetchArtistBio(this.currentTrack).then(() => {
                this.modalTitle = 'Biography';
                this.modalContent = this.artistBio;
                this.showModal = true;
            });
        },
        closeModal() {
            this.showModal = false;
            clearInterval(this.lyricsTimer);
        },
        async fetchLyrics(track) {
            if (!track || !track.name || !track.artists || !track.artists[0].name) return;

            try {
                const response = await axios.get('https://api.lyrics.ovh/v1/' + track.artists[0].name + '/' + track.name);
                if (response.data && response.data.lyrics) {
                    this.lyrics = response.data.lyrics;
                } else {
                    console.error('No lyrics found for the track:', track);
                    this.lyrics = 'Lyrics not available.';
                }
            } catch (error) {
                console.error('Error fetching lyrics:', error);
                this.lyrics = 'Error fetching lyrics.';
            }
        },
        async fetchArtistBio(track) {
            if (!track || !track.artists || !track.artists[0].name) return;

            try {
                const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(track.artists[0].name)}`);
                if (response.data && response.data.extract) {
                    this.artistBio = response.data.extract;
                } else {
                    console.error('No biography found for the artist:', track.artists[0].name);
                    this.artistBio = 'Biography not available.';
                }
            } catch (error) {
                console.error('Error fetching artist biography:', error);
                this.artistBio = 'Error fetching biography.';
            }
        },
        async storeTrack(trackData) {
            try {
                await axios.post('http://localhost:8080/tracks', trackData);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log('API endpoint for storing track not found');
                } else {
                    console.error('Error storing track:', error);
                }
            }
        },
        async retryRequest(url, options, retries = 3, delay = 1000) {
            for (let i = 0; i < retries; i++) {
                try {
                    return await axios.get(url, options);
                } catch (error) {
                    if (i < retries - 1 && error.response && error.response.status === 429) {
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    } else {
                        throw error;
                    }
                }
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
        handleScroll() {
            const bottomOfWindow = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.loading && !this.noMorePosts) {
                this.loading = true;
                this.searchMusic(this.nextPage).finally(() => this.loading = false);
            }
        },
        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        },
        syncLyrics() {
            clearInterval(this.lyricsTimer);
            const lyricsLines = document.querySelectorAll('.lyric-line');
            this.lyricsTimer = setInterval(() => {
                const currentTime = this.player.getCurrentTime();
                lyricsLines.forEach((line) => {
                    const lineTime = parseFloat(line.getAttribute('data-time'));
                    if (currentTime >= lineTime) {
                        line.classList.add('current-line');
                    } else {
                        line.classList.remove('current-line');
                    }
                });
            }, 100);
        }

    },
    created() {
        this.fetchSpotifyToken().then(() => {
            this.fetchLatestTracks();
        });
        this.debouncedSearchMusic = _.debounce(() => this.searchMusic(1), 300);
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        clearInterval(this.lyricsTimer);
    },
};
</script>

<style scoped>
.search-bar {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 5px;
    border: 1px solid #ddd;
}

.latest-releases,
.search-results {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.artist-item {
    cursor: pointer;
    text-align: center;
}

.artist-item img {
    width: 100%;
    height: auto;
    border-radius: 50%;
}

.track-item {
    cursor: pointer;
    text-align: center;
}

.track-item img {
    width: 100%;
    height: auto;
    border-radius: 10px;
}

.music-player {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #1c1c1c;
    color: #fff;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.track-info {
    flex: 1;
    margin-left: 20px;
}

.controls {
    display: flex;
    align-items: center;
}

.control-icon {
    font-size: 1.5em;
    cursor: pointer;
    margin: 0 10px;
}

.volume-slider {
    width: 100px;
    margin-left: 10px;
}

.progress-bar-container {
    flex: 1;
    margin-left: 20px;
}

.progress-bar {
    width: 100%;
    cursor: pointer;
}

.modal {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.7);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
}

.youtube-player {
    display: none;
}

.volume-icon {
    transition: transform 0.2s ease-in-out;
}

.current-line {
    color: blue;
}
</style>
