<template>
  <div v-on:dragover.stop.prevent v-on:drop.stop.prevent style="height: 100%;">
    <div id="left-menu">
      <left-menu></left-menu>
    </div>

    <div id="main-content">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <router-view></router-view>
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
  }

  a {
    text-decoration: none;
  }

  a:focus {
    outline: none;
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
    height: 100%;
  }

  #main-content {
    margin-left: 200px;
    padding: 15px;
  }
</style>

<script>
  import LeftMenu from './components/LeftMenu.vue'

  export default {
    components: {
      LeftMenu
    }
  }
</script>
