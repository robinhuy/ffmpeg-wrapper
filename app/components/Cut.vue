<template>
  <div>
    <h1>Cut video</h1>

    <upload-zone :allowedExtension="allowedExtension"
                 :isMultiple="false"
                 :methodOnSelect="'loadVideo'"></upload-zone>

    <div v-html="videoPlayer" id="video-player"></div>

    <div id="setup">
      <setting-mode :overrideMode="overrideMode"
                    :filePrefix="filePrefix"
                    :canChangeSetting="canChangeSetting"
                    :overrideModeProp="'overrideMode'"
                    :filePrefixProp="'filePrefix'"
                    :componentName="'cut'"></setting-mode>

      <label>
        Start time
        <input type="text" id="start-time"
               v-model="startTime"
               @change=""/>
      </label>

      <label>
        End time
        <input type="text" id="end-time"
               v-model="endTime"
               @change=""/>
      </label>

      <button type="button"
              class="btn btn-cut"
              :class="{disabled: startTime === '' || endTime === ''}"
              @click="cutVideo">Cut video
      </button>
    </div>
  </div>
</template>

<style scoped>
  #video-player {
    float: left;
    width: 70%;
  }

  #setup {
    float: left;
    width: 30%;
  }
</style>

<script>
  import SettingMode from './SettingMode.vue'
  import UploadZone from './UploadZone.vue'

  export default {
    name: 'cut',
    components: {
      SettingMode,
      UploadZone
    },
    props: ['allowedExtension'],
    data () {
      return {
        overrideMode: false,
        filePrefix: 'cut-',
        videoPlayer: '<video controls style="width: 100%"><source src="" type="video/mp4"></video>`',
        startTime: '00:00:00',
        endTime: '',
        video: null
      }
    },
    computed: {
      canChangeSetting () {
        return true
      }
    },
    methods: {
      loadVideo (files) {
        this.video = files[0]
        this.videoPlayer = `<video controls style="width: 100%"><source src="${this.video.path}" type="video/mp4"></video>`
      },
      cutVideo () {

      }
    }
  }
</script>
