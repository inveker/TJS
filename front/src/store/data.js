import {getStore, updateStore} from "../../../lib/store";


/*
In a DATA object
arrays are stored,
specifying which variables from the background storage to get and save.
DATA keys indicate which store the data belongs to.
*/
const DATA = {
    tabs: [
        'scripts'
    ],
    browser: [

    ],
    storage: [
        'ignoredScripts'
    ]
};

/*
Function getData
Retrieves all the specified data from the store
*/
export async function getData(tabId = undefined) {
    let res = {};
    for(let store in DATA)
        if(DATA[store].length) {
            let all = await getStore(store, tabId != undefined ? tabId : undefined);
            if(all) {
                console.log(all)
                for(let name of DATA[store])
                    if(all[name] != undefined)
                        res[name] = all[name]
            }
        }
    return res;
}

/*
Function saveData
Sends requests to save data to the background page
*/
export function saveData(storeState, tabId) {
    let state = JSON.parse(JSON.stringify(storeState))
    for(let store in DATA)
        if(DATA[store].length) {
            let data = {};
            for(let name of DATA[store])
                data[name] = state[name];
            updateStore(data, store, tabId);
        }
}