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