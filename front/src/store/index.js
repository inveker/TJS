import hash from "../utils/hash";
import Vue from 'vue';
import Vuex from 'vuex';
import {getStore, updateStore} from "../../../lib/store";


Vue.use(Vuex);


let store = new Vuex.Store({
    state: {
        parseUrl: {},
        tab: {},
        scripts: [],
        ignoredScript: [],
    },
    mutations: {
        SET_PARSE_URL(state, parseUrl) {
            state.parseUrl = parseUrl;
        },
        SET_SCRIPTS(state, scripts) {
            state.scripts = scripts;
        },
        setIgnoredScript(state, payload) {
            state.ignoredScript = payload.ignoredScript
        }
    },
    actions: {
        async INIT_STORE(context) {
            let state = context.state;
            if(!Object.keys(state.parseUrl).length)
                await context.dispatch('SET_PARSE_URL');
            let tabStore = await getStore('tabs', state.tab.id);
            for(let key in tabStore)
                if(tabStore.hasOwnProperty(key))
                    state[key] = tabStore[key];
        },
        async SET_PARSE_URL(context) {
            let tab = (await browser.tabs.query({active: true, lastFocusedWindow: true}))[0];
            context.state.tab = tab;
            context.commit('SET_PARSE_URL', new URL(tab.url));
        },
        async SET_SCRIPTS(context) {
            let url = context.state.parseUrl.origin;

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

let savedData = [
    'scripts',
    'ignoredScript',
];

store.dispatch('INIT_STORE').then(function() {
    window.onunload = function() {
        if(Number.isInteger(store.state.tab.id)) {
            let save = {};
            for(let name of savedData)
                save[name] = store.state[name]
            updateStore(save, 'tabs', store.state.tab.id);
        }
    };
});


export default store;

