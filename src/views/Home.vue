<template>
<div class="home">
  <Header :env="env" />
  <Login :env="env" />
</div>
</template>

<script>
import Login from "@/components/login.vue";
import Header from "@/components/header.vue";

export default {
  name: "Home",

  components: {
    Login,
    Header
  },

  props: [
    "env"
  ],

  mounted: function(){
  }
}
</script>
