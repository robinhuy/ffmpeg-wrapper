import Vue from 'vue'
import VueRouter from 'vue-router'
import Element from 'element-ui'

import App from './App.vue'
import Compress from './pages/Compress.vue'
import Convert from './pages/Convert.vue'
import Cut from './pages/Cut.vue'
import Split from './pages/Split.vue'
import Join from './pages/Join.vue'
import AdjustVolume from './pages/AdjustVolume.vue'
import Home from './pages/Home.vue'

Vue.use(Element)
Vue.use(VueRouter)

// Define routers
const routes = [
  { path: '/compress', component: Compress },
  { path: '/convert', component: Convert },
  { path: '/cut', component: Cut },
  { path: '/split', component: Split },
  { path: '/join', component: Join },
  { path: '/adjust-volume', component: AdjustVolume },
  { path: '*', component: Home }
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
