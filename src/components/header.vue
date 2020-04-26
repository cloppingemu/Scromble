<template>
<v-app-bar hide-on-scroll app color="primary" dark>
  <div class="d-flex align-center link" @click="go_to_link('/')">
    <v-icon class="shrink mr-1" x-large transition="scale-transition">mdi-border-all</v-icon>
    <h1 class="shrink mt-1 hidden-xs-only">Scromble</h1>
  </div>

  <v-spacer>
    <a id="navigator"></a>
  </v-spacer>

  <v-speed-dial v-if="env.user.photoURL" v-model="authFab" direction="bottom" transition="scale">
    <template v-slot:activator>
        <v-btn fab small light>
          <v-avatar size=42 v-if="!authFab">
            <img :src="env.user.photoURL" :alt="env.user.displayName.substring(0,1).toUpperCase()" />
          </v-avatar>
          <v-icon v-else>mdi-close</v-icon>
        </v-btn>
    </template>

    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn fab dark small color="green" @click="firebase_deauth()" v-on="on">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </template>
      <span>Logout</span>
    </v-tooltip>
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn fab dark small color="red" v-on="on">
          <v-icon>mdi-account-remove</v-icon>
        </v-btn>
      </template>
      <span>Delete account</span>
    </v-tooltip>

  </v-speed-dial>
</v-app-bar>
</template>

<script>
import {bus} from "../main.js"

export default {
  name: 'TopBar',

  props: [
    "env"
  ],

  data: function(){
    return {
      authFab: false,
      backEnv: {
        selfUID: false,
        db: {}
      }
    };
  },

  created: function(){
  },

  mounted: function(){
  },

  methods: {
    firebase_deauth: function(){
      bus.$emit("firebaseDeAuth");
    },
    new_game: function(){
      bus.$emit("createNewGame");
    },
    go_to_link: function(location){
      const navLink = document.getElementById("navigator");
      console.log(location);
      navLink.setAttribute("href", location);
      navLink.click();
    }
  }
};
</script>