// bridge.js - Content script to bridge Web App and Extension
console.log("%c[GED-Ext] Bridge Script Loaded!", "color: green; font-weight: bold; font-size: 14px;");

// Listen for messages from the web app
window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type && (event.data.source === "ged-web")) {
        console.log("[GED-Ext] Received message from web:", event.data);

        // Relay to background script
        chrome.runtime.sendMessage(event.data);
    }
});

// Listen for messages from background script and relay to web app
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[GED-Ext] Received message from background:", message);
    window.postMessage({
        source: 'ged-ext',
        ...message
    }, '*');
});

// Inject a marker so web app knows extension is present
const injectMarker = () => {
    if (document.getElementById('ged-extension-installed')) return;
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('id', 'ged-extension-installed');
    document.body.appendChild(input);
    console.log("[GED-Ext] Marker injected.");
};

if (document.body) {
    injectMarker();
} else {
    document.addEventListener('DOMContentLoaded', injectMarker);
}

console.log("[GED-Ext] Bridge loaded.");
