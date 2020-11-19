const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry : './popup_/main.js',
    output: {
        path: path.resolve(__dirname, './ext'),
        filename: 'popup_/script.js'
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        // убедитесь что подключили плагин!
        new VueLoaderPlugin()
    ],
    resolve: {
        extensions: ['.js', '.vue'],
    },
};