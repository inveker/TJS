import hash from "../utils/hash";
import Vue from 'vue';
import Vuex from 'vuex';
import {getData, saveData} from "./data.js";


Vue.use(Vuex);


let store = new Vuex.Store({
    state: {
        parseUrl: {},
        tab: {},
        scripts: [],
        ignoredScript: []
    },
    mutations: {
        SET_SCRIPTS(state, scripts) {
            state.scripts = scripts;
        },
        setIgnoredScript(state, payload) {
            state.ignoredScript = payload.ignoredScript
        }
    },
    actions: {
        async SET_SCRIPTS(context) {
            let url = store.static.url.origin;

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
                context.commit('SET_SCRIPTS', scripts);
            }
        }
    }
});


async function initStore(store) {
    let tab = (await browser.tabs.query({active: true, lastFocusedWindow: true}))[0];
    let url =  new URL(tab.url);

    store.static = {
        tab: tab,
        url: url
    }

    let data = await getData(tab.id)

    for(let key in data)
        if(data.hasOwnProperty(key))
            store.state[key] = data[key];

    window.onunload = function() {
        if(Number.isInteger(tab.id))
            saveData(store.state, tab.id)
    };
}

initStore(store);



export default store;

