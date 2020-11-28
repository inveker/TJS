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

let isBackground = (new Error).fileName.indexOf('/background.js') > -1;



let repositories = {
    tabs: [],
    browser: {},
    storage: {}
};


if(isBackground)
    browser.storage.local.get('storage').then(data => {
        repositories.storage = data.storage
    });

export function activateAsyncStore() {
    browser.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        if(req.api == 'store')
            if(req.action == 'get')
                sendResponse(getStore(req.name, req.tab));
            else if(req.action == 'update')
                if(req.name == 'tabs' && Number.isInteger(req.tab))
                    repositories[req.name][req.tab] = req.data;
                else
                    repositories[req.name] = req.data;
    });
}

export function getStore(name, tab = undefined) {
    if(isBackground) {
        if(name == 'tabs' && Number.isInteger(tab)) {
            if(!repositories['tabs'][tab])
                repositories['tabs'][tab] = {}
            return repositories['tabs'][tab];
        } else if(repositories[name])
            return repositories[name];
    } else
        return new Promise(function(resolve, reject) {
            browser.runtime.sendMessage({
                api: 'store',
                action: 'get',
                name: name,
                tab: tab
            }).then(function (res) {
                resolve(res);
            });
        });
}

export function updateStore(data, name, tab = undefined) {
    browser.runtime.sendMessage({
        api: 'store',
        action: 'update',
        name: name,
        tab: tab,
        data: data
    });
}