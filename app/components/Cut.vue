<template>
  <div>
    <h1>Cut video</h1>

    <input type="file" v-on:change="chooseFiles" :accept="this.allowedExtension.join(',')"/>

    <div v-html="videoPlayer"></div>
  </div>
</template>

<style scoped>

</style>

<script>
  export default {
    name: 'cut',
    data () {
      return {
        videoPlayer: ''
      }
    },
    methods: {

    }
  }
</script>
