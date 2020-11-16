// browser.storage.local.clear();
function createStore(host) {
    return {
        host: host,
        async set(key, value) {
            let host = this.host;
            let siteStore = await this.getHostStore();
            siteStore[key] = value
            browser.storage.local.set({[host]: JSON.stringify(siteStore)});
        },
        async get(key) {
            let siteStore = await this.getHostStore();
            return siteStore[key]
        },
        async delete(key) {
            let host = this.host;
            let siteStore = await this.getHostStore();
            delete siteStore[key];
            browser.storage.local.set({[host]:  JSON.stringify(siteStore)});
        },
        async clear() {
            await browser.storage.local.remove(this.host).then();
        },
        async getHostStore() {
            let host = this.host;
            let siteStore = {};
            let p = browser.storage.local.get(host)
            await p.then(item => {
                if (item[host]) {
                    siteStore = JSON.parse(item[host]);
                }
            })
            return siteStore;
        }
    }
}
export default createStore;