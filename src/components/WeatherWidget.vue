<template>
    <div class="weather-widget">
        <h2 class="text-xl font-bold mb-4">{{ $t('weather.title') }}</h2>
        <div v-if="weatherData">
            <div class="flex items-center mb-2">
                <div class="weather-icon mr-4">
                    <img :src="weatherIcon" alt="Weather Icon" class="w-12 h-12">
                </div>
                <div>
                    <p class="text-2xl font-semibold">{{ Math.round(weatherData.main.temp) }}°C</p>
                    <p class="text-sm text-gray-600">{{ capitalizeFirstLetter(weatherData.weather[0]?.description) }}
                    </p>
                </div>
            </div>
            <p class="text-sm text-gray-600">{{ $t('weather.location') }}: {{ weatherData.name }}</p>
        </div>
        <div v-else>
            <p>{{ $t('weather.loading') }}</p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            weatherData: null,
            apiKey: process.env.OPENWEATHER_API || '4b8252bd93f427cf1c62ed0496be916b', // Remplacez par votre clé API OpenWeatherMap
        };
    },
    computed: {
        weatherIcon() {
            const icons = {
                clear: require('@/assets/icons/sun.svg'),
                clouds: require('@/assets/icons/cloud.svg'),
                rain: require('@/assets/icons/rain.svg'),
                drizzle: require('@/assets/icons/drizzle.svg'),
                thunderstorm: require('@/assets/icons/thunderstorm.svg'),
                snow: require('@/assets/icons/snow.svg'),
                mist: require('@/assets/icons/fog.svg'),
                smoke: require('@/assets/icons/fog.svg'),
                haze: require('@/assets/icons/fog.svg'),
                fog: require('@/assets/icons/fog.svg'),
                default: require('@/assets/icons/unknown.svg')
            };

            if (this.weatherData && this.weatherData.weather && this.weatherData.weather.length) {
                const weatherCondition = this.weatherData.weather[0].main.toLowerCase();
                return icons[weatherCondition] || icons.default;
            }

            return '';
        }
    },
    watch: {
        '$i18n.locale': {
            handler() {
                this.getLocationAndWeather();
            },
            immediate: true
        }
    },
    methods: {
        getLocationAndWeather() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.fetchWeather, this.handleLocationError);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        },
        async fetchWeather(position) {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=${this.$i18n.locale}&appid=${this.apiKey}`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Failed to fetch weather data');
                this.weatherData = await response.json();
            } catch (error) {
                this.handleApiError(error);
            }
        },
        handleLocationError(error) {
            console.error("Error getting location:", error);
            alert("Unable to retrieve your location for weather information.");
        },
        handleApiError(error) {
            console.error("Error fetching weather data:", error);
            alert("An error occurred while fetching weather data.");
        },
        capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }
};
</script>

<style scoped>
.weather-widget {
    text-align: left;
}

.weather-icon img {
    width: 48px;
    height: 48px;
}
</style>
