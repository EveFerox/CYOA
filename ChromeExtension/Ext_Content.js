
// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.from !== 'popup') return;
    

});

chrome.runtime.sendMessage({
    from: 'content',
    subject: 'init',
});

window.addEventListener("load", e => {

    function AddScript(scriptFileName) {
        var script = document.createElement('script');
        script.src = chrome.runtime.getURL(scriptFileName);
        return document.head.appendChild(script);
    }

    let EngineFolder = "/Engine/";

    AddScript("Utils.js");
    AddScript(EngineFolder + "Trigger.js");
    AddScript(EngineFolder + "Level.js");
    AddScript(EngineFolder + "Story.js");
    AddScript(EngineFolder + "Engine.js");
    AddScript("CYOA.js");
});