<template>
  <div>
    <h1>Convert video H264</h1>

    <h3>Choose MP4 files</h3>

    <input type="file" id="input-files" multiple v-on:change="chooseFiles">

    <button type="button" id="btn-convert" v-on:click="convertH264">Start</button>

    <div id="video-player">
      <video width="320" height="240" controls>
        <source id="video-source" src="" type="video/mp4">
      </video>
    </div>

    <div id="progress" v-html="progress"></div>
  </div>
</template>

<style scoped>
  #progress {
      height: 200px;
      overflow-y: scroll;
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
          for (let i = 0; i < selectedFiles.length; i++) {
            let file = selectedFiles[i];
            let fileExtension = path.extname(file.name);
            let newFileName = path.basename(file.name, fileExtension) + '-h264' + fileExtension;
            let newFilePath = path.dirname(file.path) + '/' + newFileName;

            if (fileExtension != '.mp4') {
              alert('Only support mp4 files');
            } else {
              const converting = spawn(ffmpeg, ['-i', `"${file.path}"`, '-c:a', 'copy', '-x264-params', 'crf=30', '-b:a', '64k', `"${newFilePath}"`, '-y'], {shell: true});

              converting.stdout.on('data', (data) => {
                console.log(data.toString());
              });

              // Display progress
              converting.stderr.on('data', (data) => {
                this.progress += '<p>' + data.toString() + '</p>';

                //todo: if user using scroll, do not scroll to bottom
                // Scroll to bottom
                let progressElement = document.getElementById('progress')
                progressElement.scrollTop = progressElement.scrollHeight - progressElement.clientHeight;
              });

              converting.on('exit', (code) => {
                // todo: if app window lost focus
                if (true) {
                  notifyDesktop('All the files was converted.');
                }
              });
            }
          }
        }
      }
    }
  }
</script>
