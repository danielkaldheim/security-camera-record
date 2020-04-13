<template>
  <div id="app">
    <h1>Security camera index</h1>
    <Files></Files>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Files from './components/Files.vue';

@Component({
  components: {
    Files
  }
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
h1 {
  text-align: center;
}
a {
  color: #2c3e50;
  text-decoration: none;
}
</style>
