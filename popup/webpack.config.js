const path = require('path');

module.exports = {
    entry: './app.js',
    output: {
        path: path.resolve(__dirname, '../ext/popup'),
        filename: 'script.js'
    }
};