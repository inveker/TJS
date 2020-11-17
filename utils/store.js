let repositories = {};

export function activateStore() {
    browser.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        if(req.api == 'store')
            if(req.action == 'get') {
                if(!repositories[req.repository])
                    repositories[req.repository] = {};
                sendResponse(repositories[req.repository]);
            }
    });
}


export function getStore(name) {
    if(!repositories[name])
        repositories[name] =
            (new Error).fileName.indexOf('/background.js') > -1
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