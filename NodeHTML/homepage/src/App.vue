<template>
  <div id="app">
    <!--
    <img src="./assets/logo.png" />
    <router-link to="/view1">Go to view1</router-link>
    <router-link to="/view2">Go to view2</router-link>
    -->
    <div >_</div>
    <router-view/>
  <!--<testcomponent></testcomponent>-->
  </div>
</template>

<script>
import testcomponent from './components/test-component.vue'

export default {
  name: 'App',
  components: { testcomponent }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
