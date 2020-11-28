import Vue from 'vue'
import App from './App.vue';
import {getStore, updateStore} from "../../lib/store";
import store from './store';


async function init() {


    // let storeBack = await getStore(host);
    //
    // window.$staticStore = {
    //     tab: tab,
    //     url: url,
    //     host: host,
    // }




    new Vue({
        el: '#app',
        render: h => h(App),
        store: store,
    });
}
init();

