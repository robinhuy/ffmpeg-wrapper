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
  import Utils from '../Utils.vue'

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
            settings[this.componentName + Utils.toCapitalize(this.overrideModeProp)] = !this.overrideMode
          }
          // Setting prefix (input)
          else {
            this.$parent[this.filePrefixProp] = e.target.value.trim()
            if (!this.overrideMode && this.filePrefix === '') {
              alert('Cannot left file prefix blank!')
            } else {
              settings[this.componentName + Utils.toCapitalize(this.filePrefixProp)] = this.filePrefix
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
      }
    }
  }

</script>
