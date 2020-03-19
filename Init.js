// @ts-check

/**@type {Engine} */
var engine = null;

/**Loading manually all the scripts */
{
    let Folder = "Scripts/CYOA/";
    let Ext = ".js";

    /**@param {string} scriptFileName */
    function AddScript(scriptFileName) {
        var script = document.createElement('script');
        script.src = Folder + scriptFileName + Ext;
        return document.head.appendChild(script);
    }

    AddScript("Utils");
    let engineScript = AddScript("Engine")
    AddScript("CYOA");

    engineScript.onload = () => {
        engine = new Engine();
    };
}

/**Shortcut to start the story
 * Hit the key S to start the story while in a chat room
 */
{    
    let isStarted = false;

    window.addEventListener("keydown", (e) => {
        if (isStarted) return;
        if (CurrentScreen != "ChatRoom") return;

        if (String.fromCharCode(e.keyCode) == "S") {
            let story = ElliesStory(engine);

            engine.Start(story);
            isStarted = true;
        }
    });
}