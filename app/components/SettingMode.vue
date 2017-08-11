<template>
  <div>
    <el-row>
      <el-col :span="12">
        <el-checkbox @change="saveSetting(1)" v-model="override">Replace original files</el-checkbox>
      </el-col>

      <el-col :span="12">
        <label v-if="!overrideMode">
          File Prefix
          <el-input :class="{invalid: this.prefix === ''}"
                    v-model="prefix"
                    @change="saveSetting(2)"></el-input>
        </label>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import Utils from './Utils.vue'

  export default {
    name: 'setting-mode',
    props: ['overrideMode', 'filePrefix', 'canChangeSetting', 'overrideModeProp', 'filePrefixProp', 'componentName'],
    data () {
      return {
        override: true,
        prefix: ''
      }
    },
    created () {
      this.override = this.overrideMode
      this.prefix = this.filePrefix
    },
    methods: {
      saveSetting (type) {
        if (this.canChangeSetting) {
          let settings = APP_SETTING.getData()

          // Setting mode (checkbox)
          if (type === 1) {
            this.$emit('changeSetting', 1, this.override)
          }
          // Setting prefix (input)
          else {
            this.prefix = this.prefix.trim()

            if (!this.override && this.prefix === '') {
              alert('Cannot left file prefix blank!')
            } else {
              this.$emit('changeSetting', 2, this.prefix)
            }
          }
        } else {
          if (type === 1) {
            this.override = !this.override
          } else {
            this.prefix = this.filePrefix
          }
        }
      }
    }
  }

</script>

