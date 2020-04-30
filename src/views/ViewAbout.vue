<template>
<div class="about">
  <Header :env="env" />
  <About />
</div>
</template>

<script>
import Header from "@/components/header.vue";
import About from "@/components/about.vue";

export default {
  name: "ViewAbout",

  components: {
    Header,
    About
  },

  props: [
    "env"
  ],

}
</script>