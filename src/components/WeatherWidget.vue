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
            if (!this.weatherData || !this.weatherData.weather || !this.weatherData.weather.length) {
                return ''; // S'assurer que weatherData et weather sont définis et non vides
            }

            const weatherCondition = this.weatherData.weather[0].main.toLowerCase();
            switch (weatherCondition) {
                case 'clear':
                    return require('@/assets/icons/sun.svg');
                case 'clouds':
                    return require('@/assets/icons/cloud.svg');
                case 'rain':
                    return require('@/assets/icons/rain.svg');
                case 'drizzle':
                    return require('@/assets/icons/drizzle.svg');
                case 'thunderstorm':
                    return require('@/assets/icons/thunderstorm.svg');
                case 'snow':
                    return require('@/assets/icons/snow.svg');
                case 'mist':
                case 'smoke':
                case 'haze':
                case 'fog':
                    return require('@/assets/icons/fog.svg');
                default:
                    return require('@/assets/icons/unknown.svg'); // Pour les conditions inconnues
            }
        }
    },
    watch: {
        '$i18n.locale': {
            handler() {
                // Recharger les données météo avec la nouvelle langue
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
                this.weatherData = await response.json();
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }
        },
        handleLocationError(error) {
            console.error("Error getting location:", error);
            alert("Unable to retrieve your location for weather information.");
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
