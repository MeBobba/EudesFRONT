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
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.spinner {
    border: 16px solid #f3f3f3;
    border-top: 16px solid #3498db;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>