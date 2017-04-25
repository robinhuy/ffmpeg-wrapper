import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Compress from './components/Compress.vue'
import Cut from './components/Cut.vue'
import Split from './components/Split.vue'
import Home from './components/Home.vue'

Vue.use(VueRouter)

// Define routers
const routes = [
  { path: '/compress', component: Compress },
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
