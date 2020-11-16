let data = {};

let store = {
    set(name, value) {
        data[name] = value;
        return true;
    },
    get(name) {
        return data[name];
    },
    del(name) {
        delete data[name];
        return true;
    }
}

export function createStore() {
    browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.api == 'store')
            sendResponse({msg: store[request.action](...request.args)});
    });
    return store;
}

export function getAsyncStore() {
    return {
        async set(name, value) {
            return (await browser.runtime.sendMessage({
                api: 'store',
                action: 'set',
                args: Object.values(arguments)
            })).msg;
        },
        async get(name) {
            return (await browser.runtime.sendMessage({
                api: 'store',
                action: 'get',
                args: Object.values(arguments)
            })).msg;
        },
        async del(name) {
            return (await browser.runtime.sendMessage({
                api: 'store',
                action: 'del',
                args: Object.values(arguments)
            })).msg;
        }
    };
}

export function getGlobalStore() {
    return store;
}