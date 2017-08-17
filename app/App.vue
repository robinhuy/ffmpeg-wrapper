<template>
  <div v-on:dragover.stop.prevent v-on:drop.stop.prevent style="height: 100%;">
    <div id="left-menu">
      <left-menu></left-menu>
    </div>

    <div id="main-content">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <router-view :allowedExtension="allowedExtension"></router-view>
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<script>
  import LeftMenu from './components/LeftMenu.vue'

  export default {
    components: {
      LeftMenu
    },
    data () {
      return {
        allowedExtension: ['.mp4', '.flv', '.MP4', '.FLV']
      }
    }
  }

</script>

<style src="element-ui/lib/theme-default/index.css"></style>

<style>
  * {
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: #324157;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-y: scroll;
  }

  img {
    vertical-align: middle;
  }

  a {
    text-decoration: none;
  }

  a:focus {
    outline: none;
  }

  h1 {
    font-size: 1.8rem;
  }

  label {
    cursor: pointer;
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  /* Override Element */
  .el-progress-bar__inner {
    -webkit-transition: width .6s ease;
    -o-transition: width .6s ease;
    transition: width .6s ease;
  }

  .el-input__icon {
    cursor: pointer;
  }

  .el-input.invalid > input {
    border: 1px solid red;
  }

  #left-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 200px;
  }

  #main-content {
    margin-left: 200px;
    padding: 15px;
    background-color: #ffffff;
    min-height: 100%;
  }
</style>
