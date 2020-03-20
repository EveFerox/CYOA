// @ts-check

function CharFromID(id) {
    var char = null;
    for (var i = 0; i < Character.length; i++)
        if (Character[i].MemberNumber == id)
            char = Character[i];
    return char;
}

function CA(t) {
    var Dictionary = [];
    Dictionary.push({ Tag: "SourceCharacter removes the PrevAsset from DestinationCharacter FocusAssetGroup.", Text: t });
    ServerSend("ChatRoomChat", { Content: "ActionRemove", Type: "Action", Dictionary: Dictionary });
}

function CE(t) {
    var Dictionary = [];
    Dictionary.push({ Tag: "SourceCharacter removes the PrevAsset from DestinationCharacter FocusAssetGroup.", Text: t });
    ServerSend("ChatRoomChat", { Content: "*" + t, Type: "Emote", Dictionary: Dictionary });
}

/**Temporary quick start */
function CYOA_Start() {
    var engine = new Engine();
    let story = ElliesStory(engine);
    engine.Start(story);
}

function WindowContextRemex(tabId, func, callback) {
    var code = JSON.stringify(func.toString());
    var code = 'var script = document.createElement("script");' +
        'script.innerHTML = "(' + code.substr(1, code.length - 2) + ')();";' +
        'document.body.appendChild(script)';
    chrome.tabs.executeScript(tabId, { code: code },
        function () {
            if (callback)
                return callback.apply(this, arguments);
        });
}