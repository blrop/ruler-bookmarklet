const path = require('path');

module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
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
        path: path.resolve(__dirname, 'dist'),
    },
};
