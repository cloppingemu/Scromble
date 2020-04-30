<template>
<v-content>
  <v-card width="95%" class="mx-auto mt-5 pb-1">
    <v-card-title>
      <h1 class="display-1">About Scrobble</h1>
    </v-card-title>
    <v-card-text>
      <p>
        This project is licensed under the Apache License, Version 2.0 (the "License"); you may not use contents of this repository except in compliance with the License. A copy of the License is in the LICENSE file and may also be obtained at <a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>.
      </p>
      <p>
        Software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
      </p>
      <h2> Softwares used:</h2>
      <p><ul>
        <li><a href="https://vuejs.org/">Vue.js</a>: Javascript framework to control web elements.</li>
        <li><a href="https://vuetifyjs.com/">Vuetify.js</a>: CSS Javascript framework.</li>
        <li><a href="https://firebase.google.com/docs/reference">NodeJS Firebase api</a>: <i>Database As A Service</i> provided by Google for a minimal backend.</li>
      </ul></p>
    </v-card-text>
  </v-card>
</v-content>
</template>

<script>
export default {
  name: "About"
}
</script>

<style scoped>
p, ul {
  font-size: large
}
</style>