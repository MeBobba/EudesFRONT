<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-xl text-gray-600 mb-8">Sorry, this page isn't available.</p>
            <router-link to="/" class="text-blue-500 text-lg hover:underline">Go back to EudesCMS</router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppError404'
};
</script>

<style scoped>
/* Scoped styles for the 404 page */
.bg-gray-100 {
    background-color: #f0f0f0;
}

.text-blue-500 {
    color: #3897f0;
}

.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
