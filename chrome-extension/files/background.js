chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId : tab.id },
        func: () => {
            document.body.style.backgroundColor = 'tomato';
            console.log('???');
        },
    });
});
