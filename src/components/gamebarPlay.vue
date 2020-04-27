<template>
<div class="mx-auto mt-5" style="min-width:722px">
  <v-card-actions class="justify-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn text outlined fab :disabled="!startSwitchActive || env.game.state.turn > Object.keys(env.game.state.score).length"
          @click="toggleStartSwitch" :loading="!startSwitchActive" class="mx-5" v-on="on">
          <v-icon>
            {{ env.game.state.started ? 'mdi-account-remove' : 'mdi-account-plus' }}
          </v-icon>
        </v-btn>
      </template>
      <span>{{ env.game.state.started ? 'Allow players' : 'Block players' }}</span>
    </v-tooltip>
    <v-btn-toggle tile :multiple="surrender_option==0" @change="gamebarChange" v-model="active_letter">
      <v-btn text :disabled="disabled_letters[i-1] || env.game.self.letters[i-1] == '*'" v-for="i in 7" :key="i" style="padding:0 6px;">
          <span class="font-weight-black title">
            {{ env.game.self.letters[i-1] }}
          </span>
          <sup>
            {{ letter_info[env.game.self.letters[i-1]].points }}
          </sup>
      </v-btn>
    </v-btn-toggle>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn text fab outlined class="mx-5" :loading="currentlySendingLetters"
          :disabled="(!disabled_letters.some(Boolean) && surrender_option != 0) || env.game.self.name != env.game.state.player || currentlySendingLetters"
          @click="sendLetters()" v-on="on">
          <v-icon>
            mdi-send
          </v-icon>
        </v-btn>
      </template>
      <span>Send</span>
    </v-tooltip>
  </v-card-actions>
  <v-layout justify-center>
    <v-card-actions>
      <v-btn-toggle tile active-class="warning" v-model="surrender_option" @change="replacing_letters($event)" >
        <v-btn class="font-weight-black" text
          :disabled="this.env.game.self.name != this.env.game.state.player || currentlySendingLetters || !disabled_letters.every(v => !Boolean(v)) || Object.values(env.game.self.letters).includes('*')" >
          Replace Tiles
        </v-btn>
      </v-btn-toggle>
    </v-card-actions>
  </v-layout>
  <p align="center">
    <span style="cursor:pointer;" @click="clear_error_msg()" class="error--text pr-2" v-if="warning!=''">{{ warning }}</span>
    <span style="cursor:pointer;text-align:center;text-shadow: 0 0 5px green" @click="clear_error_msg()" v-if="warning!=''">&times;</span>
  </p>
  <p align="center">
  Scores:
    <span v-for="player in Object.keys(env.game.state.score)" :key="player" style="list-style-type:none">
        <span class="font-weight-black" v-if="env.game.state.player == player"><u>{{ player }}</u></span>
        <span class="font-weight-black" v-if="env.game.state.player != player">{{ player }}</span>
        : {{ env.game.state.score[player] }}<span v-if="player != Object.keys(env.game.state.score)[Object.keys(env.game.state.score).length-1]">, </span>
    </span>
  </p>
  <p align="center">
    <span>
      Player: <strong>{{ env.game.self.name }}</strong>
    </span>
    {{ env.game.state.started ? "" : "(Allowing new players)" }}
  </p>


  <v-overlay :value="blank_tile_overlay">
    <v-card>
      <v-card-text>
        <h1> Replace blank</h1>
        <v-form :validate="false">
          <v-text-field @keydown.enter="click_on_confirm" id="wildcard" label="Wildcard" />
        </v-form>
        <p class="error--text">{{ warning_overlay }}</p>
      <v-btn @click="cancelLetterDispatch" text>
        Cancel
      </v-btn>
      <v-btn class="blue" id="confirm_wildcard" elevation="0">
        continue
      </v-btn>
      </v-card-text>
    </v-card>
  </v-overlay>
</div>
</template>

<script>
import {bus} from "@/main.js";

