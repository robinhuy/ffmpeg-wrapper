<template>
  <div class="bg">
    <div class="logo">
      <img alt="logo" src="logo.png"/>
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
    padding: 10px;
  }

  .logo img {
    max-width: 50px;
  }

  ul {
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
    color: #84e5f7;
  }

  ul > li > a.router-link-active {
    background-color: rgba(90,200,230,0.7);
  }
</style>

<script>
  export default{
    name: 'left-menu'
  }
</script>
