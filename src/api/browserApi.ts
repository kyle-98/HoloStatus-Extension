/// <reference types="chrome" />
/// <reference types="firefox-webext-browser" />

// This makes the extension both chrome and firefox compatible
let storageApi: typeof chrome.storage.sync | typeof browser.storage.sync;

if (typeof chrome !== undefined && chrome.storage){
    storageApi = chrome.storage.sync;
}
else if (typeof browser !== undefined && browser.storage) {
    storageApi = browser.storage.sync;
}
else {
    console.error('Failed to set storage api of current browser');
}

export { storageApi };