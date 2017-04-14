<template>
  <div>
    <h1>Convert Video H264</h1>

    <h3>Choose Files</h3>

    <div id="upload-zone" v-on:click="uploadFiles" v-on:drop.stop.prevent="dropFiles">
        <div class="message">{{ selectedFileName }}</div>
    </div>

    <input type="file" id="input-files" v-on:change="chooseFiles" accept=".mp4,.flv,.MP4,.FLV">

    <button type="button" class="btn" :class="{ disabled: selectedFile === null || isConverting }"
            v-on:click="convertH264">Export
    </button>

    <div id="progress" v-html="progress"></div>
  </div>
</template>

<style scoped>
  #upload-zone {
      height: 200px;
      border: 2px dashed #4f9eb5;
      border-radius: 5px;
      cursor: pointer;
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
        isConverting: false,
        progress: ''
      }
    },
    methods: {
      uploadFiles () {
        document.getElementById('input-files').click();
      },
      dropFiles (e) {
        this.selectedFile = e.dataTransfer.files[0]
        this.selectedFileName = 'Selected files: ' + this.selectedFile.name
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
            this.scrollTop()

            // Begin convert after 1s
            setTimeout(() => {
              const converting = spawn(ffmpeg, ['-i', `"${file.path}"`, '-c:a', 'copy', '-x264-params', 'crf=30', '-b:a', '64k', `"${saveFile}"`, '-y'], {shell: true})

              // Display progress
              converting.stderr.on('data', (data) => {
                this.progress += '<p>' + data.toString() + '</p>'

                //todo: if user using scroll, do not scroll to bottom
                // or using progresbar

                // Scroll to bottom
                this.scrollTop()
              });

              // Convert finished
              converting.on('exit', (code) => {
                this.progress += '<p>Completed!</p>'
                this.scrollTop()
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
      scrollTop () {
        let element = document.getElementById('progress')
        element.scrollTop = element.scrollHeight - element.clientHeight
      }
    }
  }

</script>
