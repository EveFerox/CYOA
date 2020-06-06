// @ts-check

/**The CYOA Engine */
class Engine {

    static get Version() { return 0.31; }

    /**The single instance of the CYOA engine.
     * @returns {Engine}
     */
    static get Instance() {
        if (Engine.#instance == null) {
            Engine.#instance = new Engine();
        }
        return Engine.#instance;
    }
    /**@type {Engine} */
    // @ts-ignore
    static #instance;

    /**@type {Story} */
    #S = null;

    /**@returns {Story} The current Story loaded*/
    get CurrentStory() {
        return this.#S;
    }

    /**@type {Level} */
    #level = null;

    /**@returns {Level} The current Level*/
    get CurrentLevel() {
        return this.#level;
    }

    /**@param {Level} level */
    #setCurrentLevel = (level)=> {
        this.#level = level;
        console.log(`[INFO] CurrentLevel: ${this.#level.Name}`);
    }

    /**Playing characters
     * @type {object[]}
     */
    #players = [];

    get Players() {
        return this.#players;
    }

    /**Checks if a character is playing the Story
     * @param {object} char 
     * @returns {boolean}
     */
    IsCharPlaying(char) {
        return this.Players.indexOf(char) >= 0;
    }

    #boundChatMessage;
    #boundRoomSync;

    /**Starts story
     * @param {(Story)} story 
     */
    Start(story) {
        if (this.CurrentStory != null) {
            this.Stop();
        }

        if ((story instanceof Story) == false) {
            console.log("[Error] Parameter is not instance of Story");
            return;
        }

        this.#S = story;

        this.ChatAction("=== CYOA Engine Starting ===", null, true);

        this.CurrentStory.Engine = this;
        this.CurrentStory.OnStart();

        // Simulate Player as playing char by default
        this.CurrentStory.OnCharEnter(Player);

        this.#boundChatMessage = (data => this.#OnRoomMessage(data)).bind(this);
        ServerSocket.on("ChatRoomMessage", this.#boundChatMessage);

        this.#boundRoomSync = (data => this.#OnRoomSync(data)).bind(this);
        ServerSocket.on("ChatRoomSync", this.#boundRoomSync);  
    }

    /**Stops the current story */
    Stop() {
        this.ChatAction("=== CYOA Engine Stopping ===", null, true);
        ServerSocket.off("ChatRoomMessage", this.#boundChatMessage);
        ServerSocket.off("ChatRoomSync", this.#boundRoomSync);  
    }

    Restart() {
        this.Reset();
        this.Start(this.CurrentStory);
    }

	/** Finds and moves the player to the Level
	 * @param {string} levelName
	 * @param {boolean} printRoomDesc
	 */
    GotoLevel(levelName, printRoomDesc = true) {
        let found = this.CurrentStory.GetLevel(levelName);
        if (found == null) {
            console.log("[ERROR] Room " + levelName + " not found!");
            return;
        }

        this.#setCurrentLevel(found);

        this.CurrentLevel.Prepare(this.CurrentLevel);

        if (printRoomDesc)
            this.ChatEmote(this.CurrentLevel.Describe());
    }

    Reset() {
        this.CurrentStory.Reset();
    }

    /**Sends a "ChatRoomAdmin" message to server
     * @param {Object} roomSettings
     * @param {string} [roomSettings.Name]
     * @param {string} [roomSettings.Description]
     * @param {string} [roomSettings.Background]
     * @param {string} [roomSettings.Limit]
     * @param {number[]} [roomSettings.Admin]
     * @param {number[]} [roomSettings.Ban]
     * @param {boolean} [roomSettings.Private]
     * @param {boolean} [roomSettings.Locked]
     */
    ChangeRoomSettings(roomSettings) {
        let Room = {
            Name: roomSettings.Name || ChatRoomData.Name,
            Description: roomSettings.Description || ChatRoomData.Description,
            Background: roomSettings.Background || ChatRoomData.Background,
            Limit: roomSettings.Limit || ChatRoomData.Limit,
            Admin: roomSettings.Admin || ChatRoomData.Admin,
            Ban: roomSettings.Ban || ChatRoomData.Ban,
            Private: ChatRoomData.Private,
            Locked: ChatRoomData.Locked
        }

        if (roomSettings.Private != undefined) {
            Room.Private = roomSettings.Private;
        }

        if (roomSettings.Locked != undefined) {
            Room.Locked = roomSettings.Locked;
        }

        ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Action: "Update", Room: Room });
    }

    /**Chat Action
     * @param {string} text
     * @param {number} target
     * @param {boolean} isLogToConsole
     */
    ChatAction(text, target = undefined, isLogToConsole = false) {
        ServerSend("ChatRoomChat", {
            Content: "ActionRemove",
            Type: "Action",
            Dictionary: [{
                Tag: "SourceCharacter removes the PrevAsset from DestinationCharacter FocusAssetGroup.",
                Text: text
            }],
            Target: target
        });
        if (isLogToConsole) console.log(text);
    }

    #hostSendEmoteCounter = 0;

    /**Chat Emote
     * @param {string} text
     * @param {number} target
     * @param {boolean} isLogToConsole
     */
    ChatEmote(text, target = undefined, isLogToConsole = false) {
        if (this.IsCharPlaying(Player)) this.#hostSendEmoteCounter++;
        ServerSend("ChatRoomChat", {
            Content: "*" + text,
            Type: "Emote",
            Target: target
        });
        if (isLogToConsole) console.log(text);
    }

    /**
     * @param {Object} data
     * @param {number} data.Sender
     * @param {string} data.Content
     * @param {string} data.Type
     */
    #OnRoomMessage = (data) => {
        let sender = CharFromID(data.Sender);
        let msg = String(data.Content).toLowerCase();

        //Handle special actions
        if (data.Type == Trigger.Types.Action) {
            if (msg.startsWith("serverenter")) {
                // Character entered
                this.CurrentStory.OnCharEnter(sender);
                return;
            }

            if (msg.startsWith("serverdisconnect") || msg.startsWith("serverleave")) {
                // Character left
                this.CurrentStory.OnCharExit(sender);
                return;
            }
        }

        //Current player sent a message
        if (this.IsCharPlaying(sender)) {

            //Ignore message if host sent an emote
            if (sender.MemberNumber == Player.MemberNumber &&
                data.Type == Trigger.Types.Emote &&
                this.#hostSendEmoteCounter > 0) {
                this.#hostSendEmoteCounter--;
                return;
            }

            //Iterate room triggers for a match
            let triggers = this.CurrentLevel.GetTriggers();
            for (let i = 0; i < triggers.length; i++) {
                let trigger = triggers[i];

                //Check trigger type
                if (trigger.Type != data.Type) continue;

                if (trigger.IsMatch(msg)) {
                    console.log("[INFO] Trigger hit: " + trigger.Text);
                    trigger.Action(msg, sender);
                    return;
                }
            }

            //Print room entry
            let regex = /(look|help)/mg;
            if (regex.test(msg))
                this.GotoLevel(this.CurrentLevel.Name);
        }
    }

    #OnRoomSync = (data) => {
        //TODO
    }
}
