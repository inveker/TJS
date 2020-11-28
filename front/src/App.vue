<template>
  <div>
    <btn-simple @click.native="newTestAction">New test</btn-simple>

    <table v-if="scripts.length > 0">
      <caption>Scripts on page</caption>
      <tr>
        <th>Ignore</th>
        <th>Type</th>
        <th>Script</th>
      </tr>
      <tr v-for="script in scripts">
        <td><input type="checkbox" v-model="ignoreList" :value="script.uniq" @change="updateIgnore"></td>
        <td>{{ script.type }}</td>
        <td v-if="script.src">{{ script.src }}</td>
        <td v-else>{{ script.inner }}</td>
      </tr>
    </table>
  </div>

</template>

<script>
import { mapMutations } from 'vuex';
import BtnSimple from './ui/BtnSimple.vue';
import hash from "./utils/hash";

export default {
  name: 'app',
  computed: {
    scripts() {
      return this.$store.state.scripts;
    },
    ignoreList() {
      return this.$store.state.ignoreList;
    }
  },
  methods: {
    ...mapMutations([
        'setScripts',
        'setIgnoredScript',
    ]),
    newTestAction() {
      this.$store.dispatch('SET_SCRIPTS');
    },
    updateIgnore() {
      this.setIgnoredScript(this.ignoredScript);
    }
  },
  components: {
    BtnSimple: BtnSimple,
  }
}
</script>

