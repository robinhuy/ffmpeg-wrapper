import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Compress from './components/pages/Compress.vue'
import Convert from './components/pages/Convert.vue'
import Cut from './components/pages/Cut.vue'
import Split from './components/pages/Split.vue'
import Home from './components/pages/Home.vue'

Vue.use(VueRouter)

// Define routers
const routes = [
  { path: '/compress', component: Compress },
  { path: '/convert', component: Convert },
  { path: '/cut', component: Cut },
  { path: '/split', component: Split },
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
