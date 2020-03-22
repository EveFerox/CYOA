// @ts-check

class Trigger {
     
    /**@type {string} */
    Text = "TRIGGER TEXT";

    /**@type {RegExp} */
    Regex = null;

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
    StartAction = () => { };

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
    C = null;

    #boundChatMessage;
    #boundRoomSync;

    /**Starts story
     * @param {(Story)} story 
     */
    Start(story) {
        if (this.#S != null) {
            this.Stop();
        }

        this.#S = story;

        CA("=== CYOA Engine Starting ===");
        console.log("=== CYOA Engine Starting ===");

        this.Reset();
        this.C = Player;
        this.#S.Engine = this;
        this.#S.StartAction();
        this.GotoLevel(this.#S.EntryLevel.Name);

        this.#boundChatMessage = (data => this.#OnRoomMessage(data)).bind(this);
        ServerSocket.on("ChatRoomMessage", this.#boundChatMessage);

        this.#boundRoomSync = (data => this.#OnRoomSync(data)).bind(this);
        ServerSocket.on("ChatRoomSync", this.#boundRoomSync);  
    }

    /**Stops the current story */
    Stop() {

        CA("=== CYOA Engine Stopping ===");
        console.log("=== CYOA Engine Stopping ===");
        ServerSocket.off("ChatRoomMessage", this.#boundChatMessage);
        ServerSocket.off("ChatRoomSync", this.#boundRoomSync);  
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
            CE(this.CurrentLevel.Describe());
    }

    Reset() {
        var UpdatedRoom = {
            Name: ChatRoomData.Name,
            Description: ChatRoomData.Description,
            Background: "AbandonedBuilding",
            Limit: (ChatRoomCharacter.length + 1).toString(),
            Admin: ChatRoomData.Admin,
            Ban: ChatRoomData.Ban,
            Private: ChatRoomData.Private,
            Locked: false
        }
        ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Room: UpdatedRoom, Action: "Update" });
        ChatAdminMessage = "UpdatingRoom";
        this.#S.Reset();
    }

    UnlockRoom() {
        var UpdatedRoom = {
            Name: ChatRoomData.Name,
            Description: ChatRoomData.Description,
            Background: "AbandonedBuilding",
            Limit: (ChatRoomCharacter.length + 1).toString(),
            Admin: ChatRoomData.Admin,
            Ban: ChatRoomData.Ban,
            Private: true,
            Locked: false
        }
        ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Room: UpdatedRoom, Action: "Update" });
        ChatAdminMessage = "UpdatingRoom";
    }

    CharacterStillInRoom() {
        var resetcheck = 0
        for (var i = 0; i < ChatRoomCharacter.length; i++) {
            if (this.C.MemberNumber == ChatRoomCharacter[i].MemberNumber)
                resetcheck = 1
        }
        if (resetcheck != 1)
            this.Reset()
        resetcheck = 0
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

                this.C = ChatRoomCharacter[ChatRoomCharacter.length - 1];
                this.GotoLevel("Entrance", false);

                this.#S.StartAction();
                return;
            }

            // Reset room if current player disconnects
            if (msg.startsWith("serverdisconnect") || msg.startsWith("serverLeave")) {
                setTimeout(this.CharacterStillInRoom, 3000);
                return;
            }
        }

        //Current player types in chat
        if (sender == this.C && data.Type == "Chat") {
            //Iterate room triggers for a match
            var triggers = this.CurrentLevel.GetTriggers();
            for (var i = 0; i < triggers.length; i++) {
                var trigger = triggers[i];
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
