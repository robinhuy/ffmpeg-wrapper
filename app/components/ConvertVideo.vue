<template>
  <div>
      <h1>Convert Video H264</h1>

      <h3>Choose Files</h3>

      <div id="upload-zone" class="center"
           :class="{hover: isDragOver}"
           v-on:click="uploadFiles"
           v-on:dragover.stop.prevent="dragFiles"
           v-on:dragleave.stop.prevent="dragLeave"
           v-on:drop.stop.prevent="dropFiles"
           v-on:mouseover="mouseOverImage"
           v-on:mouseout="mouseOutImage">
          <img :src="imgSource"/>
          <div class="message-title">Select file to convert</div>
          <div class="message">{{ selectedFileName }}</div>
      </div>

      <input type="file" id="input-files" v-on:change="chooseFiles" accept=".mp4,.flv,.MP4,.FLV">

      <div class="center">
          <button type="button"
                  class="btn btn-export"
                  :class="{disabled: selectedFile === null || isConverting}"
                  v-on:click="convertH264">Export
          </button>

          <div class="progress">
              <div class="progress-bar" :style="'width: ' + progressPercent + '%'">
                  <span class="sr-only">{{ progressPercent }} %</span>
              </div>
          </div>
      </div>

      <div v-if="logs.length > 0">
          <div v-on:click="toggleViewLog" style="float: right;">
              <a href="#" v-if="showLog">Hide</a>
              <a href="#" v-else>View log</a>
          </div>

          <div id="logs" v-html="logs" v-show="showLog" v-on:scroll="userScroll"></div>
      </div>
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
    name: 'convert-video',
    data () {
      return {
        imgSource: imgPath + '/choose-files.png',
        selectedFile: null,
        selectedFileName: 'Or drag and drop video file',
        isDragOver: false,
        isConverting: false,
        showLog: false,
        logs: '',
        progressPercent: 0,
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
        this.selectedFile = e.dataTransfer.files[0]
        this.selectedFileName = this.selectedFile.name
        this.isDragOver = false
      },
      chooseFiles (e) {
        this.selectedFile = e.target.files[0]
        this.selectedFileName = 'Selected files: ' + this.selectedFile.name
      },
      convertH264 () {
        let file = this.selectedFile

        if (file) {
          let fileExtension = path.extname(file.name)
          let newFileName = path.basename(file.name, fileExtension) + '-h264' + fileExtension
          let newFilePath = path.dirname(file.path) + '/' + newFileName

          // Open dialog to save file
          remote.dialog.showSaveDialog({
            defaultPath: newFilePath,
            filters: [{
              name: 'video',
              extensions: fileExtension.substr(1)
            }]
          }, saveFile => {
            if (!saveFile) return

            this.isConverting = true

            // Add extension if user forget
            if (saveFile.indexOf(fileExtension) === -1) saveFile += fileExtension

            // Begin write logs
            this.logs = '<p>Begin converting ...</p>'
            this.scrollToBottom()
            this.stopScroll = false

            // Check video duration
            exec(`ffmpeg -i ${file.path} 2>&1 | grep "Duration"| cut -d ' ' -f 4 | sed s/,// | sed 's@\\..*@@g' | awk '{ split($1, A, ":"); split(A[3], B, "."); print 3600*A[1] + 60*A[2] + B[1] }'`, (error, stdout, stderr) => {
              if (!error) {
                const duration = +stdout
                const converting = spawn(ffmpeg, ['-i', `"${file.path}"`, '-c:a', 'copy', '-x264-params', 'crf=30', '-b:a', '64k', `"${saveFile}"`, '-y'], {shell: true})

                // Display logs when converting
                converting.stderr.on('data', (data) => {
                  data = data.toString()
                  this.logs += '<p>' + data + '</p>'

                  let current = data.match(/time=([0-9:.])*\s/) || ['']
                  current = current[0].trim().split('=')[1] || '0:0:0'
                  current = current.split(':')
                  current = 3600 * current[0] + 60 * current[1] + +current[2]
                  current = current / duration * 100
                  this.progressPercent = Math.round(current)

                  // Scroll to bottom if user does not stop
                  if (!this.stopScroll) this.scrollToBottom()
                });

                // Convert finished
                converting.on('exit', (code) => {
                  this.logs += '<p>Completed!</p>'
                  this.scrollToBottom()
                  this.isConverting = false

                  // Reset input
                  document.getElementById('input-files').value = null
                  this.selectedFile = null

                  // Notify finish if the window is lost focus
                    if (!remote.BrowserWindow.getFocusedWindow()) {
                      notifyDesktop('FFMPEG WRAPPER', 'Convert completed!')
                    } else {
                      alert('Convert completed!')
                    }
                });
              } else {
                this.logs += `<p>${error}</p><p>${stderr}</p>`
              }
            });
          })
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
        if (element && element.scrollTop == 0) this.stopScroll = true
      }
    }
  }

</script>
