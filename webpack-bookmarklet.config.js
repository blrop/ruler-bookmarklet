const path = require('path');

const DIR = 'bookmarklet';

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
        filename: 'bookmarklet.js',
        path: path.resolve(__dirname, `${DIR}/dist`),
    },
};
