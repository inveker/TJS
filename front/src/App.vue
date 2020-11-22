<style>
body {
  background-color: aqua;
}
div {
  color: navy;
}
</style>

<template>
  <div>
    <btn-simple>New test</btn-simple>
<!--    <table>-->
<!--      <caption>Scripts on page</caption>-->
<!--      <tr>-->
<!--        <th>Ignore</th>-->
<!--        <th>Type</th>-->
<!--        <th>Script</th>-->
<!--      </tr>-->
<!--      <tr v-for="script in scripts">-->
<!--        <td><input type="checkbox" v-model="ignoreList" :value="script.uniq" @change="updateIgnore"></td>-->
<!--        <td>{{ script.type }}</td>-->
<!--        <td v-if="script.src">{{ script.src }}</td>-->
<!--        <td v-else>{{ script.inner }}</td>-->
<!--      </tr>-->
<!--    </table>-->
  </div>

</template>

<script>
import BtnSimple from './ui/BtnSimple.vue';

export default {
  name: 'app',
  data () {
    return {
      a: 111,
      scripts: [],
      ignoreList: [],
    }
  },
  components: {
    BtnSimple: BtnSimple,
  },
  // created: async function() {
  //   if(url.match(/^http/)) {
  //     if (store.scripts == undefined) {
  //       let page = await fetch(url).then(response => response.text())
  //       let parser = new DOMParser();
  //       let doc = parser.parseFromString(page, "text/html");
  //       let scripts = [];
  //       for (let i = 0; i < doc.scripts.length; i++) {
  //         let s = doc.scripts[i];
  //         if (s.src)
  //           scripts.push({
  //             type: 'file',
  //             src: s.src,
  //             uniq: s.src
  //           });
  //         else {
  //           let code = s.innerHTML
  //           let beginScript = code.slice(0, 20);
  //           scripts.push({
  //             type: 'inline',
  //             inner: beginScript,
  //             uniq: beginScript + '_' + code.length + '_' + hash(code)
  //           });
  //         }
  //       }
  //       store.scripts = scripts;
  //     }
  //
  //     this.scripts = store.scripts;
  //
  //     if (store.ignored != undefined)
  //       this.ignoreList = store.ignored;
  //   }
  // },
  // methods: {
  //   updateIgnore() {
  //     store.ignored = this.ignoreList;
  //   }
  // }
}
</script>

