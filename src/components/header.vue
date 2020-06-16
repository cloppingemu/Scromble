<template>
<v-app-bar app color="primary" dark>
  <div class="d-flex align-center link" @click="go_to_link('/')">
    <v-icon class="shrink mr-1" x-large transition="scale-transition">mdi-border-all</v-icon>
    <h1 class="shrink mt-1 hidden-xs-only">Scromble</h1>
  </div>

  <v-spacer>
    <a id="navigator"></a>
  </v-spacer>

  <v-speed-dial v-if="env.user.photoURL" v-model="authFab" direction="bottom" transition="scale">
    <template v-slot:activator>
        <v-btn fab small light :loading="fab_loading">
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
        <v-btn fab dark small color="red" v-on="on" @click="delete_self()">
          <v-icon>mdi-account-remove</v-icon>
        </v-btn>
      </template>
      <span>Delete account</span>
    </v-tooltip>

  </v-speed-dial>
</v-app-bar>
</template>

<script>
import {bus} from "../main.js";
import {functions} from "@/firebaseInit";

const deregisterUser = functions.httpsCallable("deregisterUser");

export default {
  name: 'TopBar',

  props: [
    "env"
  ],

  data: function(){
    return {
      authFab: false,
      fab_loading: false
    };
  },

  created: function(){
  },

  mounted: function(){
  },

  methods: {
    firebase_deauth: function(){
      this.fab_loading = true
      bus.$emit("firebaseDeAuth");
    },
    new_game: function(){
      bus.$emit("createNewGame");
    },
    go_to_link: function(location){
      const navLink = document.getElementById("navigator");
      navLink.setAttribute("href", location);
      navLink.click();
    },
    delete_self: function(){
      this.fab_loading = true
      deregisterUser({targetUid: this.env.user.uid}).then((res) => {
        if (res.data[0] == "success"){
          this.firebase_deauth();
        }
      }).catch(() => {
        this.fab_loading = false;
      });
    }
  }
};
</script>
