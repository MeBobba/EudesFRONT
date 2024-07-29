<template>
    <transition name="fade">
        <div v-if="isIdle" class="fixed top-0 left-0 w-full bg-red-500 text-white p-4 text-center z-50">
            Attention, le verrouillage de ta session se fera dans : {{ countdown }}
        </div>
    </transition>
</template>

<script>
export default {
    data() {
        return {
            isIdle: false,
            countdown: 10,
            idleTimeout: null,
            countdownInterval: null,
        };
    },
    mounted() {
        this.startIdleTimer();
        window.addEventListener('mousemove', this.resetIdleTimer);
        window.addEventListener('keydown', this.resetIdleTimer);
        window.addEventListener('scroll', this.resetIdleTimer);
    },
    beforeUnmount() {
        window.removeEventListener('mousemove', this.resetIdleTimer);
        window.removeEventListener('keydown', this.resetIdleTimer);
        window.removeEventListener('scroll', this.resetIdleTimer);
        clearTimeout(this.idleTimeout);
        clearInterval(this.countdownInterval);
    },
    methods: {
        startIdleTimer() {
            this.idleTimeout = setTimeout(() => {
                this.isIdle = true;
                this.startCountdown();
            }, 1 * 60 * 1000); // 1 minute pour tester, ajustez à 5 minutes pour la production
        },
        resetIdleTimer() {
            clearTimeout(this.idleTimeout);
            clearInterval(this.countdownInterval);
            this.isIdle = false;
            this.countdown = 10;
            this.startIdleTimer();
        },
        startCountdown() {
            this.countdownInterval = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                } else {
                    clearInterval(this.countdownInterval);
                    localStorage.setItem('isLocked', 'true');
                    this.$router.push('/lock');
                }
            }, 1000);
        },
    },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
    {
    opacity: 0;
}
</style>
