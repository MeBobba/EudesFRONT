// youtubeApiLoader.js
let isYouTubeApiLoaded = false;
let youtubeApiPromise = null;

export function loadYouTubeApi() {
    if (isYouTubeApiLoaded) {
        return Promise.resolve();
    }

    if (youtubeApiPromise) {
        return youtubeApiPromise;
    }

    youtubeApiPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onload = () => {
            window.onYouTubeIframeAPIReady = () => {
                isYouTubeApiLoaded = true;
                resolve();
            };
        };
        document.head.appendChild(script);
    });

    return youtubeApiPromise;
}
