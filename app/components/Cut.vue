<template>
  <div>
    <h1>Batch Convert Video H264</h1>

    <h3>Settings</h3>

    <p>
      <label>
        File Convert Prefix
        <input type="text" id="prefix" v-model="prefix"/>
      </label>
    </p>

    <p>
      <label>
        File Convert Suffix
        <input type="text" id="suffix" v-model="suffix"/>
      </label>
    </p>

    <p class="warning" v-if="prefix == '' && suffix == ''">
      Warning: Converted files can be overwritten original files if it export to same folder.
      <span class="close-warning" onclick=""><i>Dismiss</i></span>
    </p>

    <h3>Choose MP4 Files</h3>

    <input type="file" id="input-files" multiple v-on:change="chooseFiles" accept=".mp4,.flv,.MP4,.FLV"/>

    <button type="button" class="btn" :class="{ disabled: selectedFiles.length < 1 || isConverting }" v-on:click="convertH264">Export to folder</button>

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

  .warning {
    color: red;
  }

  .close-warning {
    color: grey;
    cursor: pointer;
  }
</style>

<script>
  export default {
    name: 'cut',
    data () {
      return {
        selectedFiles: [],
        isConverting: false,
        progress: '',
        prefix: '',
        suffix: '-h264'
      }
    },
    mounted () {
      // Set default setting values
      let settings = APP_SETTING.getData()

      this.prefix = settings.file_convert_prefix || ''

      if (settings.file_convert_suffix === undefined) {
        this.suffix = '-h264'
      } else {
        this.suffix = settings.file_convert_suffix || ''
      }
    },
    methods: {
      chooseFiles (e) {
        this.selectedFiles = e.target.files
      },
      convertH264 () {
        // Save setting
        let settings = APP_SETTING.getData()
        settings.file_convert_prefix = this.prefix || ''
        settings.file_convert_suffix = this.suffix || ''
        APP_SETTING.setData(settings)

        let selectedFiles = this.selectedFiles

        if (selectedFiles.length > 0) {
          // Open dialog choose folder
          remote.dialog.showOpenDialog({
            properties: ['openDirectory']
          }, saveFolder => {
            if (!saveFolder) return

            this.isConverting = true
            let converted = 0

            for (let i = 0; i < selectedFiles.length; i++) {
              let file = selectedFiles[i]
              let fileExtension = path.extname(file.name)
              let newFileName = this.prefix + path.basename(file.name, fileExtension) + this.suffix + fileExtension
              let newFilePath = saveFolder + '/' + newFileName

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
                  converted++

                  // Notify when all files converted
                  if (converted == selectedFiles.length) {
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
                  }
                });
              }, 1000)
            }
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
