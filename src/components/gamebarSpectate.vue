<template>
<div class="mt-5 mx-auto" style="max-width:722px">
  <v-row>
    <v-col>
      <span class="display-2 warning--text ">Join Game</span>
      <p align="left" style="padding:0 5%;" class="error--text">{{ env.game.state.started ? env.game.state.over ? "Current game is over" : "Not allowing new players" : "" }}</p>
      <p class="mt-2">
        Current Scores: <br />
        <v-row>
          <v-col>
            <span v-for="playerIndex in Object.keys(env.game.state.score).length" :key="playerIndex">
              <span v-if="!((playerIndex-1) % 2)">
                <b v-if="Object.keys(env.game.state.score)[playerIndex-1] != env.game.state.player">{{ Object.keys(env.game.state.score)[playerIndex-1] }}:</b>
                <b v-if="Object.keys(env.game.state.score)[playerIndex-1] == env.game.state.player"><u>{{ Object.keys(env.game.state.score)[playerIndex-1] }}:</u></b>
                {{ env.game.state.score[Object.keys(env.game.state.score)[playerIndex-1]] }} <br />
              </span>
            </span>
          </v-col>
          <v-col>
            <span v-for="playerIndex in Object.keys(env.game.state.score).length" :key="playerIndex">
              <span v-if="((playerIndex-1) % 2)">
                <b v-if="Object.keys(env.game.state.score)[playerIndex-1] != env.game.state.player">{{ Object.keys(env.game.state.score)[playerIndex-1] }}:</b>
                <b v-if="Object.keys(env.game.state.score)[playerIndex-1] == env.game.state.player"><u>{{ Object.keys(env.game.state.score)[playerIndex-1] }}:</u></b>
                {{ env.game.state.score[Object.keys(env.game.state.score)[playerIndex-1]] }}
              </span>
            </span>
          </v-col>
        </v-row>
      </p>
    </v-col>
    <v-col align="center">
      <v-form>
        <v-text-field ref="playerName" v-model="playerName" label="Player Name" prepend-icon="mdi-account" @keydown.enter="attemptSubmit" clearable />
        <v-text-field ref="playerKey" v-model="playerKey" label="Secret Key" prepend-icon="mdi-account-key" @keydown.enter="attemptSubmit" clearable>
          <template v-slot:append-outer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                  <v-icon v-on="on">mdi-help-circle-outline</v-icon>
              </template>
              <span>Needed if you reconnect</span>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-form>
      <p align="left" style="padding:0 5%;" class="error--text">{{ warning }}</p>
      <v-btn class="mx-auto" :loading="submitBtnLoading" @click="attemptSubmit" block>
        {{ env.game.state.over ? "Start Game Again" : "Join" }}
      </v-btn>
    </v-col>
  </v-row>
</div>
</template>

<script>
import {bus} from "@/main.js";

export default {
  name: "GamebarSpectate",

  props: [
    "env"
  ],

  data: function(){
    return {
      playerName: "",
      playerKey: "",
      submitBtnLoading: false,
      warning: "",
    };
  },

  created: function(){
    bus.$on("loginFailed", (warning) => {
      this.submitBtnLoading = false;
      this.warning = warning;
    });
  },

  mounted: function(){
    this.$refs.playerName.focus();
  },

  methods: {
    attemptSubmit: function(){
      if (this.playerName){
        if (this.playerKey){
          if (!this.playerName.trim().includes(" ")){
            if (!this.playerKey.trim().includes(" ")){
              this.submitBtnLoading = true;
              bus.$emit("fetchInitial", {
                gameName: this.$route.query.b,
                playerName: this.playerName,
                playerKey: this.playerKey,
                fromLogin: false,
                newGame: this.env.game.state.over
              });
            } else{
              this.warning = "No white-space allowed.";
              this.$refs.playerKey.focus();
            }
          } else{
            this.warning = "No white-space allowed.";
            this.$refs.playerName.focus();
          }
        } else{
          this.$refs.playerKey.focus();
        }
      } else{
        this.$refs.playerName.focus();
      }
    }
  }
}
</script>
