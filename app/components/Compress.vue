<template>
    <div>
        <h1>Compress Video</h1>

        <label>
            <input type="checkbox" v-model="override_mode" v-on:change="saveSetting('mode')"/>
            Replace original files
        </label>

        <label v-if="!override_mode">
            File Convert Prefix
            <input type="text" id="setting-prefix"
                   :class="{invalid: this.prefix === ''}"
                   v-model="prefix"
                   v-on:keyup.delete="alertBlankPrefix()"
                   v-on:change="saveSetting('prefix')"/>
        </label>

        <div id="upload-zone" class="center"
             :class="{hover: isDragOver}"
             v-on:click="uploadFiles"
             v-on:dragover.stop.prevent="dragFiles"
             v-on:dragleave.stop.prevent="dragLeave"
             v-on:drop.stop.prevent="dropFiles"
             v-on:mouseover="mouseOverImage"
             v-on:mouseout="mouseOutImage">
            <img :src="imgSource"/>
            <div class="message-title">Select file to compress</div>
            <div class="message">Or drag and drop video file</div>
        </div>

        <input type="file" id="input-files" multiple v-on:change="chooseFiles" :accept="this.allowed.join(',')">

        <div class="center">
            <button type="button"
                    class="btn btn-compress-all"
                    :class="{disabled: selectedFiles.length === 0 || (!this.override_mode && this.prefix === '')}"
                    v-on:click="compressAll">Compress all
            </button>

            <ul>
                <li v-for="(file, index) in selectedFiles" :key="index">
                    <span>{{ file.name }}</span>
                    <div class="progress">
                        <div class="progress-bar" :style="'width: ' + file.progressPercentage + '%'"></div>
                    </div>
                    <button type="button" v-on:click="compressOne(index)">Compress</button>
                    <button type="button" v-on:click="removeFile(index)">{{ file.isConverting ? 'Pause' : 'Remove' }}
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

    #upload-zone {
        height: 250px;
        border: 2px dashed #4f9eb5;
        border-radius: 5px;
        cursor: pointer;
        color: #616161;
    }

    #upload-zone.hover {
        background-color: grey;
    }

    #upload-zone img {
        width: 100px;
        margin-top: 30px;
    }

    #upload-zone .message-title {
        margin-top: 20px;
        font-size: 22px;
        font-weight: bold;
    }

    #upload-zone .message {
        margin-top: 20px;
        font-size: 18px;
    }

    #upload-zone:hover {
        color: #000000;
    }

    #input-files {
        display: none;
    }

    input.invalid {
        border: 1px solid red;
    }

    .btn-compress-all {
        margin: 15px;
        font-size: 20px;
    }
</style>

<script>
  export default {
    name: 'compress',
    data () {
      return {
        allowed: ['.mp4', '.flv', '.MP4', '.FLV'],
        override_mode: false,
        prefix: 'convert-',
        imgSource: imgPath + '/choose-files.png',
        selectedFiles: [],
        isDragOver: false
      }
    },
    mounted () {
      // Load last used prefix
      this.override_mode = APP_SETTING.getData().override_mode || false
      this.prefix = APP_SETTING.getData().prefix || 'convert-'
    },
    methods: {
      mouseOverImage () {
        this.imgSource = imgPath + '/choose-files-hover.png'
      },
      mouseOutImage () {
        this.imgSource = imgPath + '/choose-files.png'
      },
      uploadFiles () {
        document.getElementById('input-files').click();
      },
      dragFiles (e) {
        e.dataTransfer.dropEffect = 'copy';
        this.isDragOver = true
      },
      dragLeave (e) {
        this.isDragOver = false
      },
      dropFiles (e) {
        this.mergeUploadFiles(e.dataTransfer.files)
        this.isDragOver = false
      },
      chooseFiles (e) {
        this.mergeUploadFiles(e.target.files)
      },
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
          if (exist === undefined && this.allowed.indexOf(extName) !== -1) {
            this.selectedFiles.push(arr[i])
          }
        }
      },
      compressAll () {
        // Compress files which not converting
        let numberFiles = this.selectedFiles.length
        for (let i = 0; i < numberFiles; i++) {
          this.compressOne(i)
        }
      },
      compressOne (index) {
        // Compress file which not converting
        let file = this.selectedFiles[index]
        if (!file.isConverting) {
          // todo: Check file exists then alert to prevent override

          let newFileName = this.prefix + file.name
          let newFilePath = path.dirname(file.path) + '/' + newFileName

          file.isConverting = true

          // Check video duration
          exec(`ffmpeg -i ${file.path} 2>&1 | grep "Duration"| cut -d ' ' -f 4 | sed s/,// | sed 's@\\..*@@g' | awk '{ split($1, A, ":"); split(A[3], B, "."); print 3600*A[1] + 60*A[2] + B[1] }'`, (error, stdout, stderr) => {
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
              });

              // Convert finished
              converting.on('exit', code => {
                if (code === 0) {
                  file.isConverting = false
                  file.progressPercentage = 100
                  this.$set(this.selectedFiles, index, file)

                  //todo: when compress all only notify onetime
                  // Notify finish if the window is lost focus
                  if (!remote.BrowserWindow.getFocusedWindow()) {
                    notifyDesktop('FFMPEG WRAPPER', 'Convert completed!')
                  } else {
                    alert(`Convert ${newFileName} completed!`)
                  }
                }
              });
            } else {
              console.log(error, stderr)
            }
          });
        }
      },
      alertBlankPrefix () {
        // Alert when not in override mode but setting prefix is empty
        if (!this.override_mode && this.prefix === '') {
          alert('Cannot left file prefix blank!');
        }
      },
      saveSetting (type) {
        let settings = APP_SETTING.getData()

        if (type === 'mode') {
          settings.override_mode = this.override_mode
        }

        if (type === 'prefix') {
          if (!this.override_mode && this.prefix !== '') {
            settings.prefix = this.prefix
          }
        }

        APP_SETTING.setData(settings)
      },
      removeFile (index) {
        // Stop converting process
        if (this.selectedFiles[index].convertProcess) {
          this.selectedFiles[index].convertProcess.kill('SIGINT')
          this.selectedFiles[index].convertProcess = null
          this.selectedFiles[index].isConverting = false
        } else {
          this.selectedFiles.splice(index, 1)
        }
      }
    }
  }

</script>
