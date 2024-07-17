<!-- UserCard.vue -->
<template>
    <div class="bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl mb-6 text-center">Dashboard</h2>
        <p class="mb-2"><strong>Username:</strong> {{ user.username }}</p>
        <p class="mb-2"><strong>Email:</strong> {{ user.mail }}</p>
        <p class="mb-2"><strong>Real Name:</strong> {{ user.real_name }}</p>
        <p class="mb-2"><strong>Rankcc:</strong> {{ user.rank }}</p>
    </div>
</template>

<script>
export default {
    props: {
        user: {
            type: Object,
            required: true
        }
    }
};
</script>

<style scoped>
/* Add Tailwind classes and custom styles as needed */
</style>