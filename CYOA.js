/**
 * The variable to the CYOA
 * Run CYOA().Start() in console after hosting a room.
 */
var CYOA = function CYOA() {

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

	function GetRoom(roomName) {
		return Room.find(x => x.Name == roomName);
	}

	function GotoRoom(roomName, printRoomDesc = true) {
		var found = GetRoom(roomName);
		if (found == null) {
			console.log("[ERROR] Room " + roomName + " not found!");
			return;
		}

		CurrentRoom = found;

		if (printRoomDesc)
			CE(CurrentRoom.Entry);

		console.log("[INFO] GotoRoom: " + CurrentRoom.Name);
	}

	C = Player;

	class Trigger {
		Text = "TRIGGER TEXT";
		Action = () => { };

		constructor(Text, Room) {
			this.Text = Text;
			this.Room = Room;
		}

		/**Use to print in messages; Should not be overriden */
		Print = () => "(" + this.Text + ")";
	}

	class Level {
		Name = "ROOM NAME";
		Entry = "Will display when player enters the room";
		Triggers = [];

		constructor(Name) {
			this.Name = Name;
		}
	}

	var Flags = {};

	var Room = [];

	{
		var r = new Level("Entrance");

		//Triggers
		var goDown = new Trigger("go down", r);
		goDown.Action = () => GotoRoom("Basement");
		r.Triggers.push(goDown);

		var checkLocker = new Trigger("check locker", r);
		checkLocker.Action = () => GotoRoom("Locker");
		r.Triggers.push(checkLocker);

		{
			var t = new Trigger("window", r);
			t.Action = function () {
				if ((data.Type == "Action") && (msg.startsWith("serverenter"))) {
					var UpdatedRoom = {
						Name: ChatRoomData.Name,
						Description: ChatRoomData.Description,
						Background: ChatRoomData.Background,
						Limit: ChatRoomData.Limit,
						Admin: ChatRoomData.Admin,
						Ban: ChatRoomData.Ban,
						Private: ChatRoomData.Private,
						Locked: false
					};
					ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Room: UpdatedRoom, Action: "Update" });
					ChatAdminMessage = "UpdatingRoom";
					CE("You find a window, and it slides open at first try. Apparently someone was a bit careless with the security");
				}
			};

			r.Triggers.push(t);
		}

		r.Entry = "The dim lights of closed and covered windows lights the room as you return your attention to the main hall. " +
			"You can still " + checkLocker.Print() + " or " + goDown.Print();

		Room.push(r);
	}

	{
		var r = new Level("Locker");

		//Triggers
		var tryCuffs = new Trigger("try cuffs", r);
		{
			tryCuffs.Action = function () {
				InventoryWear(C, "LeatherCuffs", "ItemArms", "Default", 20);
				ChatRoomCharacterUpdate(C);
				CE("the cuffs slide on nicely. there doesn't seem to be anything unusual about them");
			};
			r.Triggers.push(tryCuffs);
		}
		var tryGag = new Trigger("try gag", r);
		{
			tryGag.Action = function () {
				if (Flags.Gagged) {
					CE("The gag stays firmly in place");
				} else {
					InventoryWear(C, "BallGag", "ItemMouth");
					InventoryLock(C, InventoryGet(C, "ItemMouth", "Default", 20), "MistressPadlock", 2313);
					ChatRoomCharacterUpdate(C)
					CE("The gag fits snugly between your lips, keeping your mouth open. A light mechanical sound and a 'click' can be heard as the straps pull tightly together and a mechanism on the buckle locks it in place");

					Flags.Gagged = true;
				}
			};
			r.Triggers.push(tryGag);
		}
		var goBack = new Trigger("go back", r);
		goBack.Action = () => GotoRoom("Entrance");
		r.Triggers.push(goBack);

		r.Entry = "The locker is mostly empty but it contains a set of leather cuffs" + tryCuffs.Print() + " and a ball gag" + tryGag.Print() + ". You could of course also go back" + goBack.Print();

		Room.push(r);
	}

	{
		var r = new Level("Basement");

		//Triggers
		var acceptFate = new Trigger("open door", r);
		{
			acceptFate.Action = () => CE("The door is simply too solid, and any attempt at prying it open seems meaningless");
			r.Triggers.push(acceptFate);
		}
		var lens = new Trigger("lens", r);
		{
			lens.Action = function () {
				if (InventoryGet(C, "ItemArms")) {
					if (InventoryGet(C, "ItemArms").Property) {
						if (CharacterIsNaked(C) && InventoryGet(C, "ItemArms").Property.Restrain == "Both" && InventoryGet(C, "ItemMouth").Asset.Name == "BallGag") {

							var r = GetRoom("Basement");
							var goThroughDoor = new Trigger("go through door", r);
							goThroughDoor.Action = function () {

								GotoRoom("Room2");

								var UpdatedRoom = {
									Name: ChatRoomData.Name,
									Description: ChatRoomData.Description,
									Background: "VaultCorridor",
									Limit: ChatRoomData.Limit,
									Admin: ChatRoomData.Admin,
									Ban: ChatRoomData.Ban,
									Private: ChatRoomData.Private,
									Locked: true
								}
								ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Room: UpdatedRoom, Action: "Update" });
								ChatAdminMessage = "UpdatingRoom";
							}

							r.Triggers[0] = goThroughDoor;

							CE("The door opens");

							r.Entry = "With the door open you can now either (go through door) or (go back)";

							GotoRoom("Basement");
						}
						else {
							GotoRoom("Hook");
						}
					}
					else {
						CE("The sensor moves a bit, but nothing seems to happen")
					}
				}
				else {
					CE("The sensor moves a bit, but nothing seems to happen")
				}
			};
			r.Triggers.push(lens);
		}

		var goBack = new Trigger("go back", r);
		goBack.Action = () => GotoRoom("Entrance");
		r.Triggers.push(goBack);

		r.Entry = "At the end of the basement stairs is a large metal door with the picture of a naked girl with her arms cuffed at her wrist and elbows, behind her back, and a ballgag in her mouth. " +
			"Next to the door is some kind of lens. You could try to " + acceptFate.Print() + ", " + goBack.Print() + " or stand in front of the " + lens.Print();

		Room.push(r);
	}

	{
		var r = new Level("Hook");

		//Triggers
		var hookCloth = new Trigger("hook cloth", r);
		{
			hookCloth.Action = function () {
				CE("The hook seems like it almost was made for this, and it even moves a bit to swiftly tear up your clothes, then retracts back into the wall.");
				CharacterNaked(C);
				ChatRoomCharacterUpdate(C);
				GotoRoom("Basement", false);
			};
			r.Triggers.push(hookCloth);
		}
		var struggle = new Trigger("hook gag", r);
		{
			struggle.Action = function () {
				CE("The hook retracts back into the wall at any attempt at moving the gag close to it. Maybe standing in front of the lens again will extend it once more?");
				GotoRoom("Basement", false);
			};
			r.Triggers.push(struggle);
		}
		var hookCuff = new Trigger("hook cuff", r);
		{
			hookCuff.Action = function () {
				if (InventoryGet(C, "ItemArms").Property) {
					NewPose = "Both"
					DialogFocusItem = InventoryGet(C, "ItemArms");
					DialogFocusItem.Property.Restrain = NewPose;
					DialogFocusItem.Property.SetPose = [(NewPose == "Wrist") ? "BackBoxTie" : "BackElbowTouch"];
					DialogFocusItem.Property.Effect = ["Block", "Prone"];
					DialogFocusItem.Property.SelfUnlock = (NewPose == "Wrist");
					if (NewPose == "Both") DialogFocusItem.Property.Difficulty = 6;
					CharacterRefresh(C);
					ChatRoomCharacterUpdate(C)
					CE("The hook moves and swiftly makes sure your cuffs are connected both at Wrists and Elbows. Maybe you can hook something else as well?")
				} else {
					CE("The cuffs slide onto the hook, but they're simply too sturdy to go anywhere. Maybe you can hook something else instead?")
				}
			};
			r.Triggers.push(hookCuff);
		}

		r.Entry = "The sensor moves a bit, before a panel opens and a hook extends from the wall. Maybe you can hook something onto it " + struggle.Print() + ", " + hookCuff.Print() + " or " + hookCloth.Print();

		Room.push(r);
	}

	{
		var r = new Level("Room2");

		//Triggers
		var acceptFate = new Trigger("check door", r);
		{
			acceptFate.Action = () => CE("The door seems to have locked behind you leaving no way back at the current moment.");
			r.Triggers.push(acceptFate);
		}
		var struggle = new Trigger("stand on platform", r);
		{
			struggle.Action = function () {
				InventoryWear(C, "SpreaderMetal", "ItemFeet", "Default", 20);
				ChatRoomCharacterUpdate(C);
				GotoRoom("Stuck");
			};
			r.Triggers.push(struggle);
		}

		r.Entry = "The door closes behind you" + acceptFate.Print() + " as you enter a round room, with a slightly elevated platform in the middle " + struggle.Print();

		Room.push(r);
	}

	{
		var r = new Level("Stuck");

		//Triggers
		var sameAction = () => {
			InventoryWear(C, "OneBarPrison", "ItemDevices", "Default", 20)
			InventoryWear(C, "VibratingDildo", "ItemVulva")
			InventoryWear(C, "Corset4", "ItemTorso", InventoryGet(C, "HairFront").Color, 20)
			ChatRoomCharacterUpdate(C)
			CE("The phallus penetrates your pussy lips pushing deep with the metal pole locking in place. Another set of arms lifts up to tightly squeeze your waist together in a corset before the platform you're standing on starts elevating towards an opening hatch in the ceiling, to put you on display for whoever might enter next")
			if (!InventoryGet(C, "ItemVulva").Property) InventoryGet(C, "ItemVulva").Property = { Intensity: -1 }
			if (InventoryGet(C, "ItemVulva").Property.Intensity < 2) {
				InventoryGet(C, "ItemVulva").Property.Effect = ["Egged", "Vibrating"]
				InventoryGet(C, "ItemVulva").Property.Intensity = InventoryGet(C, "ItemVulva").Property.Intensity + 2
				ServerSend("ChatRoomChat", { Content: "Dildo" + ((1 > 0) ? "Increase" : "Decrease") + "To" + InventoryGet(C, "ItemVulva").Property.Intensity, Type: "Action", Dictionary: [{ Tag: "DestinationCharacterName", Text: C.Name, MemberNumber: C.MemberNumber }] })
				ChatRoomCharacterUpdate(C)
			}

			Reset();
		};

		var acceptFate = new Trigger("accept fate", r);
		acceptFate.Action = sameAction;
		r.Triggers.push(acceptFate);

		var struggle = new Trigger("struggle", r);
		struggle.Action = sameAction;
		r.Triggers.push(struggle);

		r.Entry = "Mechanical arms extend from the platform tolock cuffs with a metal beam between them around your ankles." +
			" The arms then stay in place to keep you still as a metal pole with a vibrating phallus at the end starts extending from the platform towards your crotch. You can " + struggle.Print() + " or " + acceptFate.Print();

		Room.push(r);
	}

	var CurrentRoom = Room[0];

	function FollowUp(a) {
		CE("- The warehouse is fairly big, but mostly empty. There's a locker you can check on the wall to the right(check locker), or you can head down the stairs to the left, into the basement(go down)")
	}
	function Explanation(r) {
		CA("- The text within parantheses (like this) can be used as part of an emote to perform that action. There may also be hidden aditional actions, but those you will have to guess. You may also have to use normal game mechanics to proceed at some points")
	}
	function Explanation2() {
		CA("- I'm slightly afk, working on the script but will check in now and then to see that everything is alright so feel free to ask if you have questions. Try (check locker) or (go down) in the chat if you haven't gotten started yet. Also, the script won't work if permissions are set to owner and whitelist only")
	}

	function Reset() {
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
	}

	function Process(data) {
		var sender = CharFromID(data.Sender);
		var msg = String(data.Content).toLowerCase();

		if ((data.Type == "Action") && (msg.startsWith("serverenter"))) {
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

			C = ChatRoomCharacter[ChatRoomCharacter.length - 1];
			GotoRoom("Entrance", false);

			CE("As you enter, the door slams shut behind you with the light, mechanical click of a closing lock");
			setTimeout(FollowUp, 3000);
			setTimeout(Explanation, 7000);
			setTimeout(Explanation2, 15000);
			return;
		}

		//Current player types in chat
		if (sender == C && data.Type == "Chat") {
			//Iterate room triggers for a match
			for (var i = 0; i < CurrentRoom.Triggers.length; i++) {
				var trigger = CurrentRoom.Triggers[i];
				var patt = new RegExp(trigger.Text);
				if (patt.test(msg)) {
					console.log("[INFO] Trigger hit: " + trigger.Name);
					trigger.Action();
					return;
				}
			}

			//Print room entry
			var regex = /(look|help)/mg;
			if (regex.test(msg))
				CE(CurrentRoom.Entry);
		}
	}

	return {
		Start: () => {
			console.log("CYOA Starting...");
			ServerSocket.on("ChatRoomMessage", Process);
			Reset();
		}
	};
}