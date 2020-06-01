// @ts-check

/**Loading manually all the scripts */
{
    let Folder = "Scripts/CYOA/";
    let EngineFolder = Folder + "Engine/";

    /**@param {string} scriptFileName */
    function AddScript(scriptFileName) {
        var script = document.createElement('script');
        script.src = scriptFileName;
        return document.head.appendChild(script);
    }

    AddScript(Folder + "Utils.js");
    AddScript(EngineFolder + "Trigger.js");
    AddScript(EngineFolder + "Level.js");
    AddScript(EngineFolder + "Story.js");
    AddScript(EngineFolder + "Engine.js");
    AddScript(Folder + "CYOA.js");
}

/**Shortcut to start the story
 * Hit the key S to start the story while in a chat room
 */
{
    let keydown = (e => {
        if (typeof Player === 'undefined') return;
        if (CurrentScreen != "ChatRoom") return;

        let char = String.fromCharCode(e.keyCode);
        if (char == "Z") {
            CYOA_Start();

            window.removeEventListener("keydown", keydown);
        }
        console.log("window.keydown: " + char);
    }).bind(this);

    window.addEventListener("keydown", keydown);
}