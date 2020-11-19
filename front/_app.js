import {getStore} from '../lib/store.js';

async function init() {
    let tab = (await browser.tabs.query({active: true, lastFocusedWindow: true}))[0];
    let url = tab.url;
    let host = new URL(url).hostname;

    let store = await getStore(host);


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


