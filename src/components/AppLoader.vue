<template>
    <div v-if="loading" class="loader">
        <div class="spinner"></div>
    </div>
</template>

<script>
export default {
    name: 'AppLoader',
    data() {
        return {
            loading: true
        };
    },
    mounted() {
        window.addEventListener('load', this.hideLoader);
    },
    methods: {
        hideLoader() {
            this.loading = false;
        }
    }
};
</script>

<style scoped>
.loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(229,229,229,1) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.spinner {
    width: 120px;
    height: 120px;
    border: 16px solid transparent;
    border-top: 16px solid #3498db;
    border-right: 16px solid #f39c12;
    border-bottom: 16px solid #e74c3c;
    border-left: 16px solid #9b59b6;
    border-radius: 50%;
    animation: spin 2s linear infinite, pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    
    50% {
        transform: scale(1.1);
    }
}
</style>
