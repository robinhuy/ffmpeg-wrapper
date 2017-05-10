<template>
  <div>
    <h1>Cut video</h1>

    <upload-zone :selectedFiles="'selectedFiles'" :allowedExtension="allowedExtension" :isMultiple="false"></upload-zone>

    <div v-html="videoPlayer"></div>
  </div>
</template>

<style scoped>

</style>

<script>
  import UploadZone from './UploadZone.vue'

  export default {
    name: 'cut',
    components: {
      UploadZone
    },
    props: ['allowedExtension'],
    data () {
      return {
        videoPlayer: '',
        selectedFiles: []
      }
    },
    methods: {
      loadVideo () {

      }
    }
  }
</script>
