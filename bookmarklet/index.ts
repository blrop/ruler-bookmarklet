import { screenRuler } from '../src/ruler';

document.addEventListener('DOMContentLoaded', () => {
    let link = <HTMLLinkElement>document.getElementById('js-bookmarklet');
    link.href = `javascript:(${screenRuler})()`;
    console.log(`Bookmarklet code length: ${link.href.length}`);
});
