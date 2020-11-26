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
        'setIgnoreList',
    ]),
    async newTestAction() {
      let url = $staticStore.url;
      if(url.match(/^http/)) {
        let page = await fetch(url).then(response => response.text());
        let parser = new DOMParser();
        let doc = parser.parseFromString(page, "text/html");
        let scripts = [];
        for (let i = 0; i < doc.scripts.length; i++) {
          let s = doc.scripts[i];
          if (s.src)
            scripts.push({
              type: 'file',
              src: s.src,
              uniq: s.src
            });
          else {
            let code = s.innerHTML
            let beginScript = code.slice(0, 20);
            scripts.push({
              type: 'inline',
              inner: beginScript,
              uniq: beginScript + '_' + code.length + '_' + hash(code)
            });
          }
        }

        this.setScripts({scripts: scripts})
      }
    },
    updateIgnore() {
      this.setIgnoreList(this.ignoreList);
    }
  },
  components: {
    BtnSimple: BtnSimple,
  }
}
</script>

