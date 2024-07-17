<!-- src/views/AppError500.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="text-center">
            <h1 class="text-6xl font-bold mb-4">500</h1>
            <p class="text-2xl mb-8">Internal Server Error</p>
            <router-link to="/" class="text-blue-500 hover:underline">Go to Home</router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppError500'
};
</script>