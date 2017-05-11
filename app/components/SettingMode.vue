<template>
  <div>
    <label>
      <input type="checkbox" id="setting-mode" @change="saveSetting()" :checked="overrideMode" />
      Replace original files
    </label>

    <label v-if="!overrideMode">
      File Prefix
      <input type="text" id="setting-prefix"
             :class="{invalid: this.filePrefix === ''}"
             :value="filePrefix"
             @input="saveSetting"/>
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
    props: ['overrideMode', 'filePrefix', 'canChangeSetting', 'overrideModeProp', 'filePrefixProp', 'componentName'],
    methods: {
      saveSetting (e) {
        if (this.canChangeSetting) {
          let settings = APP_SETTING.getData()

          // Setting mode (checkbox)
          if (e === undefined) {
            this.$parent[this.overrideModeProp] = !this.overrideMode
            settings[this.componentName + this.toCapitalize(this.overrideModeProp)] = !this.overrideMode
          }
          // Setting prefix (input)
          else {
            this.$parent[this.filePrefixProp] = e.target.value
            if (!this.overrideMode && this.filePrefix === '') {
              alert('Cannot left file prefix blank!')
            } else {
              settings[this.componentName + this.toCapitalize(this.filePrefixProp)] = this.filePrefix
            }
          }

          APP_SETTING.setData(settings)
        } else {
          if (e === undefined) {
            let checkbox = document.getElementById('setting-mode')
            checkbox.checked = !checkbox.checked
          } else {
            document.getElementById('setting-prefix').value = this.$parent[this.filePrefixProp]
          }
        }
      },
      toCapitalize (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    }
  }
</script>
