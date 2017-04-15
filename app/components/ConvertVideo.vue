<template>
  <div>
    <h1>Convert Video H264</h1>

    <h3>Choose Files</h3>

    <div id="upload-zone"
         :class="{hover: isDragOver}"
         v-on:click="uploadFiles"
         v-on:dragover.stop.prevent="dragFiles"
         v-on:dragleave.stop.prevent="dragLeave"
         v-on:drop.stop.prevent="dropFiles">
        <div class="message">{{ selectedFileName }}</div>
    </div>

    <input type="file" id="input-files" v-on:change="chooseFiles" accept=".mp4,.flv,.MP4,.FLV">

    <button type="button"
            class="btn"
            :class="{disabled: selectedFile === null || isConverting}"
            v-on:click="convertH264">Export
    </button>

    <div v-if="progress.length > 0">
      <div v-on:click="toggleViewLog">
          <a href="#" v-if="showLog">Hide</a>
          <a href="#" v-else>View log</a>
      </div>

      <div id="progress" v-html="progress" v-show="showLog" v-on:scroll="userScroll"></div>
    </div>

  </div>
</template>

<style scoped>
  #upload-zone {
      height: 200px;
      border: 2px dashed #4f9eb5;
      border-radius: 5px;
      cursor: pointer;
  }

  #upload-zone.hover {
      background-color: grey;
  }

  #upload-zone .message {
      margin-top: 80px;
      text-align: center;
      font-size: 24px;
  }

  #input-files {
      display: none;
  }

  #progress {
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
        selectedFile: null,
        selectedFileName: 'Drop files here or click to choose',
        isDragOver: false,
        isConverting: false,
        showLog: false,
        progress: '',
        stopScroll: false
      }
    },
    methods: {
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

            if (saveFile.indexOf(fileExtension) === -1) saveFile += fileExtension

            this.progress = '<p>Begin converting ...</p>'
            this.scrollToBottom()
            this.stopScroll = false

            // Begin convert after 1s
            setTimeout(() => {
              const converting = spawn(ffmpeg, ['-i', `"${file.path}"`, '-c:a', 'copy', '-x264-params', 'crf=30', '-b:a', '64k', `"${saveFile}"`, '-y'], {shell: true})

              // Display progress
              converting.stderr.on('data', (data) => {
                this.progress += '<p>' + data.toString() + '</p>'

                // Scroll to bottom if user does not stop
                if (!this.stopScroll) this.scrollToBottom()
              });

              // Convert finished
              converting.on('exit', (code) => {
                this.progress += '<p>Completed!</p>'
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
            }, 1000)
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
