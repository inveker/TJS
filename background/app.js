import * as acorn from 'acorn';
import createStore from '../utils/stor.js';

var stor = createStore()

const page = browser.extension.getBackgroundPage();
const console = page.console;
console.log('something')

var urls = [];

function toggleIcon(url) {
    let host = new URL(url).hostname;
    let a = urls.indexOf(host) > -1 ? 'on' : 'off';
    browser.browserAction.setIcon({
        path: {
            16: "icon_"+a+".svg",
            32: "icon_"+a+".svg"
        }
    });
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    if(changeInfo.url != undefined) {
        toggleIcon(changeInfo.url)
        stor.host = new URL(changeInfo.url).hostname
        stor.delete('scripts');
    }
});

browser.tabs.onActivated.addListener(function(activeInfo) {
    browser.tabs.query({currentWindow: true, active: true}).then(function (tabs) {
        toggleIcon(tabs[0].url);
    }, console.error);
});

browser.browserAction.onClicked.addListener(function (tab) {
    let host = new URL(tab.url).hostname
    if(host) {
        browser.browsingData.removeCache({})
        var index = urls.indexOf(host);
        if (index > -1) {
            browser.browserAction.setIcon({
                path: {
                    16: "icon_off.svg",
                    32: "icon_off.svg"
                }
            });
            urls.splice(index, 1);
        } else {
            browser.browserAction.setIcon({
                path: {
                    16: "icon_on.svg",
                    32: "icon_on.svg"
                }
            });
            urls.push(host)
        }
    }
});



function replaceContent(details, callback) {
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    let data = [];
    filter.ondata = event => {
        data.push(event.data);
    };

    filter.onstop = function(event) {
        let str = "";
        if (data.length == 1) {
            str = decoder.decode(data[0]);
        }
        else {
            for (let i = 0; i < data.length; i++) {
                let stream = (i == data.length - 1) ? false : true;
                str += decoder.decode(data[i], {stream});
            }
        }
        str = callback(str);

        filter.write(encoder.encode(str));
        filter.close();
    };
}

browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        if(details.documentUrl != undefined) {
            let host = new URL(details.documentUrl).hostname;
            if(host) {
                if(urls.indexOf(host) != -1) {
                    if(details.url.match(/jquery/)) {
                        replaceContent(details, function (str) {
                            // console.log(details.url)
                            let js = prepare(str)
                            console.log(js)
                            return js;
                        })
                    }
                }
            }
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    function(details) {
        let host = new URL(details.url).hostname;
        if(host) {
            if (urls.indexOf(host) != -1) {
                replaceContent(details, function (str) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(str, "text/html");

                    for(let i = 0; i < doc.scripts.length; i++) {
                        if(doc.scripts[i].src === '') {
                            doc.scripts[i].innerHTML = prepare(doc.scripts[i].innerHTML);
                        }
                    }
                    doc.head.insertAdjacentHTML('afterbegin', '<script>function __logRes(res){console.log(res);return res;}</script>')
                    return doc.documentElement.outerHTML;
                });
            }
        }
    },
    {urls: ["<all_urls>"], types: ["main_frame"]},
    ["blocking"]
);

