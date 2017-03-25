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
  #left-menu {
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
  }

  #main-content {
    margin-left: 200px;
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
