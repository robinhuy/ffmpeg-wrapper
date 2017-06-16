<template>
  <div>
    <div id="upload-zone" class="center"
         :class="{hover: isDragOver}"
         @click="uploadFiles"
         @dragover.stop.prevent="dragFiles"
         @dragleave.stop.prevent="dragLeave"
         @drop.stop.prevent="dropFiles"
         @mouseover="mouseOverImage"
         @mouseout="mouseOutImage">
      <img :src="imgSource"/>
      <div class="message-title">Select {{ isMultiple ? 'files' : 'file' }} to {{ actionName }}</div>
      <div class="message">Or drag and drop video {{ isMultiple ? 'files' : 'file' }}</div>
    </div>

    <input type="file" id="input-files"
           :multiple="isMultiple"
           :accept="this.allowedExtension.join(',')"
           @change="chooseFiles" />
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
    props: ['actionName', 'isMultiple', 'allowedExtension', 'methodOnSelect'],
    data () {
      return {
        imgSource: imgPath + '/choose-files.png',
        isDragOver: false
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
        this.$parent[this.methodOnSelect](e.dataTransfer.files)
        this.isDragOver = false
      },
      chooseFiles (e) {
        this.$parent[this.methodOnSelect](e.target.files)
        document.getElementById('input-files').value = null;
      }
    }
  }

</script>
