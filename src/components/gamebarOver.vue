<template>
<div class="mx-auto display-2 warning--text" align="center" style="max-width:722px">
  <v-row>
    <v-col>
      Game over
    </v-col>
    <v-col>
      <v-btn class="mx-auto" :disabled="!env.game.state.over">
        Restart Game
      </v-btn>
    </v-col>
  </v-row>
</div>
</template>

<script>
export default {
  name: "GamebarOver",

  props: [
    "env"
  ]
}
</script>