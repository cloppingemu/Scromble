<template>
<v-content>
  <v-card width="95%" max-width="600px" class="mx-auto mt-5 pb-1">
    <v-card-title>
      <h1 class="display-1">Join a Game</h1>
      <v-spacer></v-spacer>
      <v-btn text depressed href="/about">About</v-btn>
    </v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field ref="gameName" v-model="gameName" label="Game Name" prepend-icon="mdi-border-all" @keydown.enter="attemptSubmit(false)" clearable />
        <v-text-field ref="playerName" v-model="playerName" label="Player Name" prepend-icon="mdi-account" @keydown.enter="attemptSubmit(false)" clearable />
        <v-text-field ref="playerKey" v-model="playerKey" label="Secret Key" prepend-icon="mdi-account-key" @keydown.enter="attemptSubmit(false)" clearable />
      </v-form>
    </v-card-text>

    <v-card-text class="error--text">
      {{ warning }}
    </v-card-text>

    <v-divider></v-divider>

    <v-progress-linear :active="getting_board" color="info" indeterminate></v-progress-linear>

    <v-card-actions class="justify-center" v-if="!getting_board">
      <v-btn width="49%" @click="attemptSubmit(false)">Join</v-btn>
      <v-btn width="49%" @click="attemptSubmit(true)">Start new</v-btn>
    </v-card-actions  >
    <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />
    <div v-if="!getting_board" id="firebaseui-auth-container"> </div>

  </v-card>
</v-content>
</template>

<script>
import {bus} from "@/main.js"

export default {
  name: 'Login',

  created: function(){
    bus.$on("loginFailed", (warning) => {
      this.warning = warning;
      this.getting_board = false;
    });
    bus.$on("createNewGame", () => {
      this.newGameOverlay = true;
    });
    bus.$on("validatedUser", (staleGameName) => {
      if (this.gameName === ""){
        this.gameName = staleGameName;
      }
    });
  },

  mounted: function(){
    this.$refs.gameName.focus();
  },

  data: function(){
    return {
      getting_board: false,
      gameName: "",
      playerName: "",
      playerKey: "",
      warning: "",
    };
  },

  props: [
    "env"
  ],

  methods: {
    attemptSubmit: function(new_game){
      if (this.$refs.gameName.value){
        if (this.$refs.playerName.value){
          if (this.$refs.playerKey.value){
            if (!this.$refs.gameName.value.trim().includes(" ")){
              if (!this.$refs.playerName.value.trim().includes(" ")){
                if (!this.$refs.playerKey.value.trim().includes(" ")){
                  this.get_board(new_game);
                }
                else{
                  this.warning = "No white-space allowed.";
                  this.$refs.playerKey.focus()
                }
              } else{
                this.warning = "No white-space allowed.";
                this.$refs.playerName.focus()
              }
            } else{
              this.warning = "No white-space allowed.";
              this.$refs.gameName.focus()
            }
          } else{
            this.$refs.playerKey.focus();
          }
        } else{
          this.$refs.playerName.focus();
        }
      } else{
        this.$refs.gameName.focus();
      }
    },
    get_board: function(new_game){
      this.getting_board = true;
      bus.$emit("fetchInitial",
        {
          gameName: this.gameName,
          playerName: this.playerName,
          playerKey: this.playerKey,
          fromLogin: true,
          newGame: new_game
        }
      );
    },
  }
};
</script>