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
                    :methodOnChange="'saveSetting'"></setting-mode>

      <label>
        Start time
        <input type="text" id="start-time"
               v-model="startTime"
               v-on:change=""/>
      </label>

      <label>
        End time
        <input type="text" id="end-time"
               v-model="endTime"
               v-on:change=""/>
      </label>

      <button type="button"
              class="btn btn-cut"
              :class="{disabled: startTime === '' || endTime === ''}"
              v-on:click="">Cut video
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
        endTime: ''
      }
    },
    methods: {
      saveSetting (type) {
        let settings = APP_SETTING.getData()

        if (type === 'mode') {
          //todo: Not allow change mode when cutting
          let isCutting = false

          //todo: Revert mode if changed when cutting
          if (isCutting)
            this.overrideMode = !this.overrideMode

          settings.cutOverrideMode = this.overrideMode
        }

        if (type === 'filePrefix') {
          if (!this.overrideMode && this.filePrefix !== '') {
            settings.cutFilePrefix = this.filePrefix
          }
        }

        APP_SETTING.setData(settings)
      },
      loadVideo (files) {
        console.log(files[0])
        this.videoPlayer = `<video controls style="width: 100%"><source src="${files[0].path}" type="video/mp4"></video>`
      }
    }
  }
</script>
