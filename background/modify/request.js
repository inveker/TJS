import modifyBody from "./body";
import modifyScript from "./script";
import {getGlobalStore} from '../../utils/store.js';

var store = getGlobalStore();

export default function(details) {
    let url, mod_fn;
    //Inline scripts
    if(details.type == 'main_frame') {
        url = details.url;
        mod_fn = function (str) {
            let doc = (new DOMParser()).parseFromString(str, "text/html");
            for (let i = 0; i < doc.scripts.length; i++)
                if (doc.scripts[i].src === '')
                    doc.scripts[i].innerHTML = script(doc.scripts[i].innerHTML);
            return doc.documentElement.outerHTML;
        };
    //Src scripts
    } else if(details.url.match(/\.js$/)) {
        url = details.documentUrl;
        mod_fn = function (str) {
            return modifyScript(str);
        };
    }
    //Inject
    if(url) {
        let host = new URL(url).hostname;
        if (store.get('urls').indexOf(host) != -1)
            modifyBody(details, mod_fn);
    }
}

