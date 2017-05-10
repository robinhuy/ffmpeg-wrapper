<template>
  <div>
    <label>
      <input type="checkbox" v-on:change="changeMode('mode')" :checked="overrideMode" />
      Replace original files
    </label>

    <label v-if="!overrideMode">
      File Prefix
      <input type="text" id="setting-prefix"
             :class="{invalid: this.filePrefix === ''}"
             :value="filePrefix"
             v-on:input="changePrefix"/>
    </label>
  </div>
</template>

<style scoped>
  input.invalid {
    border: 1px solid red;
  }
</style>

<script>
  export default {
    name: 'setting-mode',
    props: ['overrideMode', 'filePrefix', 'methodOnChange'],
    computed: {

    },
    methods: {
      changePrefix (e) {
        this.$parent.filePrefix = e.target.value
        if (!this.overrideMode && this.filePrefix === '') {
          alert('Cannot left file prefix blank!')
        } else {
          this.$parent[this.methodOnChange]('filePrefix')
        }
      },
      changeMode () {
        this.$parent.overrideMode = !this.$parent.overrideMode
        this.$parent[this.methodOnChange]('mode')
      }
    }
  }
</script>
