const path = require('path');

module.exports = {
    entry : './index.js',
    output: {
        path: path.resolve(__dirname, '../app/dist'),
        filename: 'background.js'
    },
    optimization: {
        minimize: false
    }
};