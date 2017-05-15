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
        this.videoPlayer = `<video controls style="width: 100%"><source src="${this.video.path}" type="video/mp4"></video>`
      },
      cutVideo () {
        if (!this.isCutting) {
          let newFileName = this.filePrefix + file.name
          if (this.overrideMode) {
            newFileName = '.' + Date.now() + index + file.name
          }

          let newFilePath = path.dirname(file.path) + '/' + newFileName

          file.isConverting = true

          // Check video duration
          exec(`ffmpeg -i "${file.path}" 2>&1 | grep "Duration"| cut -d ' ' -f 4 | sed s/,// | sed 's@\\..*@@g' | awk '{ split($1, A, ":"); split(A[3], B, "."); print 3600*A[1] + 60*A[2] + B[1] }'`, (error, stdout, stderr) => {
            if (!error) {
              let duration = +stdout

              // Convert video h264
              let converting = spawn(ffmpeg, ['-i', `"${file.path}"`, '-c:a', 'copy', '-x264-params', 'crf=30', '-b:a', '64k', `"${newFilePath}"`, '-y'], {shell: true})
              file.convertProcess = converting
              this.$set(this.selectedFiles, index, file)

              // Display progress when converting
              converting.stderr.on('data', data => {
                data = data.toString()

                // Calculate the progress percentage
                let current = data.match(/time=([0-9:.])*\s/) || ['']
                current = current[0].trim().split('=')[1] || '0:0:0'
                current = current.split(':')
                current = 3600 * current[0] + 60 * current[1] + +current[2]
                current = Math.round(current / duration * 100)

                if (current > 0) {
                  file.progressPercentage = current

                  // Update selectedFiles
                  this.$set(this.selectedFiles, index, file)
                }
              })

              // Convert finished
              converting.on('exit', code => {
                if (code === 0) {
                  file.progressPercentage = 100
                  file.convertProcess = null
                  file.isConverting = false
                  file.isStop = true
                  this.$set(this.selectedFiles, index, file)

                  if (this.overrideMode) {
                    // Remove old file and replace with new file
                    fs.unlinkSync(file.path);
                    fs.renameSync(newFilePath, file.path)
                    newFileName = file.name
                  }

                  resolve(true)

                  // Notify finish if the window is lost focus
                  if (!numberFiles) {
                    Utils.notify(`Cut ${newFileName} completed!`)
                  }
                }
              })
            }
          })
        }
      }
    }
  }
</script>
