<template>
  <div>
    <h1>Convert Video H264</h1>

    <h3>Choose MP4 Files</h3>

    <input type="file" id="input-files" v-on:change="chooseFiles" accept=".mp4,.flv,.MP4,.FLV">

    <button type="button" class="btn" :class="{ disabled: selectedFiles.length < 1 || isConverting }" v-on:click="convertH264">Export
    </button>

    <div id="progress" v-html="progress"></div>
  </div>
</template>

<style scoped>
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
  export default{
    name: 'convert-video',
    data () {
      return {
        selectedFiles: [],
        isConverting: false,
        progress: ''
      }
    },
    methods: {
      chooseFiles (e) {
        this.selectedFiles = e.target.files
      },
      convertH264 () {
        let selectedFiles = this.selectedFiles

        if (selectedFiles.length > 0) {
          let file = selectedFiles[0]
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
                this.selectedFiles = []

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
