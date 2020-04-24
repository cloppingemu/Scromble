<template>
<v-content>
<v-progress-linear :active="!env.game.state.board[0]" indeterminate></v-progress-linear>
<v-card tile class="pb-1 pt-2" align="center" flat>
  <div v-for="i in 15" :key="i">
    <v-btn-toggle tile v-model="board_index"
      @change="emit_playground_index($event)"
    >
      <v-btn
        text v-for="j in 15" :class="boardColors[(i-1)*15+j-1][0]" :key="j" :value="(i-1)*15+j-1"
        style="padding:0 6px;" :disabled="env.game.state.board_disabled[(i-1)*15+j-1] || env.game.self.name != env.game.state.player"
      >
        <span
          :class="((env.game.state.board[(i-1)*15+j-1] !== ' ') && env.game.state.board[(i-1)*15+j-1] ? 'font-weight-black title' : 'font-weight-medium grey--text text--darken-2 caption') + (env.game.state.board_disabled[(i-1)*15+j-1] ? ' grey--text text--darken-2' : '')"
        >
          <span v-if="env.game.state.points[(i-1)*15+j-1] != '_'">{{ (env.game.state.board[(i-1)*15+j-1] !== " ") && env.game.state.board[(i-1)*15+j-1] ? env.game.state.board[(i-1)*15+j-1] : boardColors[(i-1)*15+j-1][1] }}</span>
          <u v-if="env.game.state.points[(i-1)*15+j-1] == '_'">{{ (env.game.state.board[(i-1)*15+j-1] !== " ") && env.game.state.board[(i-1)*15+j-1] ? env.game.state.board[(i-1)*15+j-1] : boardColors[(i-1)*15+j-1][1] }}</u>
        </span>
        <sup v-if='(env.game.state.board[(i-1)*15+j-1] !== " ") && env.game.state.board[(i-1)*15+j-1]' :class="env.game.state.board_disabled[(i-1)*15+j-1] ? 'font-weight-bold grey--text text--darken-2' : 'font-weight-black'">{{ env.game.state.points[(i-1)*15+j-1] == '_' ? "0" : letter_info[env.game.state.board[(i-1)*15+j-1]].points }}</sup>
      </v-btn>
    </v-btn-toggle>
  </div>
</v-card>
</v-content>
</template>

<script>
import {bus} from "@/main.js";

export default {
  name: "Playground",

  props: [
    "env",
    "letter_info"
  ],

  data: function(){
    return {
      queries: "hello world",
      board_index: null,
      boardColors: Array(225).fill(Array(2)),
      bus: bus
    };
  },

  created: function(){
    bus.$on("clear:playground_select", () => {
      this.board_index = null;
    });
  },

  mounted: function(){
    this.queries = this.$route.query;
    const w3 = ["red lighten-2", "3⨉W"];
    const w2 = ["red lighten-4", "2⨉W"];
    const l3 = ["teal lighten-2", "3⨉L"];
    const l2 = ["teal lighten-4", "2⨉L"];
    const x1 = ["", ""];
    this.boardColors = [
      w3,x1,x1,l2,x1,x1,x1,w3,x1,x1,x1,l2,x1,x1,w3,
      x1,w2,x1,x1,x1,l3,x1,x1,x1,l3,x1,x1,x1,w2,x1,
      x1,x1,w2,x1,x1,x1,l2,x1,l2,x1,x1,x1,w2,x1,x1,
      l2,x1,x1,w2,x1,x1,x1,l2,x1,x1,x1,w2,x1,x1,l2,
      x1,x1,x1,x1,w2,x1,x1,x1,x1,x1,w2,x1,x1,x1,x1,
      x1,l3,x1,x1,x1,l3,x1,x1,x1,l3,x1,x1,x1,l3,x1,
      x1,x1,l2,x1,x1,x1,l2,x1,l2,x1,x1,x1,l2,x1,x1,
      w3,x1,x1,l2,x1,x1,x1,w2,x1,x1,x1,l2,x1,x1,w3,
      x1,x1,l2,x1,x1,x1,l2,x1,l2,x1,x1,x1,l2,x1,x1,
      x1,l3,x1,x1,x1,l3,x1,x1,x1,l3,x1,x1,x1,l3,x1,
      x1,x1,x1,x1,w2,x1,x1,x1,x1,x1,w2,x1,x1,x1,x1,
      l2,x1,x1,w2,x1,x1,x1,l2,x1,x1,x1,w2,x1,x1,l2,
      x1,x1,w2,x1,x1,x1,l2,x1,l2,x1,x1,x1,w2,x1,x1,
      x1,w2,x1,x1,x1,l3,x1,x1,x1,l3,x1,x1,x1,w2,x1,
      w3,x1,x1,l2,x1,x1,x1,w3,x1,x1,x1,l2,x1,x1,w3
    ];
  },

  methods: {
    emit_playground_index: function(event){
      bus.$emit('set:playground_index', event);
    }
  }
}
</script>

<style scoped>
u {
  text-decoration: none;
  border-bottom: 3px solid;
}
</style>