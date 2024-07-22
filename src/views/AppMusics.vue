<template>
    <div :class="{ 'bg-gray-900 text-white': isDarkMode, 'bg-gray-100 text-black': !isDarkMode }"
        class="min-h-screen font-ubuntu transition-all">
        <AppHeader :logoImage="logoImage" :headerImage="headerImage" @toggleDarkMode="toggleDarkMode"
            @logout="logout" />
        <div class="container mx-auto px-4 py-8">
            <input type="text" v-model="searchQuery" @input="debouncedSearchMusic" placeholder="Search for music..."
                class="search-bar transition-transform duration-300 ease-in-out transform hover:scale-105" />
            <section v-if="!searchQuery">
                <h2 class="text-2xl font-semibold mb-4">Latest Releases</h2>
                <div class="latest-releases grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div v-for="track in latestTracks" :key="track.id"
                        class="track-item transition-transform duration-300 ease-in-out transform hover:scale-105"
                        @click="playTrack(track)">
                        <img :src="track.album.images[0]?.url || ''" :alt="track.name" class="w-full h-auto rounded-lg"
                            v-if="track.album.images.length > 0" />
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
                    <h3 class="text-xl font-semibold mb-2">Songs</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div v-for="result in searchResults.tracks" :key="result.id"
                            class="track-item transition-transform duration-300 ease-in-out transform hover:scale-105"
                            @click="playTrack(result)">
                            <img :src="result.album.images[0]?.url || ''" :alt="result.name"
                                class="w-full h-auto rounded-lg" v-if="result.album.images.length > 0" />
                            <div class="mt-2">
                                <h3 class="text-lg font-medium">{{ result.name }}</h3>
                                <p class="text-sm text-gray-500">{{ result.artists[0].name }}</p>
                            </div>
                        </div>
                    </div>
                    <h3 class="text-xl font-semibold mt-4 mb-2">Artists</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div v-for="artist in searchResults.artists" :key="artist.id"
                            class="artist-item transition-transform duration-300 ease-in-out transform hover:scale-105">
                            <img :src="artist.images[0]?.url || ''" :alt="artist.name" class="w-16 h-16 rounded-full"
                                v-if="artist.images.length > 0" />
                            <div class="mt-2">
                                <h3 class="text-lg font-medium">{{ artist.name }}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <div v-if="currentTrack"
            class="music-player fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex flex-col sm:flex-row items-center justify-between rounded-t-lg shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105">
            <div class="flex items-center mb-4 sm:mb-0">
                <img :src="currentTrack.album.images[0]?.url || ''" alt="Album cover" class="w-16 h-16 rounded-lg"
                    v-if="currentTrack.album.images.length > 0" />
                <div class="track-info ml-4">
                    <h3 class="text-lg font-medium">{{ currentTrack.name }}</h3>
                    <p class="text-sm text-gray-400">{{ currentTrack.artists[0].name }}</p>
                </div>
            </div>
            <div class="controls flex items-center flex-1 mx-4 mb-4 sm:mb-0">
                <i class="fas fa-step-backward control-icon mx-2" @click="previousTrack"></i>
                <i :class="[isPlaying ? 'fas fa-pause' : 'fas fa-play']" @click="togglePlayPause"
                    class="control-icon mx-2"></i>
                <i class="fas fa-step-forward control-icon mx-2" @click="nextTrack"></i>
                <span class="mx-2">{{ formatTime(currentTime) }}</span>
                <input type="range" min="0" :max="duration" v-model="currentTime" @input="seek" @change="updateSeek"
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
            <div class="modal-content bg-white p-4 rounded-lg w-3/4 max-w-lg max-h-screen overflow-y-auto">
                <pre class="whitespace-pre-wrap font-ubuntu text-sm" v-html="modalContent"></pre>
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
            lyricsTimer: null,
            seekUpdate: false,
            similarTracks: []
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
            const clientId = process.env.VUE_APP_SPOTIFY_CLIENT_ID;
            const clientSecret = process.env.VUE_APP_SPOTIFY_CLIENT_SECRET;
            try {
                const response = await axios.post(
                    'https://accounts.spotify.com/api/token',
                    new URLSearchParams({ grant_type: 'client_credentials' }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                        },
                    }
                );
                this.spotifyToken = response.data.access_token;
            } catch (error) {
                console.error('Error fetching Spotify token:', error);
            }
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
                    'https://api.spotify.com/v1/browse/new-releases?limit=10',
                    { headers: { Authorization: `Bearer ${this.spotifyToken}` } }
                );
                if (response.data && response.data.albums && Array.isArray(response.data.albums.items)) {
                    this.latestTracks = response.data.albums.items.map(album => ({
                        id: album.id,
                        name: album.name,
                        artists: album.artists,
                        album: { images: album.images }
                    }));
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
            if (!this.searchQuery.trim()) {
                this.searchResults = { tracks: [], artists: [] };
                return;
            }
            const cacheKey = `search_${this.searchQuery}_page_${page}`;
            if (this.cache[cacheKey]) {
                this.updateSearchResults(this.cache[cacheKey], page);
                return;
            }
            try {
                const response = await axios.get('https://api.spotify.com/v1/search', {
                    headers: { Authorization: `Bearer ${this.spotifyToken}` },
                    params: { q: this.searchQuery, type: 'track,artist', limit: 20, offset: (page - 1) * 20 }
                });
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
            this.noMorePosts = data.tracks.items.length === 0 && data.artists.items.length === 0;
            this.nextPage = page + 1;
        },
        filterUnique(tracks) {
            const trackIds = new Set(this.searchResults.tracks.map(track => track.id));
            return tracks.filter(track => !trackIds.has(track.id));
        },
        async playTrack(track, fromMounted = false) {
            this.currentTrack = track;
            this.resetPlayer();
            const query = `${track.name} ${track.artists[0].name}`;
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        q: query,
                        key: process.env.VUE_APP_YOUTUBE_API_KEY,
                        type: 'video'
                    }
                });
                if (response.data && response.data.items.length > 0) {
                    this.youtubeVideoId = response.data.items[0].id.videoId;
                    await this.initializePlayer(fromMounted);
                    localStorage.setItem('currentTrack', JSON.stringify(track));
                    if (!fromMounted) localStorage.setItem('currentTime', 0);
                } else {
                    console.error('No YouTube video found for the track:', track);
                    this.youtubeVideoId = null;
                }
            } catch (error) {
                console.error('Error fetching YouTube video:', error);
                this.youtubeVideoId = null;
            }
        },
        async initializePlayer(fromMounted = false) {
            await this.loadYouTubeApi();
            if (!this.player) {
                this.player = new window.YT.Player(this.$refs.youtubePlayer, {
                    videoId: this.youtubeVideoId,
                    events: {
                        onReady: (event) => this.onPlayerReady(event, fromMounted),
                        onStateChange: this.onPlayerStateChange
                    }
                });
            } else {
                // Vérifiez si loadVideoById existe avant de l'appeler
                if (this.player.loadVideoById) {
                    this.player.loadVideoById(this.youtubeVideoId);
                }
                if (fromMounted && this.player.cueVideoById) {
                    this.player.cueVideoById(this.youtubeVideoId);
                }
            }
        },
        loadYouTubeApi() {
            return new Promise((resolve) => {
                if (window.YT && window.YT.Player) {
                    resolve();
                    return;
                }
                if (!document.getElementById('youtube-iframe-api')) {
                    window.onYouTubeIframeAPIReady = () => resolve();
                    const tag = document.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    tag.id = 'youtube-iframe-api';
                    document.head.appendChild(tag);
                } else {
                    resolve();
                }
            });
        },
        onPlayerReady(event, fromMounted = false) {
            const savedTime = parseFloat(localStorage.getItem('currentTime')) || 0;
            if (savedTime && fromMounted) event.target.seekTo(savedTime, true);
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
                if (this.similarTracks.length > 0) {
                    this.playNextTrack();
                } else {
                    this.fetchSimilarTracks().then(() => {
                        if (this.similarTracks.length > 0) this.playNextTrack();
                    });
                }
            } else if (event.data === window.YT.PlayerState.PLAYING) {
                this.isPlaying = true;
                this.duration = this.player.getDuration();
                this.updateTime();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
                this.isPlaying = false;
            }
        },
        async playNextTrack() {
            if (this.similarTracks.length === 0) await this.fetchSimilarTracks();
            if (this.similarTracks.length > 0) {
                const nextTrack = this.similarTracks.shift();
                await this.playTrack(nextTrack);
            } else {
                console.warn('No similar tracks available.');
            }
        },
        async fetchSimilarTracks() {
            try {
                const response = await this.retryRequest(
                    'https://api.spotify.com/v1/recommendations',
                    {
                        headers: { Authorization: `Bearer ${this.spotifyToken}` },
                        params: { seed_tracks: this.currentTrack.id, limit: 10 }
                    }
                );
                if (response.data && response.data.tracks) {
                    this.similarTracks = response.data.tracks;
                } else {
                    console.error('No similar tracks found.');
                }
            } catch (error) {
                console.error('Error fetching similar tracks:', error);
            }
        },
        resetPlayer() {
            this.currentTime = 0;
            this.duration = 0;
            this.isPlaying = false;
        },
        async playVideo() {
            if (this.player && this.player.playVideo) {
                this.player.playVideo();
                this.isPlaying = true;
                this.syncLyrics();
            } else {
                await this.initializePlayer();
                if (this.player && this.player.playVideo) {
                    this.player.playVideo();
                    this.isPlaying = true;
                    this.syncLyrics();
                } else {
                    console.error('YouTube player is not properly initialized.');
                }
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
            this.isPlaying ? this.pauseVideo() : this.playVideo();
        },
        changeVolume(event) {
            this.volume = event.target.value;
            this.setVolume(this.volume);
        },
        setVolume(volume) {
            if (this.player) this.player.setVolume(volume);
        },
        seek(event) {
            const time = event.target.value;
            this.currentTime = time;
            if (this.player) {
                this.player.seekTo(time, true);
                this.syncLyrics();
                localStorage.setItem('currentTime', time);
            }
            this.seekUpdate = true;
        },
        updateSeek() {
            this.seekUpdate = false;
        },
        updateTime() {
            if (this.player && this.isPlaying) {
                if (!this.seekUpdate) {
                    this.currentTime = this.player.getCurrentTime();
                    localStorage.setItem('currentTime', this.currentTime);
                }
                requestAnimationFrame(this.updateTime);
            }
        },
        showLyricsModal() {
            this.fetchLyrics(this.currentTrack).then(() => {
                this.modalTitle = 'Lyrics';
                this.modalContent = this.lyrics ? this.formatLyrics(this.lyrics) : 'Lyrics not available.';
                this.showModal = true;
                this.syncLyrics();
            });
        },
        async fetchLyrics(track) {
            if (!track || !track.name || !track.artists || !track.artists[0].name) return;
            try {
                const response = await axios.get('https://api.musixmatch.com/ws/1.1/matcher.lyrics.get', {
                    params: {
                        q_track: track.name,
                        q_artist: track.artists[0].name,
                        apikey: process.env.VUE_APP_MUSIXMATCH_API_KEY
                    }
                });
                if (response.data.message.body.lyrics) {
                    this.lyrics = response.data.message.body.lyrics.lyrics_body;
                } else {
                    this.lyrics = 'Lyrics not available.';
                }
            } catch (error) {
                console.error('Error fetching lyrics:', error);
                this.lyrics = 'Network error. Please try again later.';
            }
        },
        formatLyrics(lyrics) {
            return lyrics.split('\n').map((line, index) =>
                `<span class="lyric-line" data-index="${index}" data-time="${index * 5}">${line}</span>`).join('<br>');
        },
        showBioModal() {
            this.fetchArtistBio(this.currentTrack).then(() => {
                this.modalTitle = 'Biography';
                this.modalContent = this.artistBio || 'Biography not available.';
                this.showModal = true;
            });
        },
        async fetchArtistBio(track) {
            if (!track || !track.artists || !track.artists[0].name) return;
            try {
                const response = await axios.get(`https://theaudiodb.com/api/v1/json/1/search.php?s=${encodeURIComponent(track.artists[0].name)}`);
                if (response.data.artists) {
                    this.artistBio = response.data.artists[0].strBiographyEN;
                } else {
                    this.artistBio = 'Biography not available.';
                }
            } catch (error) {
                console.error('Error fetching artist biography:', error);
                this.artistBio = 'Error fetching biography.';
            }
        },
        async retryRequest(url, options, retries = 3, delay = 1000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await axios.get(url, options);
                    return response;
                } catch (error) {
                    if (error.response && error.response.status === 429) {
                        const retryAfter = parseInt(error.response.headers['retry-after']) * 1000 || delay;
                        console.warn(`Rate limited. Retrying after ${retryAfter}ms...`);
                        await new Promise((resolve) => setTimeout(resolve, retryAfter));
                    } else {
                        throw error;
                    }
                }
            }
            throw new Error('Max retries reached');
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
                        line.classList.remove('upcoming-line');
                    } else {
                        line.classList.add('upcoming-line');
                        line.classList.remove('current-line');
                    }
                });
            }, 1000);
        },
        closeModal() {
            this.showModal = false;
        }
    },
    created() {
        this.fetchSpotifyToken().then(() => this.fetchLatestTracks());
        this.debouncedSearchMusic = _.debounce(() => this.searchMusic(1), 300);
        const savedTrack = localStorage.getItem('currentTrack');
        const savedTime = localStorage.getItem('currentTime');
        if (savedTrack) this.currentTrack = JSON.parse(savedTrack);
        if (savedTime) this.currentTime = parseFloat(savedTime);
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
        if (this.currentTrack) this.playTrack(this.currentTrack, true).then(() => this.playVideo());
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        clearInterval(this.lyricsTimer);
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap');

body {
    font-family: 'Ubuntu', sans-serif;
}

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

.search-results>div {
    grid-column: span 4;
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
    flex-direction: column;
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
    transition: transform 0.2s ease-in-out;
}

@media (min-width: 640px) {
    .music-player {
        flex-direction: row;
    }
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
    max-height: 80vh;
    overflow-y: auto;
}

.lyric-line.current-line {
    color: blue;
}

.lyric-line.upcoming-line {
    color: gray;
}

.youtube-player {
    display: none;
}

.volume-icon {
    transition: transform 0.2s ease-in-out;
}
</style>
