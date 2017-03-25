import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import ConvertVideo from './components/ConvertVideo.vue'
import BatchConvertVideo from './components/BatchConvertVideo.vue'
import CutVideo from './components/CutVideo.vue'

Vue.use(VueRouter)

// Define routers
const routes = [
  { path: '/convert', component: ConvertVideo },
  { path: '/batch-convert', component: BatchConvertVideo },
  { path: '/cut', component: CutVideo }
]

let router = new VueRouter({
  mode: 'history',
  routes
})

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  router
})
