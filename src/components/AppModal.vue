<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-2">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
                <button @click="$emit('close')" class="text-gray-700 dark:text-gray-200"
                    :disabled="disableClose">&times;</button>
            </div>
            <div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppModal',
    props: {
        title: {
            type: String,
            default: 'Modal Title'
        },
        disableClose: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style scoped>
/* Add your custom styles here if needed */
</style>
