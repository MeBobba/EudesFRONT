<!-- src/views/AppError.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="text-center">
            <h1 class="text-6xl font-bold mb-4">{{ statusCode }}</h1>
            <p class="text-2xl mb-8">{{ message }}</p>
            <router-link to="/" class="text-blue-500 hover:underline">{{ $t('gotohome') }}</router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppError',
    props: {
        statusCode: {
            type: Number,
            required: true
        },
        message: {
            type: String,
            required: true
        }
    }
};
</script>