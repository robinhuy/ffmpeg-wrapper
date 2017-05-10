<template>
  <div>
    <div id="upload-zone" class="center"
         :class="{hover: isDragOver}"
         v-on:click="uploadFiles"
         v-on:dragover.stop.prevent="dragFiles"
         v-on:dragleave.stop.prevent="dragLeave"
         v-on:drop.stop.prevent="dropFiles"
         v-on:mouseover="mouseOverImage"
         v-on:mouseout="mouseOutImage">
      <img :src="imgSource"/>
      <div class="message-title">Select {{ isMultiple ? 'files' : 'file' }} to compress</div>
      <div class="message">Or drag and drop video {{ isMultiple ? 'files' : 'file' }}</div>
    </div>

    <input type="file" id="input-files"
           :multiple="isMultiple"
           :accept="this.allowedExtension.join(',')"
           v-on:change="chooseFiles" />
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
</style>

<script>
  export default {
    name: 'upload-zone',
    props: ['selectedFiles', 'isMultiple', 'allowedExtension'],
    data () {
      return {
        imgSource: imgPath + '/choose-files.png',
        isDragOver: false
      }
    },
    mounted () {
      console.log(this.isMultiple)
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
          let exist = this.$parent[this.selectedFiles].find(selected => {
            return selected.path === arr[i].path;
          })

          // Push allowed file which is not exist
          let extName = path.extname(arr[i].name)
          if (exist === undefined && this.allowedExtension.indexOf(extName) !== -1) {
            this.$parent[this.selectedFiles].push(arr[i])
          }
        }
      },
    }
  }
</script>
