export default function(details, callback) {
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