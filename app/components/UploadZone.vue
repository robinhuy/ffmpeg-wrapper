<template>
  <div>
    <div id="upload-zone" class="text-center"
         :class="{'is-drag-over': isDragOver}"
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

<script>
  export default {
    name: 'upload-zone',
    props: ['actionName', 'isMultiple', 'allowedExtension', 'methodOnSelect'],
    data () {
      return {
        imgSource: staticPath + 'img/choose-files.png',
        isDragOver: false
      }
    },
    methods: {
      mouseOverImage () {
        this.imgSource = staticPath + 'img/choose-files-hover.png'
      },
      mouseOutImage () {
        this.imgSource = staticPath + 'img/choose-files.png'
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

<style scoped>
  #upload-zone {
    height: 250px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    color: #616161;
  }

  #upload-zone:hover {
    color: #000000;
    border-color: #20a0ff;
  }

  #upload-zone.is-drag-over {
    color: #000000;
    background-color: rgba(32,159,255,.06);
    border: 2px dashed #20a0ff;
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

  #input-files {
    display: none;
  }
</style>
