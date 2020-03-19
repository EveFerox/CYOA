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