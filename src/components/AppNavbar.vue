<!-- AppNavbar.vue -->
<template>
    <nav class="flex items-center justify-between p-4 h-40">
        <div class="flex items-center">
            <!-- Logo or application name -->
            <span class="text-white text-lg font-bold">Mon Application</span>
        </div>
        <div class="flex items-center">
            <!-- Dark Mode / Light Mode button -->
            <button class="text-white mr-4">
                <i class="fas fa-sun"></i> <!-- Icon for light mode -->
            </button>
            <!-- Logout button -->
            <button @click="logout" class="text-white mr-4">Déconnexion</button>
            <!-- Client access button -->
            <router-link to="/client" class="text-white">Client</router-link>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'AppNavbar', // Update component name
    methods: {
        async logout() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                });
                if (!response.ok) {
                    throw new Error('Logout failed');
                }
                localStorage.removeItem('token');
                this.$router.push('/login'); // Redirect to login page after successful logout
            } catch (error) {
                console.error('Logout error:', error);
                // Handle error if logout fails
            }
        }
    }
};
</script>

<style scoped>
/* Add Tailwind or custom styles as needed */
</style>
