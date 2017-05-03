<template>
  <div>
      <h1>Compress Video</h1>

      <label>
          <input type="checkbox" v-model="override_mode"/> Replace original files
      </label>

      <label v-if="!override_mode">
          File Convert Prefix
          <input type="text" id="setting-prefix" v-model="prefix"/>
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
                  class="btn btn-export"
                  :class="{disabled: selectedFiles.length === 0}"
                  v-on:click="compressAll">Compress all
          </button>

          <ul>
              <li v-for="f in selectedFiles" :key="f.path">
                  <span>{{ f.name }} {{ f.progressPercent }} {{ f.isConverting }}</span>
                  <div class="progress">
                      <div class="progress-bar" :style="'width: ' + f.progressPercent + '%'"></div>
                  </div>
                  <button type="button">Compress</button>
                  <button type="button">Pause</button>
                  <button type="button">Remove</button>
              </li>
          </ul>
      </div>

      <!--<div v-if="logs.length > 0">-->
          <!--<div v-on:click="toggleViewLog" style="float: right;">-->
              <!--<a href="#" v-if="showLog">Hide</a>-->
              <!--<a href="#" v-else>View log</a>-->
          <!--</div>-->

          <!--<div id="logs" v-html="logs" v-show="showLog" v-on:scroll="userScroll"></div>-->
      <!--</div>-->
  </div>
</template>

<style scoped>
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

  .btn-export {
    margin: 15px;
    font-size: 20px;
  }

  #logs {
    padding: 15px;
    margin-top: 15px;
    height: 200px;
    overflow-y: scroll;
    background-color: #000000;
    color: #33B28C;
    border: 1px solid rgba(0,0,0,.15);
  }
</style>

<script>
  export default {
    name: 'compress',
    data () {
      return {
        allowed: ['.mp4', '.flv' , '.MP4' , '.FLV'],
        override_mode: false,
        prefix: 'convert-',
        imgSource: imgPath + '/choose-files.png',
        selectedFiles: [],
        isDragOver: false,
        showLog: false,
        logs: '',
        stopScroll: false
      }
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
        let arr = Object.keys(files).map(key => { return files[key] })
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
        // Alert when not in override mode but setting prefix is empty
        if (!this.override_mode && document.getElementById('setting-prefix').value.trim() === '') {
          let prefix = confirm('Do you want to left file prefix blank? (It will cause converted files replace the original files');
          if (!prefix) return false
        }

        // Save setting
        let settings = APP_SETTING.getData()
        settings.file_convert_prefix = this.prefix || ''
        APP_SETTING.setData(settings)

        // Compress files which not converting
        let numberFiles = this.selectedFiles.length
        if (numberFiles > 0) {
          for (let i = 0; i < numberFiles; i++) {
            let file = this.selectedFiles[i]
            if (!file.isConverting) {
              // todo: Check file exists then alert to prevent override

              let newFileName = settings.file_convert_prefix + file.name
              let newFilePath = path.dirname(file.path) + '/' + newFileName

              file.isConverting = true

              // Check video duration
              exec(`ffmpeg -i ${file.path} 2>&1 | grep "Duration"| cut -d ' ' -f 4 | sed s/,// | sed 's@\\..*@@g' | awk '{ split($1, A, ":"); split(A[3], B, "."); print 3600*A[1] + 60*A[2] + B[1] }'`, (error, stdout, stderr) => {
                if (!error) {
                  let duration = +stdout

                  // Convert video h264
                  let converting = spawn(ffmpeg, ['-i', `"${file.path}"`, '-c:a', 'copy', '-x264-params', 'crf=30', '-b:a', '64k', `"${newFilePath}"`, '-y'], {shell: true})

                  // Display progress when converting
                  converting.stderr.on('data', data => {
                    data = data.toString()
//                    console.log(data)
//                    this.logs += '<p>' + data + '</p>'

                    let current = data.match(/time=([0-9:.])*\s/) || ['']
                    current = current[0].trim().split('=')[1] || '0:0:0'
                    current = current.split(':')
                    current = 3600 * current[0] + 60 * current[1] + +current[2]
                    current = current / duration * 100
                    file.progressPercent = Math.round(current)

                    // Update selectedFiles
                    this.$set(this.selectedFiles, i, file)

                    // Scroll to bottom if user does not stop
//                    if (!this.stopScroll) this.scrollToBottom()
                  });

                  // Convert finished
                  converting.on('exit', code => {
//                  this.logs += '<p>Completed!</p>'
//                  this.scrollToBottom()

                    file.isConverting = false
                    file.progressPercent = 100
                    this.$set(this.selectedFiles, i, file)

                    // Notify finish if the window is lost focus
                    if (!remote.BrowserWindow.getFocusedWindow()) {
                      notifyDesktop('FFMPEG WRAPPER', 'Convert completed!')
                    } else {
                      alert(`Convert ${newFileName} completed!`)
                    }
                  });
                }
              else {
                  console.log(error, stderr)
//                this.logs += `<p>${error}</p><p>${stderr}</p>`
              }
              });
            }
          }
        }
      },
      toggleViewLog () {
        this.showLog = !this.showLog
      },
      scrollToBottom () {
        let element = document.getElementById('progress')
        if (element) element.scrollTop = element.scrollHeight - element.clientHeight
      },
      userScroll () {
        let element = document.getElementById('progress')
        if (element && element.scrollTop === 0) this.stopScroll = true
      }
    }
  }

</script>
