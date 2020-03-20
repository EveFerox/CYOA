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

    /**
     * @param {Engine} Engine
     * @param {string} Name
     */
    constructor(Engine, Name) {
        this.Engine = Engine;
        this.Name = Name;
    }
    
	/** Finds a level by name
	 * @param {string} roomName 
	 * @returns {Level}
	 */
    GetRoom(roomName) {
        return this.Levels.find(x => x.Name == roomName);
    }

    /**Resets the story to its default state */
    Reset() {
        this.Flags = {};
    }
}

/**The CYOA Engine */
class Engine {

    /**@type {Story} The current story loaded */
    S = null;

    /**@type {Level} */
    CurrentLevel = null;

    /**Current Player */
    C = null;

    /**Starts story
     * @param {Story} story */
    Start(story) {
        CA("=== CYOA Starting ===");
        this.S = story;
        this.Reset();
        this.C = Player;
        this.CurrentLevel = this.S.EntryLevel;
        this.S.StartAction();
        this.GotoRoom(this.CurrentLevel.Name);
        console.log("CYOA Starting...");
        ServerSocket.on("ChatRoomMessage", (data => this.Process(data)).bind(this));  
    }

	/** Finds and moves the player to the Level
	 * @param {string} roomName
	 * @param {boolean} printRoomDesc
	 */
    GotoRoom(roomName, printRoomDesc = true) {
        var found = this.S.GetRoom(roomName);
        if (found == null) {
            console.log("[ERROR] Room " + roomName + " not found!");
            return;
        }

        this.CurrentLevel = found;

        this.CurrentLevel.Prepare(this.CurrentLevel);

        if (printRoomDesc)
            CE(this.CurrentLevel.Describe());

        console.log("[INFO] GotoRoom: " + this.CurrentLevel.Name);
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
        this.S.Reset();
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

    Process(data) {
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
                this.GotoRoom("Entrance", false);

                this.S.StartAction();
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
                this.GotoRoom(this.CurrentLevel.Name);
        }
    }
}
