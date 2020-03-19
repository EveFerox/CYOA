// @ts-check

/**@param {Engine} Engine */
function ElliesStory(Engine) {

	var S = new Story(Engine, "Ellies");

	S.StartAction = () => {
		CE("As you enter, the door slams shut behind you with the light, mechanical click of a closing lock");

		setTimeout(FollowUp, 3000);
		setTimeout(Explanation, 7000);
		setTimeout(Explanation2, 15000);

		function FollowUp(a) {
			CE("- The warehouse is fairly big, but mostly empty. There's a locker you can check on the wall to the right(check locker), or you can head down the stairs to the left, into the basement(go down)")
		}
		function Explanation(r) {
			CA("- The text within parantheses (like this) can be used as part of an emote to perform that action. There may also be hidden aditional actions, but those you will have to guess. You may also have to use normal game mechanics to proceed at some points")
		}
		function Explanation2() {
			CA("- I'm slightly afk, working on the script but will check in now and then to see that everything is alright so feel free to ask if you have questions. Try (check locker) or (go down) in the chat if you haven't gotten started yet. Also, the script won't work if permissions are set to owner and whitelist only")
		}
	};

	{
		let r = S.EntryLevel = new Level("Entrance");

		//Triggers
		let goDown = new Trigger("go down");
		goDown.Action = () => Engine.GotoRoom("Basement");
		r.Triggers.push(goDown);

		let checkLocker = new Trigger("check locker");
		checkLocker.Action = () => Engine.GotoRoom("Locker");
		r.Triggers.push(checkLocker);

		{
			let t = new Trigger("window");
			t.Action = function () {
				CE("You find a window, and it slides open at first try. Apparently someone was a bit careless with the security");
			};

			r.Triggers.push(t);
		}

		r.Entry = "The dim lights of closed and covered windows lights the room as you return your attention to the main hall. " +
			"You can " + checkLocker.Print() + " or " + goDown.Print();

		S.Levels.push(r);
	}

	{
		let r = new Level("Locker");

		//Triggers
		let tryCuffs = new Trigger("try cuffs");
		tryCuffs.Action = function () {
			InventoryWear(Engine.C, "LeatherCuffs", "ItemArms", "Default", 20);
			InventoryLock(Engine.C, InventoryGet(Engine.C, "ItemArms"), "MistressPadlock", 2313);
			ChatRoomCharacterUpdate(Engine.C);
			CE("The cuffs slide on nicely. There doesn't seem to be anything unusual about them, but after a few seconds a mechanical click can be heard as they tighten a bit and a mechanical click of a locking mechanism on each buckle secures them in place");

			S.Flags.IsTookCuffs = true;
		};

		let tryGag = new Trigger("try gag");
		tryGag.Action = function () {
			InventoryWear(Engine.C, "BallGag", "ItemMouth");
			InventoryLock(Engine.C, InventoryGet(Engine.C, "ItemMouth"), "MistressPadlock", 2313);
			ChatRoomCharacterUpdate(Engine.C)
			CE("The gag fits snugly between your lips, keeping your mouth open. A light mechanical sound and a 'click' can be heard as the straps pull tightly together and a mechanism on the buckle locks it in place");

			S.Flags.IsTookGag = true;
		};

		let goBack = new Trigger("go back");
		goBack.Action = () => Engine.GotoRoom("Entrance");

		r.Prepare = level => {
			var d = "The locker is mostly empty but it contains";

			level.Triggers = [];

			var isContainsAny = false;

			if (!S.Flags.IsTookCuffs) {
				d += " a set of leather cuffs" + tryCuffs.Print();
				isContainsAny = true;
				level.Triggers.push(tryCuffs);
			}

			if (!S.Flags.IsTookGag) {
				if (isContainsAny)
					d += " and";
				d += " a ball gag" + tryGag.Print()
				isContainsAny = true;
				level.Triggers.push(tryGag);
			}

			if (isContainsAny == false) {
				d = "The locker is empty";
			}

			level.Triggers.push(goBack);

			level.Entry = d + ". You could of course also go back" + goBack.Print();
		};

		S.Levels.push(r);
	}

	{
		let r = new Level("Basement");

		//Triggers
		let acceptFate = new Trigger("open door");
		{
			acceptFate.Action = () => CE("The door is simply too solid, and any attempt at prying it open seems meaningless");
		}
		let lens = new Trigger("lens");
		{
			lens.Action = function () {
				if (InventoryGet(Engine.C, "ItemArms").Asset.Name == "LeatherCuffs") {
					if (InventoryGet(Engine.C, "ItemArms").Property) {
						if (CharacterIsNaked(Engine.C) && InventoryGet(Engine.C, "ItemArms").Property.Restrain == "Both" && InventoryGet(Engine.C, "ItemMouth").Asset.Name == "BallGag") {

							var r = S.GetRoom("Basement");

							S.Flags.DoorOpen = true;

							CE("The door opens");

							r.Entry = "With the door open you can now either (go through door) or (go back)";

							Engine.GotoRoom("Basement");
						}
						else {
							Engine.GotoRoom("Hook");
						}
					}
					else {
						InventoryGet(Engine.C, "ItemArms").Property = { Restrain: null };
						Engine.GotoRoom("Hook");
					}
				}
				else {
					CE("The sensor moves a bit, but nothing seems to happen")
				}
			};
		}
		let goThroughDoor = new Trigger("go through door")
		{
			goThroughDoor.Action = function () {
				Engine.GotoRoom("Room2");
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
		}
		let goBack = new Trigger("go back");
		goBack.Action = () => Engine.GotoRoom("Entrance");
		r.Triggers.push(goBack);

		r.Prepare = level => {
			var d = "At the end of the basement stairs is a large metal door with the picture of a naked girl with her arms cuffed at her wrist and elbows, behind her back, and a ballgag in her mouth. " +
				"Next to the door is some kind of lens. You could try to " + acceptFate.Print() + ", " + goBack.Print() + " or stand in front of the " + lens.Print();

			level.Triggers = [];

			if (!S.Flags.DoorOpen) {
				r.Triggers.push(lens);
				r.Triggers.push(acceptFate);
			} else {
				d = "With the door open you can now either" + goThroughDoor.Print() + ", or " + goBack.Print();
				level.Triggers.push(goThroughDoor);

			}
			level.Triggers.push(goBack);

			level.Entry = d;
		};


		r.Entry = "At the end of the basement stairs is a large metal door with the picture of a naked girl with her arms cuffed at her wrist and elbows, behind her back, and a ballgag in her mouth. " +
			"Next to the door is some kind of lens. You could try to " + acceptFate.Print() + ", " + goBack.Print() + " or stand in front of the " + lens.Print();

		S.Levels.push(r);
	}

	{
		let r = new Level("Hook");

		//Triggers
		let hookCloth = new Trigger("hook cloth");
		{
			hookCloth.Action = function () {
				CE("The hook seems like it almost was made for this, and it even moves a bit to swiftly tear up your clothes, then retracts back into the wall.");
				CharacterNaked(Engine.C);
				ChatRoomCharacterUpdate(Engine.C);
				Engine.GotoRoom("Basement", false);
			};
			r.Triggers.push(hookCloth);
		}
		let struggle = new Trigger("hook gag");
		{
			struggle.Action = function () {
				CE("The hook retracts back into the wall at any attempt at moving the gag close to it. Maybe standing in front of the lens again will extend it once more?");
				Engine.GotoRoom("Basement", false);
			};
			r.Triggers.push(struggle);
		}
		let hookCuff = new Trigger("hook cuff");
		{
			hookCuff.Action = function () {
				if (InventoryGet(Engine.C, "ItemArms").Property) {
					var NewPose = "Both"
					DialogFocusItem = InventoryGet(Engine.C, "ItemArms");
					DialogFocusItem.Property.Restrain = NewPose;
					DialogFocusItem.Property.SetPose = [(NewPose == "Wrist") ? "BackBoxTie" : "BackElbowTouch"];
					DialogFocusItem.Property.Effect = ["Block", "Prone"];
					DialogFocusItem.Property.SelfUnlock = (NewPose == "Wrist");
					if (NewPose == "Both") DialogFocusItem.Property.Difficulty = 6;
					CharacterRefresh(Engine.C);
					ChatRoomCharacterUpdate(Engine.C)
					CE("The hook moves and swiftly makes sure your cuffs are connected both at Wrists and Elbows. Maybe you can hook something else as well?")
				} else {
					CE("The cuffs slide onto the hook, but they're simply too sturdy to go anywhere. Maybe you can hook something else instead?")
				}
			};
			r.Triggers.push(hookCuff);
		}

		r.Entry = "The sensor moves a bit, before a panel opens and a hook extends from the wall. Maybe you can hook something onto it " + struggle.Print() + ", " + hookCuff.Print() + " or " + hookCloth.Print();

		S.Levels.push(r);
	}

	{
		let r = new Level("Room2");

		//Triggers
		let acceptFate = new Trigger("check door");
		{
			acceptFate.Action = () => CE("The door seems to have locked behind you leaving no way back at the current moment.");
			r.Triggers.push(acceptFate);
		}
		let struggle = new Trigger("stand on platform");
		{
			struggle.Action = function () {
				InventoryWear(Engine.C, "SpreaderMetal", "ItemFeet", "Default", 20);
				ChatRoomCharacterUpdate(Engine.C);
				Engine.GotoRoom("Stuck");
			};
			r.Triggers.push(struggle);
		}

		r.Entry = "The door closes behind you" + acceptFate.Print() + " as you enter a round room, with a slightly elevated platform in the middle " + struggle.Print();

		S.Levels.push(r);
	}

	{
		let r = new Level("Stuck");

		//Triggers
		let sameAction = () => {
			InventoryWear(Engine.C, "OneBarPrison", "ItemDevices", "Default", 20)
			InventoryWear(Engine.C, "VibratingDildo", "ItemVulva")
			InventoryWear(Engine.C, "Corset4", "ItemTorso", InventoryGet(Engine.C, "HairFront").Color, 20)
			ChatRoomCharacterUpdate(Engine.C)
			CE("The phallus penetrates your pussy lips pushing deep with the metal pole locking in place. Another set of arms lifts up to tightly squeeze your waist together in a corset before the platform you're standing on starts elevating towards an opening hatch in the ceiling, to put you on display for whoever might enter next")
			if (!InventoryGet(Engine.C, "ItemVulva").Property) InventoryGet(Engine.C, "ItemVulva").Property = { Intensity: -1 }
			if (InventoryGet(Engine.C, "ItemVulva").Property.Intensity < 2) {
				InventoryGet(Engine.C, "ItemVulva").Property.Effect = ["Egged", "Vibrating"]
				InventoryGet(Engine.C, "ItemVulva").Property.Intensity = InventoryGet(Engine.C, "ItemVulva").Property.Intensity + 2
				ServerSend("ChatRoomChat", { Content: "Dildo" + ((1 > 0) ? "Increase" : "Decrease") + "To" + InventoryGet(Engine.C, "ItemVulva").Property.Intensity, Type: "Action", Dictionary: [{ Tag: "DestinationCharacterName", Text: Engine.C.Name, MemberNumber: Engine.C.MemberNumber }] })
				ChatRoomCharacterUpdate(Engine.C)
			}

			S.Reset();
		};

		let acceptFate = new Trigger("accept fate");
		acceptFate.Action = sameAction;
		r.Triggers.push(acceptFate);

		var struggle = new Trigger("struggle");
		struggle.Action = sameAction;
		r.Triggers.push(struggle);

		r.Entry = "Mechanical arms extend from the platform tolock cuffs with a metal beam between them around your ankles." +
			" The arms then stay in place to keep you still as a metal pole with a vibrating phallus at the end starts extending from the platform towards your crotch. You can " + struggle.Print() + " or " + acceptFate.Print();

		S.Levels.push(r);
	}

	return S;
}