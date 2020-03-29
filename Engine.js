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
     */
    Action = txt => { };

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

    /**@type {Level} */
    EntryLevel = null;

	/**All story persistent flags
	 * @type {object} */
    Flags = {};

    /**Called when story is started [Optional]
     * @type {function} */
    OnStart = () => { };

    /**Called when story is being reset [Optional]
     * @type {function} */
    OnReset = () => { };

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

    static get Version() { return 0.2; }

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

    /**@type {Story} The current story loaded */
    #S = null;

    /**@returns {Story} */
    get CurrentStory() {
        return this.#S;
    }

    /**Current Level
     * @type {Level} */
    #level = null;

    /**@returns {Level} */
    get CurrentLevel() {
        return this.#level;
    }

    /**@param {Level} level */
    #setCurrentLevel = (level)=> {
        this.#level = level;
        console.log(`[INFO] CurrentLevel: ${this.#level.Name}`);
    }

    /**Current Player */
    #player = null;

    /**Returns the current player */
    get CurrentPlayer() {
        return this.#player;
    }

    #setCurrentPlayer = (player) => {
        this.#player = player;
        console.log(`[INFO] CurrentPlayer: ${this.#player.Name} (${this.#player.MemberNumber})`);
    }

    #boundChatMessage;
    #boundRoomSync;

    /**Starts story
     * @param {(Story)} story 
     */
    Start(story) {
        if (this.#S != null) {
            this.Stop();
        }

        if ((story instanceof Story) == false) {
            console.log("[Error] Parameter is not instance of Story");
            return;
        }

        this.#S = story;

        CA("=== CYOA Engine Starting ===", null, true);

        this.#setCurrentPlayer(Player);
        this.#S.Engine = this;
        this.#S.OnStart();
        this.GotoLevel(this.#S.EntryLevel.Name);

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
        var found = this.#S.GetLevel(levelName);
        if (found == null) {
            console.log("[ERROR] Room " + levelName + " not found!");
            return;
        }

        this.#setCurrentLevel(found);

        this.CurrentLevel.Prepare(this.CurrentLevel);

        if (printRoomDesc)
            CA(this.CurrentLevel.Describe());
    }

    Reset() {
        this.#S.Reset();
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
                var UpdatedRoom = {
                    Name: ChatRoomData.Name,
                    Description: ChatRoomData.Description,
                    Background: "AbandonedBuilding",
                    Limit: "2",
                    Admin: ChatRoomData.Admin,
                    Ban: ChatRoomData.Ban,
                    Private: ChatRoomData.Private,
                    Locked: true
                }
                ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Room: UpdatedRoom, Action: "Update" });
                ChatAdminMessage = "UpdatingRoom";

                this.#setCurrentPlayer(ChatRoomCharacter[ChatRoomCharacter.length - 1]);
                this.GotoLevel("Entrance", false);

                this.#S.OnStart();
                return;
            }

            // Reset room if current player disconnects
            if (msg.startsWith("serverdisconnect") || msg.startsWith("serverleave")) {
                setTimeout((() => {
                    if (this.CurrentPlayer == null) this.Reset();
                    for (var i = 0; i < ChatRoomCharacter.length; i++) {
                        if (this.CurrentPlayer.MemberNumber == ChatRoomCharacter[i].MemberNumber)
                            return;
                    }
                    this.Reset();
                }).bind(this), 3000);
                return;
            }
        }

        //Current player sent a message
        if (sender == this.CurrentPlayer) {
            //Iterate room triggers for a match
            var triggers = this.CurrentLevel.GetTriggers();
            for (var i = 0; i < triggers.length; i++) {
                var trigger = triggers[i];

                //Check trigger type
                if (trigger.Type != data.Type) continue;

                if (trigger.IsMatch(msg)) {
                    console.log("[INFO] Trigger hit: " + trigger.Text);
                    trigger.Action(msg);
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
