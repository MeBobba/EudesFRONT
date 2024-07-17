<!-- AppHeader.vue -->
<template>
    <div class="relative h-40">
        <div class="absolute inset-0 bg-cover bg-center" :style="headerStyle"></div>
        <div class="relative bg-gray-900 bg-opacity-75">
            <AppNavbar />
        </div>
    </div>
</template>

<script>
import AppNavbar from './AppNavbar.vue'; // Update import to use multi-word component name

export default {
    name: 'AppHeader', // Update component name
    components: {
        AppNavbar
    },
    props: {
        headerImage: {
            type: String,
            required: true
        }
    },
    computed: {
        headerStyle() {
            return {
                backgroundImage: `url(${this.headerImage})`
            };
        }
    }
};
</script>

<style scoped>
/* Add Tailwind or custom styles as needed */
</style>