const path = require('path');

module.exports = {
    entry: './index.js',
    mode: 'production',
    output: {
        filename: 'bookmarklet.js',
        path: path.resolve(__dirname, 'dist'),
    },
    watch: true,
};
