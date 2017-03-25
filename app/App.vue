<template>
  <div>
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

  .btn {
    padding: 6px 12px;
    text-align: center;
    transition: all 50ms;
    background-color: #00a65a;
    color: #ffffff;
    border: 1px solid #008d4c;
    border-radius: 3px;
    text-shadow: none;
    box-shadow: none;
    cursor: pointer;
  }

  .btn, .btn:active {
    outline: 0;
  }

  .btn:hover {
    background-color: #449d44;
    border-color: #398439;
  }

  .btn.disabled {
    background-color: #5cb85c;
    border-color: #4cae4c;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.65;
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
