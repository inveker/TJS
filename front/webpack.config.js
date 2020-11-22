const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

let dist = '../app/dist';


module.exports = {
    entry : './src/main.js',
    output: {
        path: path.resolve(__dirname, dist+'/popup'),
        filename: 'bundle.js'
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
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }),
    ],
    resolve: {
        modules: ['node_modules']
    }
};