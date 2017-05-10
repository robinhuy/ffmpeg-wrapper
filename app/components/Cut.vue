<template>
  <div>
    <h1>Cut video</h1>

    <upload-zone :allowedExtension="allowedExtension"
                 :isMultiple="false"
                 :methodOnSelect="'loadVideo'"></upload-zone>

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
      }
    },
    methods: {
      loadVideo (a) {
        console.log('abc',a)
      }
    }
  }
</script>
