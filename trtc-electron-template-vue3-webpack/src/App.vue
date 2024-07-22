<template>
  <h1>
    TRTC SDK version:{{ sdkVersion }}
  </h1>
  <router-view/>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Ref} from 'vue';
import TRTCCloud from 'trtc-electron-sdk';

const sdkVersion: Ref<string> = ref('');

onMounted(() => {
  const trtcCloud = TRTCCloud.getTRTCShareInstance();
  sdkVersion.value = trtcCloud.getSDKVersion();
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
