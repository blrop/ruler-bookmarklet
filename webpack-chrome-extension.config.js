const path = require('path');

const DIR = 'chrome-extension';

module.exports = {
    entry: `./${DIR}/index.ts`,
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, `${DIR}/files/dist`),
    },
};