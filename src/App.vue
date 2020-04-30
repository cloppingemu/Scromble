<template>
<v-app id="app">
  <router-view  :env="env"/>
</v-app>
</template>

<script>
import {functions} from "@/firebaseInit";
import {auth} from "@/firebaseInit";

import {bus} from "@/main";

const validateUser = functions.httpsCallable("validateUser")
const getGame = functions.httpsCallable("getGame");
const makeNewGame = functions.httpsCallable("makeNewGame");


export default {
  name: "App",

  data: function() {
    return {
      env: {
        user: {
          displayName: "",
          photoURL: ""
        },
        game: {
          name: null,
          state: {
            board_disabled: Array(225).fill(false),
            board: Array(225),
            points: Array(225),
            lastUpdated: Array(225).fill(false),
            started: false,
            over: false,
            player: "",
            score: Array(4),
            turn: 0
          },
          self: {
            name: null,
            key: null,
            letters: Array(7)
          }
        }
      }
    };
  },

  created: function(){
    bus.$on("firebaseDeAuth", () => {
      auth.signOut();
      window.location.reload(true);
    });

    bus.$on("fetchInitial", (loginInfo) => {
      const gameName = loginInfo.gameName.trim().toLowerCase();
      const playerName = loginInfo.playerName.trim().toLowerCase();
      const playerKey = loginInfo.playerKey.trim().toLowerCase();
      // loginInfo.fromLogin: event triggered from Login?
      // loginInfo.newGame: start new game

      let startGame =  getGame;
      if (loginInfo.newGame){
        startGame = makeNewGame;
      }

      startGame([gameName, playerName, playerKey]).then((response) => {
        if (response.data[0] === "success"){
          this.env.game.name = gameName;
          this.env.game.self.letters = Array.from(response.data[1]);
          this.env.game.self.name = playerName;
          this.env.game.self.key = playerKey;

          let state_payload = response.data[2];
          state_payload.board_disabled = Array.from(response.data[2].board).map(x => x !== " ");
          state_payload.lastUpdated = Array(225).fill(false);
          this.env.game.state = state_payload;

          if (loginInfo.fromLogin){
            this.$router.push(`/game?b=${gameName}`);
          }

        } else{
          bus.$emit("loginFailed", response.data[1]);
        }
      }).catch(() => {
        bus.$emit("loginFailed", "Network Error")
      });
    });


  },

  mounted: function(){
    auth.onAuthStateChanged((user) => {
      if (user){
        this.env.user.uid = user.uid;
        this.env.user.displayName = user.displayName;
        this.env.user.photoURL = user.photoURL;
        bus.$emit("showCreateAtLogin");
        validateUser({}).then((res) => {
          if (res.data[0]){
            bus.$emit("validatedUser", res.data[0]);
          }
        });
      }
    });
  },

  methods: {
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -o-user-select: none;
}

.link {
  cursor: pointer
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
