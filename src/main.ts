import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import dotenv from 'dotenv';

import App from './App.vue';

const config = dotenv.config();
if (config.error) {
  console.log('Could not load env file', config.error);
}

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);

new Vue({
  render: h => h(App)
}).$mount('#app');