function parseJS(script) {
    let tmp = '';
    let fn_name = '';
    let fn_args = '';
    let args = [];
    let openPos = 0;
    let othersBrace = 0;
    let othersRoundBrace = 0;

    let isString = false;
    let isEscape = false;
    let isFunction = false;
    let isArgs = false;
    let isSearchBrace = false;

    let isReg = false;
    let isInlineComment = false;
    let isMultiComment = 0;

    let str_arr = script.split('');


    for(let pos = 0; pos < str_arr.length; pos++) {
        let char = str_arr[pos];

        //строчный комментарий
        if(isInlineComment) {
            //комментарий закрыт
            if(char == "\n") {
                isInlineComment = false;
            }
        }
        //многострочный комментарий
        else if(isMultiComment) {
            //комментарий закрыт
            if(isMultiComment == 2 && char == '/') {
                isMultiComment = 0;
            }
            //Возможно закроется комментарий
            else if(char == '*') {
                isMultiComment = 2;
            } else {
                isMultiComment = 1;
            }
        }
        //Текст вне комментариев
        else {
            //Игнорируем экранированные символы
            if(!isEscape) {
                if(!isReg) {
                    //Проверка на строки
                    if(char === isString) {
                        isString = false;
                    } else if(!isString && (char == "'" || char == '"')) {
                        isString = char;
                    }
                }
                //Конец регулярного выражения
                if(isReg && char == '/') {
                    isReg = false;
                    isEscape = false;
                    continue;
                }
            }

            //Проверка на экранирование (должна идти после тех  мест, где используется $isEscape)
            if(isEscape) {
                isEscape = false;
            } else if(char == '\\') {
                isEscape = true;
            }

            //Текст вне строк
            if(!isString) {
                if(char == '/') {
                    let next_char = str_arr[pos+1];
                    if(next_char == '/') {
                        isInlineComment = true;
                    } else if(next_char == '*') {
                        isMultiComment = 1;
                    } else {
                        //Regex
                        for(let i = pos-1; i >= 0; i--) {
                            let c = str_arr[i];
                            if(!c.match(/\s/)) {
                                if(c.match(/[:;=,\(\[\?]/)) {
                                    isReg = true;
                                }
                                break;
                            }
                        }
                    }
                }
            }

            //Найдена функция
            if(isFunction) {
                if(openPos) {
                    if(!isString) {
                        //Открыта скобка внутри функции
                        if(char == '{') {
                            othersBrace++;
                        } else if(char == '}') {
                            if(!othersBrace) {
                                let closePos = pos;
                                //Добавляем сбор статистики
                                let s = `let res = __tmp.call(this `+(args.length ? ', '+args.join(',') : '')+`);
                                let trace = Error().stack.replace(/\ {4}/g, '').split("\\n").slice(3);
                                let _a = {
                                    name: "`+fn_name+`",
                                    args: `+(args.length ? '{'+args.join(',')+'}' : 'empty')+`,
                                    res: res,
                                    trace: trace,
                                    code: __tmp.toString().replace("__tmp","`+fn_name+`")
                            };
                                console.log(_a);
                                return res;
                                function __tmp (`+fn_args+`) {`;

                                str_arr[openPos] += s.replace(/\n/g, ' ');
                                str_arr[closePos] += '}';

                                //Обнуляем
                                isFunction = false;
                                isSearchBrace = false;
                                fn_name = '';
                                fn_args = '';
                                args = [];
                                openPos = 0;
                            } else {
                                othersBrace--;
                            }
                        }
                    }
                } else {
                    //Поиск открывающей фигурной скобки
                    if(isSearchBrace) {
                        if(char == '{')
                            openPos = pos;
                    } else {
                        //Собираем аргументы
                        if(isArgs) {
                            if(char == '(') {
                                othersRoundBrace++
                            } else if(char == ')') {
                                if(othersRoundBrace > 0) {
                                    othersRoundBrace--;
                                } else {
                                    let e = fn_args.split('=');
                                    args = e[0].split(',');
                                    for(let i = 1; i < e.length; i++)
                                        args.push(e[i].split(',')[1]);

                                    isArgs = false;
                                    isSearchBrace = true;
                                }
                            } else
                                fn_args += '' + char;
                            //Ищем начало аргументов
                        } else {
                            if(char == '(') {
                                fn_name = fn_name.trim();
                                isArgs = true;
                                //Собираем имя функции
                            } else
                                fn_name += '' + char;
                        }
                    }
                }
            } else {
                //Поиск функции
                if(!isString) {
                    if(tmp == '' && char == 'f')
                        tmp = char;
                    else {
                        tmp += '' + char;
                        if(tmp == 'function ') {
                            isFunction = true;
                            tmp = '';
                        } else if(tmp == 'function(') {
                            isFunction = true;
                            tmp = '';
                            fn_name = 'nnn';
                            isArgs = true;
                        } else if('function'.indexOf(tmp) == -1)
                            tmp = '';
                    }
                }
            }
        }
    }
    return str_arr.join('');
}

let s = `function s() {
    return
    if(true) {
        return;
    } else if(7+7)
        return true ? 5+5 : 3
        else
    return s();
}`

// prepare(s);

function prepare(string) {
    let str_arr = string.split('');
    let ast = acorn.parse(string, {ecmaVersion: 2020})
    // console.log(ast)

    findFunction(ast);

    function findFunction(obj, isFunction = false) {
        if(obj.type == 'ReturnStatement') {
            let val = str_arr.slice(obj.start+6, obj.end).join('').trim();
            // console.log(str_arr.slice(obj.start-20, obj.end).join('').trim())
            // console.log(val);
            if(val != '' && val != ';') {
                let returnStart = obj.start + 6;
                let returnEnd = obj.end - 1;

                str_arr[returnStart] = ' (__tmp = ('+str_arr[returnStart];
                if(str_arr[returnEnd] == ';') {
                    returnEnd = obj.end - 2;
                    str_arr[returnEnd] += '), __logRes(__tmp), __tmp)';
                } else {
                    str_arr[returnEnd] += '), __logRes(__tmp), __tmp);';
                }
                // console.log('res: '+str_arr.slice(returnStart, returnEnd+1).join('').trim())
            }
            // console.log(str_arr.slice(returnStart, returnEnd+1).join('').trim())
        }
        if(obj.type == 'FunctionDeclaration' || obj.type == 'FunctionExpression') {
            isFunction = true;

            let fn_name = obj.id != undefined ? obj.id.name : '__anon';

            let openPos = obj.body.start;

            let args = [];
            if(obj.params) {
                for(let i = 0; i < obj.params.length; i++) {
                    let p = obj.params[i];
                    args.push(p.type == 'Identifier' ? p.name : p.left.name)
                }
            }

            // let s = `let res = __tmp.call(this `+(args.length ? ', '+args.join(',') : '')+`);
            //     let trace = Error().stack.replace(/ {4}/g, '').split("\\n").slice(3);
            //     let _a = {
            //         name: "`+fn_name+`",
            //         args: `+(args.length ? '{'+args.join(',')+'}' : '"empty"')+`,
            //         res: res,
            //         trace: trace,
            //         code: __tmp.toString().replace("__tmp","`+fn_name+`")
            //     };
            //     console.log(_a);
            //     return res;
            //     function __tmp (`+args.join(',')+`) {`;
            // str_arr[openPos] += s.replace(/\n/g, ' ');

            // str_arr[openPos] += 'console.log(Error().stack.replace(/ {4}/g, ""));';
            let closePos = obj.body.end - 1;
            // str_arr[closePos] += '}';
        }
        for(let key in obj) {
            if(key != 'params') {
                if(obj.hasOwnProperty(key)) {
                    if(typeof obj[key] === "object" && obj[key] !== null) {
                        findFunction(obj[key], isFunction)
                    }
                }
            }
        }
    }

    return str_arr.join('');
}
