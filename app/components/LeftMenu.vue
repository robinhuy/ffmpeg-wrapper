<template>
  <div class="bg">
    <div class="logo">FFMPEG WRAPPER</div>

    <ul>
      <li>
        <router-link to="/" exact>Convert Video</router-link>
      </li>
      <li>
        <router-link to="/cut" exact>Cut Video</router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .logo {
    text-align: center;
  }

  .bg {
    background-color: #373E43;
    color: #ffffff;
    height: 100%;
  }

  ul {
    padding: 0;
    list-style-type: none;
  }

  ul > li > a {
    display: block;
    padding: 15px;
    color: #ffffff;
  }

  ul > li > a:hover {
    color: #f5deb3;
  }
</style>

<script>
  export default{
    name: 'left-menu'
  }
</script>
