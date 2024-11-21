import { bookmarklet } from './ruler';

document.addEventListener('DOMContentLoaded', () => {
    let link = <HTMLLinkElement>document.getElementById('js-bookmarklet');
    link.href = `javascript:(${bookmarklet})()`;
    console.log(`Bookmarklet code length: ${link.href.length}`);
});
