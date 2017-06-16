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
    background-color: #32373d;
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

  .center {
    text-align: center;
  }

  .btn {
    padding: 6px 12px;
    text-align: center;
    transition: all 50ms;
    color: #ffffff;
    background-color: #2dbefb;
    border: 1px solid #2dbefb;
    border-radius: 3px;
    text-shadow: none;
    box-shadow: none;
    cursor: pointer;
  }

  .btn, .btn:active {
    outline: 0;
  }

  .btn:hover {
    background-color: #03a9f4;
    border-color: #03a9f4;
  }

  .btn.disabled {
    background-color: #373e43;
    border-color: #373e43;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.65;
  }

  .progress {
    height: 20px;
    margin-bottom: 20px;
    overflow: hidden;
    background-color: #f5f5f5;
    border-radius: 4px;
    -webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
    box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
  }

  .progress .progress-bar {
    float: left;
    width: 0;
    height: 100%;
    font-size: 12px;
    line-height: 20px;
    color: #fff;
    background-color: #337ab7;
    -webkit-box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
    box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
    -webkit-transition: width .6s ease;
    -o-transition: width .6s ease;
    transition: width .6s ease;
  }

  .progress .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    border: 0;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #left-menu {
    position: absolute;
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

<script>
  import LeftMenu from './components/parts/LeftMenu.vue'

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
