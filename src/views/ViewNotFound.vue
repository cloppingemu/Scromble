<template>
<div class="404">
  <Header :env="env"/>
  <ComponentNotFound />
</div>
</template>

<script>
import Header from "@/components/header.vue";
import ComponentNotFound from "@/components/componentNotFound.vue";

export default {
  name: "ViewNotFound",

  components: {
    Header,
    ComponentNotFound
  },

  props: [
    "env"
  ],

}
</script>