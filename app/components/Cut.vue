<template>
  <div>
    <h1>Cut video</h1>

    <upload-zone :actionName="'cut'"
                 :allowedExtension="allowedExtension"
                 :isMultiple="false"
                 :methodOnSelect="'loadVideo'"></upload-zone>

    <div v-if="isRenderVideoPlayer" id="video-player">
      <video-player :video-source="videoSource" :video-type="videoType"></video-player>
    </div>

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
               v-model.trim="startTime"
               @change="validateDuration('startTime')"/>
        <button type="button"
                class="btn btn-set-time"
                @click="getCurrentTime('startTime')">Get current time
        </button>
      </label>

      <label>
        End time
        <input type="text" id="end-time"
               v-model.trim="endTime"
               @change="validateDuration('endTime')"/>
        <button type="button"
                class="btn btn-set-time"
                @click="getCurrentTime('endTime')">Get current time
        </button>
      </label>

      <button type="button"
              class="btn btn-cut"
              :class="{disabled: startTime === '' || endTime === ''}"
              @click="cutVideo">Cut video
      </button>
    </div>

    <div class="progress">
      <div class="progress-bar" :style="'width: ' + 10 + '%'"></div>
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
  import Utils from './Utils.vue'
  import SettingMode from './SettingMode.vue'
  import UploadZone from './UploadZone.vue'
  import VideoPlayer from './VideoPlayer.vue';

  export default {
    name: 'cut',
    components: {
      VideoPlayer,
      SettingMode,
      UploadZone
    },
    props: ['allowedExtension'],
    data () {
      return {
        overrideMode: false,
        filePrefix: 'cut-',
        isRenderVideoPlayer: true,
        videoSource: '',
        videoType: 'video/mp4',
        startTime: '00:00:00',
        endTime: '00:00:00',
        video: null,
        isCutting: false
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
        this.videoSource = files[0].path
        this.videoType = files[0].type

        // Re-render video-player component
        this.isRenderVideoPlayer = false
        setTimeout(() => {
          this.isRenderVideoPlayer = true
        }, 0)
      },
      validateDuration (input) {
        if (!this[input].match(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)) {
          alert('Invalid time')
        }
      },
      getCurrentTime (input) {
        let currentSecond = document.getElementsByTagName('video')[0].currentTime
        this[input] = Utils.convertTime(currentSecond)
      },
      cutVideo () {
        let file = this.video

        if (!this.isCutting) {
          let newFileName = this.filePrefix + file.name
          if (this.overrideMode) {
            newFileName = '.' + Date.now() + file.name
          }

          let newFilePath = path.dirname(file.path) + '/' + newFileName

          file.isCutting = true

          // Check video duration
          exec(`ffmpeg -i "${file.path}" 2>&1 | grep "Duration"| cut -d ' ' -f 4 | sed s/,// | sed 's@\\..*@@g' | awk '{ split($1, A, ":"); split(A[3], B, "."); print 3600*A[1] + 60*A[2] + B[1] }'`, (error, stdout, stderr) => {
            if (!error) {
              let duration = +stdout

              // Cut video from start time to end time
              let cutting = spawn(ffmpeg, ['-i', `"${file.path}"`, '-ss', this.startTime, '-to', this.endTime, '-async', '1', `"${newFilePath}"`, '-y'], {shell: true})
              file.cutProcess = cutting

              // Display progress when cutting
              cutting.stderr.on('data', data => {
                data = data.toString()

                // Calculate the progress percentage
                let current = data.match(/time=([0-9:.])*\s/) || ['']
                current = current[0].trim().split('=')[1] || '0:0:0'
                current = current.split(':')
                current = 3600 * current[0] + 60 * current[1] + +current[2]
                current = Math.round(current / duration * 100)

                if (current > 0) {
                  file.progressPercentage = current
                }
              })

              // Cut finished
              cutting.on('exit', code => {
                if (code === 0) {
                  file.progressPercentage = 100
                  file.cutProcess = null
                  file.isCutting = false
                  file.isStop = true

                  if (this.overrideMode) {
                    // Remove old file and replace with new file
                    fs.unlinkSync(file.path);
                    fs.renameSync(newFilePath, file.path)
                    newFileName = file.name
                  }

                  // Notify finish if the window is lost focus
                  Utils.notify(`Cut ${newFileName} completed!`)
                }
              })
            }
          })
        }
      }
    }
  }
</script>
