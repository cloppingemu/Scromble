<template>
<v-content>
<v-progress-linear :active="!env.game.state.board[0]" indeterminate></v-progress-linear>
<v-card tile class="pb-1 pt-2" align="center" flat>
  <div v-for="i in 15" :key="i">
    <v-btn-toggle tile v-model="board_index"
      @change="emit_playground_index($event)"
    >
      <v-btn
        v-for="j in 15" :key="j" :value="(i-1)*15+j-1"
        :class="get_button_class((i-1)*15+j-1)" text style="padding:0 6px;"
        :disabled="env.game.state.board_disabled[(i-1)*15+j-1] || env.game.self.name != env.game.state.player || currently_replacing_tiles == 0"
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
      update_color: "yellow lighten-4",
      currently_replacing_tiles: null
    };
  },

  created: function(){
    bus.$on("clear:playground_select", () => {
      this.board_index = null;
    });
    bus.$on("setCurrentlyReplacingTiles", (value) => {
      this.currently_replacing_tiles = value;
    });
  },

  mounted: function(){
    this.queries = this.$route.query;
    const w3 = ["red lighten-2", "3⨉W", "red lighten-3"];
    const w2 = ["red lighten-4", "2⨉W", "red lighten-5"];
    const l3 = ["teal lighten-2", "3⨉L", "teal lighten-3"];
    const l2 = ["teal lighten-4", "2⨉L", "teal lighten-5"];
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
    },
    get_button_class: function(index){
      if (this.env.game.state.lastUpdated[index]) {
        return this.update_color;
      } else if (this.env.game.self.name != this.env.game.state.player){
        return this.boardColors[index][2];
      } else{
        return this.boardColors[index][0];
      }
    }
  }
}
</script>

<style scoped>
u {
  text-decoration: none;
  border-bottom: 3px solid;
}
button {
  transition: background-color 0.25s ease;
}
</style>
