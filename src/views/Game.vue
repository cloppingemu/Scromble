<template>
<div class="Game">
  <!-- <Header :env="env"
    v-if="!env.game.self.name && !env.game.state.over" /> -->
  <Playground :env="env" :letter_info="letter_info" />
  <GamebarPlay :env="env" :letter_info="letter_info" :warning="error_msg"
    v-if="env.game.self.name && !env.game.state.over" />
  <GamebarSpectate :env="env"
    v-if="!env.game.self.name || env.game.state.over" />
</div>
</template>

<script>
import {db} from "@/firebaseInit";
import {functions} from "@/firebaseInit";

const submitTiles = functions.httpsCallable("submitTiles");
const replaceTiles = functions.httpsCallable("replaceTiles");
const setGameStarted = functions.httpsCallable("setGameStarted");

const allEqual = arr => arr.every( v => v === arr[0] )

// import Header from "@/components/header.vue";
import Playground from "@/components/playground.vue";
import GamebarPlay from "@/components/gamebarPlay.vue";
import GamebarSpectate from "@/components/gamebarSpectate.vue";

import {bus} from "@/main.js";

export default {
  name: "Game",

  components: {
    // Header,
    Playground,
    GamebarPlay,
    GamebarSpectate
  },

  props: [
    "env"
  ],

  data: function(){
    return {
      letter_info: {
        "a": {points: 1, count: 9}, "b": {points: 3, count: 2}, "c": {points: 3, count: 2},
        "d": {points: 2, count: 4}, "e": {points: 1, count: 12}, "f": {points: 4, count: 2},
        "g": {points: 2, count: 3}, "h": {points: 4, count: 2}, "i": {points: 1, count: 9},
        "j": {points: 8, count: 1}, "k": {points: 5, count: 1}, "l": {points: 1, count: 4},
        "m": {points: 3, count: 2},"n": {points: 1, count: 6},"o": {points: 1, count: 8},
        "p": {points: 3, count: 2}, "q": {points: 10, count: 1}, "r": {points: 1, count: 6},
        "s": {points: 1, count: 4}, "t": {points: 1, count: 6}, "u": {points: 1, count: 4},
        "v": {points: 4, count: 2}, "w": {points: 4, count: 2}, "x": {points: 8, count: 1},
        "y": {points: 4, count: 2}, "z": {points: 10, count: 1}, "_": {points: 0, count: 2},
        "*": {points: " "}
      },
      active_letter: null,
      active_letters: {},
      playground_index: null,
      error_msg: ""
    };
  },

  created: function(){
    bus.$on("set:playground_index", (event) => {
      if ((this.active_letter != null) && (event != null) && this.env.game.state.board[event] == " "){
        // transfer letter from bar to board
        this.active_letters[event] = this.active_letter;
        let board = Array.from(this.env.game.state.board);
        board[event] = this.env.game.self.letters[this.active_letter];
        this.env.game.state.board = board.join("");
        this.$nextTick().then(() => {
          bus.$emit("clear:playground_select");
          bus.$emit("clear:gamebar_select", this.active_letter);
          this.active_letter = null;
        });
      } else if((this.active_letter == null) && (event != null) && this.env.game.state.board[event] != " "){
        // transfer letter from board to bar
        let board = Array.from(this.env.game.state.board);
        board[event] = " ";
        this.env.game.state.board = board.join("");
        this.$nextTick().then(() => {
          bus.$emit("clear:playground_select");
          bus.$emit("clear:gamebar_select", this.active_letter);
          bus.$emit("reactive_letter", this.active_letters[event]);
          delete this.active_letters[event];
          this.active_letter = null;
        });
      } else if((this.active_letter == null) && (event != null) && this.env.game.state.board[event] == " "){
        // clear board selection
        this.$nextTick().then(() => {
          bus.$emit("clear:playground_select");
        });
      }
    });
    bus.$on("set:active_letter", (event) => {
      this.active_letter = event;
    });
    bus.$on("sendLetters", () => {
      const payload = [
        [
          this.env.game.name,
          this.env.game.self.name,
          this.env.game.self.key
        ],
        Object.fromEntries(Object.entries(this.active_letters).map((v) => {
          return [v[0], this.env.game.self.letters[v[1]]];
        }))
      ];
      if (allEqual(Object.keys(payload).map(v => Math.floor(v/15))) || allEqual(Object.keys(payload).map(v => v%15))){
        const blankTilesKeys = Object.keys(payload[1]).filter(k => payload[1][k] == "_");
        bus.$emit("fillInTheBlankTiles", [payload, blankTilesKeys]);
      }
    });
    bus.$on("dispatchLetters", (payload) => {
      submitTiles(payload).then((response) => {
        if (response.data[0] == "success"){
          this.env.game.self.letters = Array.from(response.data[1]);
          bus.$emit("recieveLetters", [true, true]);
          this.active_letters = {};
        } else{
          this.error_msg = response.data[1];
          bus.$emit("recieveLetters", [false, true]);
        }
      }).catch(() => {
        bus.$emit("recieveLetters", [false, true]);
      });
    });
    bus.$on("clearErrMsg", () => {
      this.error_msg = "";
    });
    bus.$on("replaceLetters", (letters) => {
      const payload = [
        [
          this.env.game.name,
          this.env.game.self.name,
          this.env.game.self.key
        ],
        letters
      ];
      replaceTiles(payload).then((response) => {
        if (response.data[0] === "success"){
          this.env.game.self.letters = Array.from(response.data[1]);
        } else{
          this.error_msg = response.data[1];
        }
      }).then(() => {
        bus.$emit("recievedReplacementTiles", {success: true, value: false});
        bus.$emit("setCurrentlyReplacingTiles", null);
      }).catch(() => {
        this.error_msg = "Network error";
        bus.$emit("recievedReplacementTiles", {success: false, value: false});
      });
    });
    bus.$on("setGameStartedValue", (value) => {
      const payload = [
        value, this.env.game.name,
        this.env.game.self.name, this.env.game.self.key
      ];
      setGameStarted(payload).then((response) => {
        if (response.data[0] !== "success"){
          this.error_msg = response.data[1];
        }
      }).then(() => {
        bus.$emit("setStartSwitchActive", true);
      }).catch(() => {
        this.error_msg = "Network error";
      }).then(() => {
        bus.$emit("setStartSwitchActive", true);
      });
    });
    bus.$on("startSpectateGame", (boardName) => {
      this.env.game.name = boardName;
      db.ref(`/games/${boardName}/state`).on("value", (snap) => {
        const payload = snap.val();
        payload.board_disabled = Array.from(snap.val().board).map(x => x !== " ");
        payload.lastUpdated = Object.keys(Array(225).fill()).map((v) => payload.board[v] != this.env.game.state.board[v] && payload.board[v] != " ");
        setTimeout(() => {this.env.game.state.lastUpdated = Array(225).fill(false);}, 7500)
        this.env.game.state = payload;
      });
    });
  },

  mounted: function(){
    if (!this.$route.query.b){
      this.$router.push(`/`);
    } else{
      bus.$emit("startSpectateGame", this.$route.query.b.trim().toLowerCase());
    }
  },

  methods:{
  }
}
</script>
