document.getElementById("btnStart").addEventListener("click", e => {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        WindowContextRemex(tabs[0].id, CYOA_Start);
    });
});