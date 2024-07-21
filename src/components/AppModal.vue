<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-1/2">
            <div class="flex justify-between items-center border-b pb-2 mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200">
                    <slot name="header"></slot>
                </h3>
                <button @click="$emit('close')"
                    class="text-gray-900 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppModal'
};
</script>

<style scoped></style>