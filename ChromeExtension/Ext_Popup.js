
// Listen for messages from the content.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.from !== 'content') return;

    if (msg.subject === 'init') {
        console.log("content script was init!");
    }
});

document.getElementById("headerVersion").innerText = `CYOA Engine v${Engine.Version}`;

function SetIsInCorrectTab(isInCorrectTab) {
    document.getElementById("divActive").hidden = isInCorrectTab === false;
    document.getElementById("divNotActive").hidden = isInCorrectTab === true;
}

SetIsInCorrectTab(null);

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    
    let isInCorrectTab = String(tabs[0].url).indexOf("bondageprojects") > 0;
    SetIsInCorrectTab(isInCorrectTab);
});

/**Injects a function as plain code */
function InjectCode(tabId, func, callback) {
    var code = JSON.stringify(func.toString());
    code = code.slice(code.indexOf('{') + 1, code.length - 2);
    var code = 'var script = document.createElement("script");' +
        'script.innerHTML = "' + code + '";' +
        'document.body.appendChild(script)';
    chrome.tabs.executeScript(tabId, { code: code },
        function () {
            if (callback)
                return callback.apply(this, arguments);
        });
}

//Start
document.getElementById("btnStart").addEventListener("click", e => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        InjectCode(tabs[0].id, CYOA_Start);
    });
});

//Stop
document.getElementById("btnStop").addEventListener("click", e => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        InjectCode(tabs[0].id, () => { Engine.Instance.Stop();});
    });
});