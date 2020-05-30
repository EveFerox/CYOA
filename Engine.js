// @ts-check

class Trigger {

    /**Possible Trigger Types */
    static Types = Object.freeze({
        Emote: "Emote",
        Action: "Action",
        Activity: "Activity",
        Chat: "Chat",

        /**@type {string[]} */
        All: [],
        
        constructor() {
            this.All = [
                this.Emote,
                this.Action,
                this.Activity,
                this.Chat,
            ];
        }
    });

    /**@type {string} */
    Text = "TRIGGER TEXT";

    /**@type {RegExp} */
    Regex = null;

    /**@type {string} */
    Type = Trigger.Types.Emote;

	/**Tests Regex or Text of this trigger
	 * @param {string} txt Text to test
     * @returns {boolean}
	 */
    IsMatch = txt => {
        if (this.Regex == null) {
            // No regex, try to match text
            return new RegExp(this.Text).test(txt);
        }

        return this.Regex.test(txt);
    }

	/**Function for this triggers logic
     * @param {string} txt
     * @param {object} C player
     */
    Action = (txt, C) => { };

	/**
	 * @param {string} Text
	 */
    constructor(Text) {
        this.Text = Text;
    }

	/**Use to print in messages; Should not be overriden 
	 * @returns {string} */
    Print = () => "(" + this.Text + ")";
}

class Level {
    /**@type {string} */
    Name = "ROOM NAME";
    /**@type {string} */
    Entry = "Will display when player enters the room";
    /**@type {Trigger[]} */
    Triggers = [];

    /**@param {Level} level this level*/
    Prepare = level => { };

    /**@returns {string} */
    Describe = () => this.Entry;

    /**@returns {Trigger[]} */
    GetTriggers = () => this.Triggers;

    /**
     * @param {string} Name
     */
    constructor(Name) {
        this.Name = Name;
    }
}

class Story {
    /**@type {string} */
    Name = "STORY NAME";

    /**All levels in the story
     * @type {Level[]} */
    Levels = [];

	/**All story persistent flags
	 * @type {object} */
    Flags = {};

    /**Called when story is started [Optional]
     * @type {function} */
    OnStart = () => { };

    /**Called when story is being reset [Optional]
     * @type {function} */
    OnReset = () => { };

    /**Called when character enters ChatRoom [Optional]
     * @type {function}
     * @param {object} char
     */
    OnCharEnter = char => { };

    /**Called when character leaves ChatRoom [Optional]
     * @type {function} 
     * @param {object} char
     */
    OnCharExit = char => { };

    /**@type {Engine} */
    Engine;

    /**
     * @param {string} Name
     */
    constructor(Name) {
        this.Name = Name;
    }
    
	/** Finds a level by name
	 * @param {string} levelName 
	 * @returns {Level}
	 */
    GetLevel(levelName) {
        return this.Levels.find(x => x.Name == levelName);
    }

    /**Resets the story to its default state */
    Reset() {
        this.Flags = {};
        this.OnReset();
    }
}

/**The CYOA Engine */
class Engine {

    static get Version() { return 0.3; }

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

        CA("=== CYOA Engine Starting ===", null, true);

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
        CA("=== CYOA Engine Stopping ===", null, true);
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
        var found = this.CurrentStory.GetLevel(levelName);
        if (found == null) {
            console.log("[ERROR] Room " + levelName + " not found!");
            return;
        }

        this.#setCurrentLevel(found);

        this.CurrentLevel.Prepare(this.CurrentLevel);

        if (printRoomDesc)
            CE(this.CurrentLevel.Describe());
    }

    Reset() {
        this.CurrentStory.Reset();
    }

    /**Sends a "ChatRoomAdmin" message to server
     * @param {{ Name?: string; Description?: string; Background?: string; Limit?: string; Admin?: string; Ban?: any; Private?: boolean; Locked?: boolean; }} roomSettings
     */
    ChangeRoomSettings(roomSettings) {
        ServerSend("ChatRoomAdmin", {
            MemberNumber: Player.ID,
            Action: "Update",
            Room: {
                Name: roomSettings.Name || ChatRoomData.Name,
                Description: roomSettings.Description || ChatRoomData.Description,
                Background: roomSettings.Background || ChatRoomData.Background,
                Limit: roomSettings.Limit || ChatRoomData.Limit,
                Admin: roomSettings.Admin || ChatRoomData.Admin,
                Ban: roomSettings.Ban || ChatRoomData.Ban,
                Private: roomSettings.Private || ChatRoomData.Private,
                Locked: roomSettings.Locked || ChatRoomData.Locked
            }
        });
    }

    #OnRoomMessage = (data) => {
        var sender = CharFromID(data.Sender);
        var msg = String(data.Content).toLowerCase();

        if (data.Type == "Action") {
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
            //Iterate room triggers for a match
            var triggers = this.CurrentLevel.GetTriggers();
            for (var i = 0; i < triggers.length; i++) {
                var trigger = triggers[i];

                //Check trigger type
                if (trigger.Type != data.Type) continue;

                if (trigger.IsMatch(msg)) {
                    console.log("[INFO] Trigger hit: " + trigger.Text);
                    trigger.Action(msg, sender);
                    return;
                }
            }

            //Print room entry
            var regex = /(look|help)/mg;
            if (regex.test(msg))
                this.GotoLevel(this.CurrentLevel.Name);
        }
    }

    #OnRoomSync = (data) => {
        //TODO
    }
}
