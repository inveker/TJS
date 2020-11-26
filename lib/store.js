/*
Store

Install:
1.(required) Import on background script
2.(optional) Run activateAsyncStore(), to enable api for content scripts

Use
call getStore('store_name')
return (
    on background script: store object,
    on content scripts: promise resolved store object
)

Explanations
@var repositories
Each process has its own @var
In background script use @var as the main global repository
Other scripts save into @var local copies obtained from background scripts
*/


let repositories = {};

let isBackground = (new Error).fileName.indexOf('/background.js') > -1;

export function activateAsyncStore() {
    browser.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        if(req.api == 'store')
            if(req.action == 'get') {
                if(!repositories[req.repository])
                    repositories[req.repository] = {};
                sendResponse(repositories[req.repository]);
            } else if(req.action == 'update') {
                repositories[req.repository] = req.data;
            }
    });
}

export function getStore(name) {
    if(!repositories[name])
        repositories[name] = isBackground
            ? {}
            : new Promise(function(resolve, reject) {
                    browser.runtime.sendMessage({
                        api: 'store',
                        action: 'get',
                        repository: name
                    }).then(function (res) {
                        resolve(res);
                    });
                });
    return repositories[name];
}