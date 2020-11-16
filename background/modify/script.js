import * as acorn from "acorn";

export default function(string) {
    let str_arr = string.split('');
    let ast = acorn.parse(string, {ecmaVersion: 2020})

    findFunction(ast);

    function findFunction(obj, isFunction = false) {
        if(obj.type == 'ReturnStatement') {
            let val = str_arr.slice(obj.start+6, obj.end).join('').trim();

            if(val != '' && val != ';') {
                let returnStart = obj.start + 6;
                let returnEnd = obj.end - 1;

                str_arr[returnStart] = ' (__tmp = ('+str_arr[returnStart];
                if(str_arr[returnEnd] == ';') {
                    returnEnd = obj.end - 2;
                    str_arr[returnEnd] += '), __logRes(__tmp), __tmp)';
                } else
                    str_arr[returnEnd] += '), __logRes(__tmp), __tmp);';
            }
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
        for(let key in obj)
            if(key != 'params' && obj.hasOwnProperty(key) && typeof obj[key] === "object" && obj[key] !== null)
                findFunction(obj[key], isFunction)
    }

    return str_arr.join('');
}
