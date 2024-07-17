<template>
  <div id="app">
    <AppLoader />
    <router-view />
  </div>
</template>

<script>
import AppLoader from './components/AppLoader.vue';

export default {
  components: {
    AppLoader
  }
};
</script>
