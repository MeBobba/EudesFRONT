<!-- ErrorMessage.vue -->
<template>
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Oops!</strong>
        <span class="block sm:inline">{{ message }}</span>
    </div>
</template>

<script>
export default {
    props: {
        message: {
            type: String,
            required: true
        }
    }
};
</script>

<style scoped>
/* Add Tailwind classes and custom styles as needed */
</style>