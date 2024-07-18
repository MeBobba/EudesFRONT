<template>
    <div :class="{ 'bg-gray-800 text-white': isDarkMode, 'bg-white text-black': !isDarkMode }"
        class="w-full p-4 bg-cover bg-center rounded-lg shadow-md relative"
        :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
        <div class="relative flex items-center justify-between">
            <div
                class="relative w-32 h-32 bg-yellow-500 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center">
                <img v-if="user && user.look" class="transform scale-125 translate-y-2"
                    :src="`http://www.habbo.com/habbo-imaging/avatarimage?figure=${user.look}&direction=3&head_direction=3&gesture=nor&action=null&size=l&headonly=0&img_format=gif`"
                    alt="Profile" />
            </div>
            <div class="flex-1 ml-4">
                <h2 class="text-2xl font-semibold text-white relative">{{ user.username }}</h2>
                <div class="flex space-x-4 mt-2">
                    <div class="text-center text-white relative">
                        <span class="font-bold">{{ user.credits }}</span>
                        <div class="text-gray-300">Crédits</div>
                    </div>
                    <div class="text-center text-white relative">
                        <span class="font-bold">{{ user.pixels }}</span>
                        <div class="text-gray-300">Pixels</div>
                    </div>
                    <div class="text-center text-white relative">
                        <span class="font-bold">{{ user.points }}</span>
                        <div class="text-gray-300">Points</div>
                    </div>
                </div>
            </div>
            <router-link to="/settings"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg relative">Settings</router-link>
            <router-link to="/client"
                class="ml-5 px-4 py-2 bg-green-500 text-white rounded-lg relative">Play Now</router-link>
        </div>
        <div class="relative mt-4">
            <p class="text-gray-300">{{ user.motto }}</p>
        </div>
        <div class="relative grid grid-cols-3 gap-4 mt-6">
            <div v-for="post in user.posts" :key="post.id" class="relative">
                <img :src="post.image" alt="Post Image" class="w-full h-48 object-cover rounded-lg" />
                <div
                    class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <fa-icon :icon="['fas', 'heart']" class="text-white mr-2" />
                    <span class="text-white">{{ post.likes }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import backgroundImage from '@/assets/images/skeleton/topbg.png'

library.add(faHeart)

export default {
    components: {
        'fa-icon': FontAwesomeIcon
    },
    props: {
        user: {
            type: Object,
            required: true
        },
        isDarkMode: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            backgroundImage
        }
    }
}
</script>

<style scoped>
/* Add custom styles here if needed */
</style>