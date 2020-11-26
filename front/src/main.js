import Vue from 'vue'
import Vuex from 'vuex';
import App from './App.vue';
import {getStore} from "../../lib/store";



async function init() {
    let tab = (await browser.tabs.query({active: true, lastFocusedWindow: true}))[0];
    let url = tab.url;
    let host = new URL(url).hostname;

    let storeBack = await getStore(host);
    console.log(storeBack);

    window.$staticStore = {
        tab: tab,
        url: url,
        host: host,
    }


    Vue.use(Vuex)

    const store = new Vuex.Store({
        state: {
            scripts: storeBack.scripts || [],
            ignoredScript: storeBack.ignoredScript || [],
        },
        mutations: {
            setScripts(state, params) {
                state.scripts = params.scripts
            },
            setIgnoreList(state, params) {
                state.scripts = params.scripts
            }
        }
    });

    window.onunload = function (e) {
        browser.runtime.sendMessage({
            api: 'store',
            action: 'update',
            repository: host,
            data: {...store.state}
        });
    }

    new Vue({
        el: '#app',
        render: h => h(App),
        store: store,
    });
}
init();

