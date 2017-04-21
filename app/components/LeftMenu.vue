<template>
  <div class="bg">
    <div class="logo">
      <router-link to="/" exact>
        <img alt="logo" src="logo.png"/>
      </router-link>
    </div>

    <ul>
      <li>
        <router-link to="/convert" exact>Convert Video</router-link>
      </li>
      <li>
        <router-link to="/batch-convert" exact>Batch Convert Video</router-link>
      </li>
      <li>
        <router-link to="/cut" exact>Cut Video</router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .bg {
    background-color: #373E43;
    color: #ffffff;
    height: 100%;
  }

  .logo {
    text-align: center;
    padding: 20px 10px 10px 10px;
  }

  .logo img {
    max-width: 50px;
  }

  ul {
    margin-top: 10px;
    padding: 0;
    list-style-type: none;
    text-align: center;
  }

  ul > li > a {
    display: block;
    padding: 15px 30px;
    color: #ffffff;
  }

  ul > li > a:not(.router-link-active):hover {
    color: #2dbefb;
  }

  ul > li > a.router-link-active {
    background-color: #2dbefb;
  }
</style>

<script>
  export default {
    name: 'left-menu'
  }
</script>
