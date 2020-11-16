const path = require('path');

module.exports = {
    entry : {
        background: './background/app.js',
        'popup/script':  './popup/app.js'
    },
    output: {
        path: path.resolve(__dirname, './ext'),
        filename: '[name].js'
    },
    optimization: {
        minimize: false
    }
};