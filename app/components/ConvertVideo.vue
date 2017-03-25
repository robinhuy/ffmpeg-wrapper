<template>
  <div>
    <h1>Convert Video H264</h1>

    <h3>Choose MP4 Files</h3>

    <input type="file" id="input-files" v-on:change="chooseFiles">

    <button type="button" class="btn" :class="{ disabled: selectedFiles.length < 1 }" v-on:click="convertH264">Exports
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
    name: 'cut-video',
    data () {
      return {
        selectedFiles: [],
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
        //http://mylifeforthecode.com/getting-started-with-standard-dialogs-in-electron/
        //  remote.dialog.showSaveDialog(saveFile => {
        //
        //  });
          let file = selectedFiles[0]
          let fileExtension = path.extname(file.name)
          let newFileName = path.basename(file.name, fileExtension) + '-h264' + fileExtension
          let newFilePath = path.dirname(file.path) + '/' + newFileName

          if (fileExtension != '.mp4') {
            alert('Only support mp4 files')
          } else {
            this.progress = '<p>Begin converting ...</p>'
            this.scrollTop()

            // Begin convert after 1s
            setTimeout(() => {
              const converting = spawn(ffmpeg, ['-i', `"${file.path}"`, '-c:a', 'copy', '-x264-params', 'crf=30', '-b:a', '64k', `"${newFilePath}"`, '-y'], {shell: true})

              // Display progress
              converting.stderr.on('data', (data) => {
                this.progress += '<p>' + data.toString() + '</p>'

                //todo: if user using scroll, do not scroll to bottom

                // Scroll to bottom
                this.scrollTop()
              });

              // Convert finished
              converting.on('exit', (code) => {
                this.progress += '<p>Completed!</p>'
                this.scrollTop()

                // Reset input
                document.getElementById('input-files').value = null
                this.selectedFiles = []

                // Notify finish if the window is lost focus
                if (!remote.BrowserWindow.getFocusedWindow()) {
                  notifyDesktop('FFMPEG WRAPPER', 'Finished converting!')
                }
              });
            }, 1000)
          }
        }
      },
      scrollTop () {
        let element = document.getElementById('progress')
        element.scrollTop = element.scrollHeight - element.clientHeight
      }
    }
  }

</script>
