<template>
    <div>
        <h1>Cut Video/Audio</h1>

        <setting-mode :overrideMode="overrideMode"
                      :filePrefix="filePrefix"
                      :canChangeSetting="canChangeSetting"
                      @changeSetting="changeSetting"></setting-mode>

        <upload-zone :actionName="'cut'"
                     :allowedExtension="allowedExtension"
                     :isMultiple="false"
                     :methodOnSelect="'loadVideo'"></upload-zone>

        <el-row style="margin-top: 20px;">
            <el-col :span="24">
                <!--<el-progress :stroke-width="15"-->
                <!--:status="file.progressPercentage === 100 ? 'success' : file.isStop ? 'exception' : ''"-->
                <!--:percentage="file.progressPercentage"></el-progress>-->
            </el-col>

            <el-col :span="16">
                <div v-if="isRenderVideoPlayer">
                    <video-player :video-source="videoSource" :video-type="videoType"></video-player>
                </div>
            </el-col>

            <el-col :span="8" style="padding-left: 8px;">
                <el-form ref="form" label-width="80px">
                    <el-form-item label="Start time">
                        <el-input size="small"
                                  v-model.trim="startTime"
                                  @change="validateDuration('startTime')">
                            <el-tooltip slot="append" effect="dark" content="Get current time from video"
                                        placement="top">
                                <el-button icon="time" @click="getCurrentTime('startTime')"></el-button>
                            </el-tooltip>
                        </el-input>
                    </el-form-item>

                    <el-form-item label="End time">
                        <el-input size="small"
                                  v-model.trim="endTime"
                                  @change="validateDuration('endTime')">
                            <el-tooltip slot="append" effect="dark" content="Get current time from video"
                                        placement="top">
                                <el-button icon="time" @click="getCurrentTime('endTime')"></el-button>
                            </el-tooltip>
                        </el-input>
                    </el-form-item>

                    <div class="text-center" style="margin-top: 10px;">
                        <el-button type="primary"
                                   size="large"
                                   :disabled="startTime === '' || endTime === ''"
                                   @click="cutVideo">Cut video
                        </el-button>
                    </div>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
  import Utils from '../components/Utils.vue'
  import SettingMode from '../components/SettingMode.vue'
  import UploadZone from '../components/UploadZone.vue'
  import VideoPlayer from '../components/VideoPlayer.vue';
  import ElInput from "../../node_modules/element-ui/packages/input/src/input.vue";
  import ElButton from "../../node_modules/element-ui/packages/button/src/button.vue";
  import ElRow from "element-ui/packages/row/src/row";

  export default {
    name: 'cut',
    components: {
      ElRow,
      ElButton,
      ElInput,
      VideoPlayer,
      SettingMode,
      UploadZone
    },
    props: ['allowedExtension'],
    data() {
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
      canChangeSetting() {
        return true
      }
    },
    created() {
      // Load last used filePrefix
      this.overrideMode = APP_SETTING.getData().cutOverrideMode || false
      this.filePrefix = APP_SETTING.getData().cutFilePrefix || 'convert-'
    },
    methods: {
      changeSetting(type, value) {
        let settings = APP_SETTING.getData()

        if (type === 1) {
          this.overrideMode = value
          settings.cutOverrideMode = value
        } else {
          this.filePrefix = value
          settings.cutFilePrefix = value
        }

        APP_SETTING.setData(settings)
      },
      loadVideo(files) {
        this.video = files[0]
        this.videoSource = files[0].path
        this.videoType = files[0].type

        // Re-render video-player component
        this.isRenderVideoPlayer = false
        setTimeout(() => {
          this.isRenderVideoPlayer = true
        }, 0)
      },
      validateDuration(input) {
        if (!this[input].match(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)) {
          alert('Invalid time')
        }
      },
      getCurrentTime(input) {
        let currentSecond = document.getElementsByTagName('video')[0].currentTime
        this[input] = Utils.convertTime(currentSecond)
      },
      cutVideo() {
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

<style>
  video {
    background: #000000;
  }

  .el-progress.el-progress--line {
    margin-bottom: 15px;
  }
</style>

