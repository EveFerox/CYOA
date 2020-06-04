// @ts-check

/**Returns character based on member number
 * @param {number} MemberNumber 
 * @returns {object}
 */
function CharFromID(MemberNumber) {
    for (var i = 0; i < ChatRoomCharacter.length; i++)
        if (ChatRoomCharacter[i].MemberNumber == MemberNumber)
            return ChatRoomCharacter[i];
}

/**Removes an item from given array by value
 * @param {any[]} arr
 * @param {any} value
 */
function ArrayRemove(arr, value) {
    let i = arr.indexOf(value);

    if (i < 0) {
        return false;
    }

    arr.splice(i, 1);
    return true;
}

/**Returns true if ServerSocket exists */
function IsSocketReady() {
    return typeof ServerSocket !== 'undefined' && ServerSocket != null;
}

/**Temporary quick start */
function CYOA_Start() {
    Engine.Instance.Start(ElliesStory());
}