export default {
  name: "GamebarPlay",

  props: [
    "warning",
    "env",
    "letter_info"
  ],

  data: function(){
    return {
      action_index: 0,
      disabled_letters: Array(7).fill(false),
      active_letter: null,
      focus_letters: Array(2),
      startSwitchActive: true,
      surrender_option: null,
      currentlySendingLetters: false,
      blank_tile_overlay: false,
      warning_overlay: ""
    };
  },

  created: function(){
    bus.$on("clear:gamebar_select", (toClear) => {
      this.disabled_letters[toClear] = true;
      this.focus_letters = Array(2);
      this.active_letter = null;
    });
    bus.$on("reactive_letter", (index) => {
      this.disabled_letters[index] = false;
      this.$forceUpdate();
    });
    bus.$on("recieveLetters", (dis_disablers) => {
      if (dis_disablers[0]){
        this.disabled_letters = Array(7).fill(false);
      }
      if (dis_disablers[1]){
        this.currentlySendingLetters = false;
      }
    });
    bus.$on("recievedReplacementTiles", (value) => {
      this.currentlySendingLetters = value.value;
      if (value.success){
        this.surrender_option = null;
        this.active_letter = null;
      }
    });
    bus.$on("setStartSwitchActive", (value) => {
      this.startSwitchActive = value
    });
    bus.$on("fillInTheBlankTiles", (payloadDetails) => {
      if (payloadDetails[1].length == 0){
        bus.$emit("dispatchLetters", payloadDetails[0]);
      } else{
        this.blank_tile_overlay = true;
        this.$nextTick().then(() => {
          document.getElementById("confirm_wildcard").addEventListener("click", () => {
            const new_letter = document.getElementById("wildcard").value.trim().toLowerCase();
            if (new_letter.length == 1 && new_letter >= "a" && new_letter <= "z" ){
              let payload = payloadDetails[0];
              let blank_tile_locations = payloadDetails[1];
              const blank_target = blank_tile_locations.shift();
              payload[1][blank_target] = payload[1][blank_target] + new_letter;
              this.blank_tile_overlay = false;
              bus.$emit("fillInTheBlankTiles", [payload, blank_tile_locations])
            } else{
              this.warning_overlay = "Enter single letter.";
            }
          });
        });
      }

    });
  },

  mounted: function(){
  },

  methods: {
    replacing_letters: function(event){
      this.active_letter = null;
      bus.$emit("setCurrentlyReplacingTiles", event);
    },
    clear_error_msg: function(){
      bus.$emit("clearErrMsg");
    },
    cancelLetterDispatch: function(){
      this.blank_tile_overlay = false;
      bus.$emit("recieveLetters", [false, true]);
    },
    gamebarChange: function(){
      bus.$emit("set:active_letter", this.active_letter);
      if (this.surrender_option != 1){
        this.focus_letters[this.action_index%2] = this.active_letter;
        this.action_index++;
        if (
          this.env.game.self.letters[this.focus_letters[this.action_index%2]] &&
          this.env.game.self.letters[this.focus_letters[(this.action_index-1)%2]]
        ){
          const temp = this.env.game.self.letters[this.focus_letters[(this.action_index-1)%2]];
          this.env.game.self.letters[this.focus_letters[(this.action_index-1)%2]] = this.env.game.self.letters[this.focus_letters[this.action_index%2]];
          this.env.game.self.letters[this.focus_letters[this.action_index%2]] = temp;
          this.focus_letters = Array(2);
          this.active_letter = null;
          bus.$emit("set:active_letter", this.active_letter);
        }
      }
    },
    toggleStartSwitch: function(){
      this.startSwitchActive = false;
      bus.$emit("setGameStartedValue", !this.env.game.state.started);
    },
    sendLetters: function(){
      this.currentlySendingLetters = true;
      if (this.surrender_option == 0){
        bus.$emit("replaceLetters", this.active_letter.map(v => this.env.game.self.letters[v]).join(""));
      } else{
        bus.$emit("sendLetters");
      }
    },
    click_on_confirm: function(){
      document.getElementById("confirm_wildcard").click();
    }
  }
}
</script>

<style scoped>
.bordered {
  border-color: red;
}
</style>