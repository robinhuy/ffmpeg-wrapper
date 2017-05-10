<template>
    <div>
        <h1>Compress Video</h1>

        <setting-mode :overrideMode="overrideMode"
                      :filePrefix="filePrefix"
                      :methodOnChange="'saveSetting'"></setting-mode>

        <upload-zone :allowedExtension="allowedExtension"
                     :isMultiple="true"
                     :methodOnSelect="'mergeUploadFiles'"></upload-zone>

        <div class="center">
            <button type="button"
                    class="btn btn-compress-all"
                    :class="{disabled: selectedFiles.length === 0 || (!this.overrideMode && this.filePrefix === '')}"
                    v-on:click="compressAll">Compress all
            </button>

            <ul>
                <li v-for="(file, index) in selectedFiles" :key="index">
                    <span>{{ file.name }}</span>
                    <div class="progress">
                        <div class="progress-bar" :style="'width: ' + file.progressPercentage + '%'"></div>
                    </div>

                    <button type="button" v-on:click="compressOne(index)"
                            v-if="!file.isConverting && !file.isStop">Compress</button>
                    <button type="button" v-on:click="removeFile(index)">
                        {{ file.isConverting && !file.isStop ? 'Stop' : 'Remove' }}
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
    ul {
        list-style-type: none;
        padding: 0;
    }

    .btn-compress-all {
        margin: 15px;
        font-size: 20px;
    }
</style>

<script>
  import SettingMode from './SettingMode.vue'
  import UploadZone from './UploadZone.vue'

  export default {
    name: 'compress',
    components: {
      SettingMode,
      UploadZone
    },
    props: ['allowedExtension'],
    data () {
      return {
        overrideMode: false,
        filePrefix: 'convert-',
        selectedFiles: [],
        isDragOver: false
      }
    },
    mounted () {
      // Load last used filePrefix
      this.overrideMode = APP_SETTING.getData().overrideMode || false
      this.filePrefix = APP_SETTING.getData().filePrefix || 'convert-'
    },
    methods: {
      mergeUploadFiles (files) {
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
      compressAll () {
        // Compress files which not converting
        let numberFiles = this.selectedFiles.length

        let arr = []
        for (let i = 0; i < numberFiles; i++) {
          arr.push(this.compressOne(i, numberFiles))
        }

        if (this.selectedFiles.length > 0) {
          Promise.all(arr).then(() => {
            // Notify finish for all files if the window is lost focus
            if (!remote.BrowserWindow.getFocusedWindow()) {
              notifyDesktop('FFMPEG WRAPPER', 'Compress all completed!')
            } else {
              alert(`Compress all completed!`)
            }
          }).catch(err => {
            alert('Error: ' + err.toString())
          })
        }
      },
      compressOne (index, numberFiles) {
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

                    // Notify finish for one file if the window is lost focus
                    if (!numberFiles) {
                      if (!remote.BrowserWindow.getFocusedWindow()) {
                        notifyDesktop('FFMPEG WRAPPER', `Compress ${newFileName} completed!`)
                      } else {
                        alert(`Compress ${newFileName} completed!`)
                      }
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
      removeFile (index) {
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
      saveSetting (type) {
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
          if (isConverting)
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
