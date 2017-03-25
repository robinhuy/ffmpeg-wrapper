import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import ConvertVideo from './components/ConvertVideo.vue'
import CutVideo from './components/CutVideo.vue'

Vue.use(VueRouter)

// Define routers
const routes = [
  { path: '/', component: ConvertVideo },
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
