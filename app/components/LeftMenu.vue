<template>
  <div class="bg">
    <el-menu theme="dark" :router="true">
      <el-menu-item index="/"><i class="fa fa-dashboard"></i> Dashboard</el-menu-item>
      <el-menu-item index="/compress"><i class="fa fa-database"></i> Compress Video</el-menu-item>
      <!--<el-menu-item index="/convert"><i class="fa fa-exchange"></i> Convert Video</el-menu-item>-->
      <el-menu-item index="/cut"><i class="fa fa-cut"></i> Cut Video</el-menu-item>
      <!--<el-menu-item index="/split"><i class="fa fa-cubes"></i> Split Video</el-menu-item>-->
      <!--<el-menu-item index="/join"><i class="fa fa-cube"></i> Join Video/Audio</el-menu-item>-->
      <!--<el-menu-item index="/adjust-volume"><i class="fa fa-volume-up"></i> Adjust Volume</el-menu-item>-->
    </el-menu>
  </div>
</template>

<script>
  export default {
    name: 'left-menu'
  }

</script>
