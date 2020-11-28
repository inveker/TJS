import {getStore, activateAsyncStore} from '../lib/store.js';
import requestHandler from './modify/request.js';


//Background window obj
const b_window = browser.extension.getBackgroundPage();
const console = b_window.console;

//New store
activateAsyncStore();
let store = getStore('browser');
store.urls = ['aaa'];


//Processing HTTP requests and modifying HTTP responses
browser.webRequest.onBeforeRequest.addListener(
    requestHandler,
    {urls: ["<all_urls>"]},
    ["blocking"]
);



browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    if(changeInfo.url != undefined)
        clearTabStore(tabId)
});
browser.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    clearTabStore(tabId);
});

function clearTabStore(tabId) {
    console.log('clear')
    let tabsStore = getStore('tabs');
    delete tabsStore[tabId];
}


browser.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    browser.tabs.query({}).then(tabs => {
        if(tabs.length == 1) {
            let storage = getStore('storage');
            browser.storage.local.set({storage: storage});
        }
    });
});

//
// function toggleIcon(url) {
//     let host = new URL(url).hostname;
//     let a = store.get('urls').indexOf(host) > -1 ? 'on' : 'off';
//     browser.browserAction.setIcon({
//         path: {
//             16: "icon_"+a+".svg",
//             32: "icon_"+a+".svg"
//         }
//     });
// }
//

// browser.tabs.onActivated.addListener(function(activeInfo) {
//     browser.tabs.query({currentWindow: true, active: true}).then(function (tabs) {
//         toggleIcon(tabs[0].url);
//     }, console.error);
// });
//
// browser.browserAction.onClicked.addListener(function (tab) {
//     let host = new URL(tab.url).hostname
//     if(host) {
//         browser.browsingData.removeCache({})
//         var index = store.get('urls').indexOf(host);
//         if (index > -1) {
//             browser.browserAction.setIcon({
//                 path: {
//                     16: "icon_off.svg",
//                     32: "icon_off.svg"
//                 }
//             });
//             store.get('urls').splice(index, 1);
//         } else {
//             browser.browserAction.setIcon({
//                 path: {
//                     16: "icon_on.svg",
//                     32: "icon_on.svg"
//                 }
//             });
//             store.get('urls').push(host);
//         }
//     }
// });
//

