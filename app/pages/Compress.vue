<template>
    <div>
        <h1>Compress Video</h1>

        <setting-mode :overrideMode="overrideMode"
                      :filePrefix="filePrefix"
                      :canChangeSetting="canChangeSetting"
                      @changeSetting="changeSetting"></setting-mode>

        <upload-zone :actionName="'compress'"
                     :allowedExtension="allowedExtension"
                     :isMultiple="true"
                     :methodOnSelect="'mergeUploadFiles'"></upload-zone>

        <div class="center">
            <el-button type="primary"
                       size="large"
                       :disabled="selectedFiles.length === 0 || (!this.overrideMode && this.filePrefix === '')"
                       @click="compressAll">
                Compress all
            </el-button>

            <div>
                <el-card class="box-card" v-for="(file, index) in selectedFiles" :key="index">
                    <div slot="header" class="clearfix">
                        {{ file.name }}
                    </div>

                    <div class="progress">
                        <el-progress :stroke-width="18"
                                     :status="file.progressPercentage === 100 ? 'success' : file.isStop ? 'exception' : ''"
                                     :percentage="file.progressPercentage"></el-progress>
                    </div>

                    <el-button type="info"
                               @click="compressOne(index)"
                               v-if="!file.isConverting && !file.isStop">Compress
                    </el-button>

                    <el-button :type="file.progressPercentage === 100 ? 'success' : 'danger'"
                               @click="removeFile(index)">
                        {{ file.isConverting && !file.isStop ? 'Stop' : 'Remove' }}
                    </el-button>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script>
  import Utils from '../components/Utils.vue'
  import SettingMode from '../components/SettingMode.vue'
  import UploadZone from '../components/UploadZone.vue'
  import ElButton from "../../node_modules/element-ui/packages/button/src/button.vue";

  export default {
    name: 'compress',
    components: {
      ElButton,
      SettingMode,
      UploadZone
    },
    props: ['allowedExtension'],
    data() {
      return {
        overrideMode: false,
        filePrefix: 'convert-',
        selectedFiles: [],
        isDragOver: false
      }
    },
    computed: {
      canChangeSetting() {
        // Not allow change setting when converting
        let isConverting = false
        let numberFiles = this.selectedFiles.length

        for (let i = 0; i < numberFiles; i++) {
          if (this.selectedFiles[i].isConverting) {
            isConverting = true
            break
          }
        }

        return !isConverting
      }
    },
    created() {
      // Load last used filePrefix
      this.overrideMode = APP_SETTING.getData().compressOverrideMode || false
      this.filePrefix = APP_SETTING.getData().compressFilePrefix || 'convert-'
    },
    methods: {
      changeSetting(type, value) {
        let settings = APP_SETTING.getData()

        if (type === 1) {
          this.overrideMode = value
          settings.compressOverrideMode = value
        } else {
          this.filePrefix = value
          settings.compressFilePrefix = value
        }

        APP_SETTING.setData(settings)
      },
      mergeUploadFiles(files) {
        // Convert Object to Array
        let arr = Object.keys(files).map(key => {
          return files[key]
        })
        let arrLength = arr.length

        for (let i = 0; i < arrLength; i++) {
          // Check file already exist
          let exist = this.selectedFiles.find(selected => {
            return selected.path === arr[i].path;
          })

          // Push allowed file which is not exist
          let extName = path.extname(arr[i].name)
          if (exist === undefined && this.allowedExtension.indexOf(extName) !== -1) {
            this.selectedFiles.push(arr[i])
          }
        }
      },
      compressAll() {
        // Compress files which not converting
        let numberFiles = this.selectedFiles.length

        let arr = []
        for (let i = 0; i < numberFiles; i++) {
          arr.push(this.compressOne(i, numberFiles))
        }

        if (this.selectedFiles.length > 0) {
          Promise.all(arr).then(() => {
            // Notify finish for all files if the window is lost focus
            Utils.notify(`Compress all completed!`)
          }).catch(err => {
            alert('Error: ' + err.toString())
          })
        }
      },
      compressOne(index, numberFiles) {
        return new Promise((resolve, reject) => {
          // Compress file which not converting
          let file = this.selectedFiles[index]
          if (!file.isConverting && !file.isStop) {
            // todo: Check file exists then alert confirm to prevent override

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

                  if (current > 0 && current <= 100) {
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

                    // Notify finish for one file if the window is lost focus
                    if (!numberFiles) {
                      Utils.notify(`Compress ${newFileName} completed!`)
                    }
                  }
                })
              } else {
                reject(error)
              }
            })
          } else {
            resolve(true)
          }
        })
      },
      removeFile(index) {
        // Stop converting process
        if (this.selectedFiles[index].convertProcess) {
          this.selectedFiles[index].convertProcess.kill('SIGINT')
          this.selectedFiles[index].convertProcess = null
          this.selectedFiles[index].isConverting = false
          this.selectedFiles[index].isStop = true
        }
        // Remove file
        else {
          this.selectedFiles.splice(index, 1)
        }
      },
      saveSetting(type) {
        let settings = APP_SETTING.getData()

        if (type === 'mode') {
          // Not allow change mode when converting
          let isConverting = false
          let numberFiles = this.selectedFiles.length
          for (let i = 0; i < numberFiles; i++) {
            if (this.selectedFiles[i].isConverting) {
              isConverting = true
              break
            }
          }

          // Revert mode if changed when converting
          if (!isConverting)
            this.overrideMode = !this.overrideMode

          settings.compressOverrideMode = this.overrideMode
        }

        if (type === 'filePrefix') {
          if (!this.overrideMode && this.filePrefix !== '') {
            settings.compressFilePrefix = this.filePrefix
          }
        }

        APP_SETTING.setData(settings)
      }
    }
  }

</script>

<style scoped>
  ul {
    list-style-type: none;
    padding: 0;
  }
</style>
