import { bookmarklet } from './src/ruler.js';

document.addEventListener('DOMContentLoaded', () => {
    let link = document.getElementById('js-bookmarklet');
    link.href = `javascript:(${bookmarklet})()`;
    console.log(`Bookmarklet code length: ${link.href.length}`);
});
