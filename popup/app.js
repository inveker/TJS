import {getAsyncStore} from '../utils/store.js'

//Get store
var store = getAsyncStore();

async function init() {
    let tab, tabProm = browser.tabs.query({active: true, lastFocusedWindow: true});
    await tabProm.then(tabs => {
        tab = tabs[0];
    });
    let url = tab.url;
    let host = new URL(url).hostname;


    new Vue({
        el: '#app',
        data: {
            a: 111,
            scripts: [],
            ignoreList: [],
        },
        created: function() {
            let $this = this;
            store.get(host+'scripts').then(item => {
                if(item == undefined) {
                    fetch(url)
                        .then(response => response.text())
                        .then(page => {
                            let parser = new DOMParser();
                            let doc = parser.parseFromString(page, "text/html");
                            let scripts = [];
                            for(let i = 0; i < doc.scripts.length; i++) {
                                let s = doc.scripts[i];
                                if(s.src)
                                    scripts.push({
                                        type: 'file',
                                        src: s.src,
                                        uniq: s.src
                                    })
                                else {
                                    let code = s.innerHTML
                                    let beginScript = code.slice(0, 20);
                                    scripts.push({
                                        type: 'inline',
                                        inner: beginScript,
                                        uniq: beginScript + '_' + code.length + '_' + hash(code)
                                    })
                                }

                            }
                            store.set(host+'scripts', scripts)
                            $this.scripts = scripts;
                        });
                } else {
                    $this.scripts = item;
                }
            });
            store.get(host+'ignored').then(item => {
                if(item != undefined)
                    $this.ignoreList = item;
            });
        },
        methods: {
            updateIgnore() {
                store.set(host+'ignored', this.ignoreList);
            }
        }
    })


}
init();


function hash(str) {
    var hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


