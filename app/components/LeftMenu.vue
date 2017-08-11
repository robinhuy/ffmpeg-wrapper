<template>
  <div class="bg">
    <div class="logo">
      <router-link to="/" exact>
        <img alt="logo" src="logo.png"/>
      </router-link>
    </div>

    <ul>
      <li>
        <router-link to="/compress" exact>Compress Video</router-link>
      </li>
      <li>
        <router-link to="/convert" exact>Convert Video</router-link>
      </li>
      <li>
        <router-link to="/cut" exact>Cut Video/Audio</router-link>
      </li>
      <li>
        <router-link to="/split" exact>Split Video/Audio</router-link>
      </li>
      <li>
        <router-link to="/join" exact>Join Video/Audio</router-link>
      </li>
      <li>
        <router-link to="/adjust-volume" exact>Adjust Volume</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'left-menu'
  }

</script>

<style scoped>
  .bg {
    color: #ffffff;
  }

  .logo {
    text-align: center;
    padding: 20px 10px;
    background-color: #222a31;
  }

  .logo img {
    max-width: 50px;
  }

  ul {
    margin-top: 0;
    padding: 0;
    list-style-type: none;
    text-align: center;
  }

  ul > li > a {
    display: block;
    padding: 15px 30px;
    color: #eeeeee;
  }

  ul > li > a:not(.router-link-active):hover {
    color: #ffffff;
  }

  ul > li > a.router-link-active {
    background-color: #434b53;
  }
</style>
