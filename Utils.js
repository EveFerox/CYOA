// @ts-check

/**Returns character based on member number
 * @param {number} MemberNumber 
 */
function CharFromID(MemberNumber) {
    for (var i = 0; i < ChatRoomCharacter.length; i++)
        if (ChatRoomCharacter[i].MemberNumber == MemberNumber)
            return ChatRoomCharacter[i];
}

/**Chat Action
 * @param {string} text
 * @param {number} target
 * @param {boolean} isLogToConsole
 */
function CA(text, target = undefined, isLogToConsole = false) {
    ServerSend("ChatRoomChat", {
        Content: "ActionRemove",
        Type: "Action",
        Dictionary: [{ Tag: "SourceCharacter removes the PrevAsset from DestinationCharacter FocusAssetGroup.", Text: text }],
        Target: target
    });
    if (isLogToConsole) console.log(text);
}

/**Chat Emote
 * @param {string} text
 * @param {number} target
 * @param {boolean} isLogToConsole
 */
function CE(text, target = undefined, isLogToConsole = false) {
    ServerSend("ChatRoomChat", { Content: "*" + text, Type: "Emote", Target: target });
    if (isLogToConsole) console.log(text);
}

/**Returns true if ServerSocket exists */
function IsSocketReady() {
    return typeof ServerSocket !== 'undefined' && ServerSocket != null;
}

/**Temporary quick start */
function CYOA_Start() {
    Engine.Instance.Start(ElliesStory());
}