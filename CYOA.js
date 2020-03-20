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

		CurrentRoom = found;

		CurrentRoom.Prepare(CurrentRoom);

		if (printRoomDesc)
			CE(CurrentRoom.Describe());

		console.log("[INFO] GotoRoom: " + CurrentRoom.Name);
	}

	var C = Player;
	var rightButton = Math.round(Math.random() * 20).toString(); //new variable stores the 'right button's number'
	var j = "" // new variable that stores numbers in emotes separately, used for 'press the right button'

	class Trigger {
		/**@type {string} */
		Text = "TRIGGER TEXT";

		/**@type {function} */
		Action = () => { };

		/**
		 * @param {string} Text
		 */
		constructor(Text) {
			this.Text = Text;
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

		let checkLocker = new Trigger("locker");
		checkLocker.Action = () => GotoRoom("Locker");
		r.Triggers.push(checkLocker);

		{
			let t = new Trigger("window");
			t.Action = function () {
				CE("You find a window, and it slides open at first try. Apparently someone was a bit careless with the security");
			};

			r.Triggers.push(t);
		}

		r.Entry = "The dim lights of closed and covered windows lights the room as you return your attention to the main hall. " +
			"You can check the " + checkLocker.Print() + " again or " + goDown.Print() + " to the basement";

		S.Levels.push(r);
	}

	{
		let r = new Level("Locker");

		//Triggers
		let tryCuffs = new Trigger("cuffs");
		tryCuffs.Action = function () {
			if (C.ItemPermission > 2){
			CA("You need to adjust your item permissions to perform this action") 
			} else {
			InventoryWear(C, "LeatherCuffs", "ItemArms", "Default", 20);
			ChatRoomCharacterUpdate(C);
			CE("The cuffs slide on nicely. There doesn't seem to be anything unusual about them");

			Flags.IsTookCuffs = true;
		}
		};

		let tryGag = new Trigger("gag");
		tryGag.Action = function () {
			if (C.ItemPermission > 2){
			CA("You need to adjust your item permissions to perform this action") 
			} else {
			InventoryWear(C, "BallGag", "ItemMouth");
			InventoryLock(C, InventoryGet(C, "ItemMouth"), "MistressPadlock", 2313);
			ChatRoomCharacterUpdate(C)
			CE("The gag fits snugly between your lips to keep them appart. And a light mechanical sound and a 'click' sounds as the straps pull a bit together and a mechanism on the buckle locks it tightly in place");

			Flags.IsTookGag = true;
		}
		};

		let goBack = new Trigger("back");
		goBack.Action = () => GotoRoom("Entrance");

		r.Prepare = level => { 
			var d = "The locker contains";

			level.Triggers = [];

			var isContainsAny = false;

			if (!Flags.IsTookCuffs) {
				d += " a set of leather cuffs";
				if (Flags.IsTookGag) d+= " You could try them on. (try on the cuffs)"
				isContainsAny = true;
				level.Triggers.push(tryCuffs);
			}

			if (!S.Flags.IsTookGag) {
				if (isContainsAny)
					d += " and";
				d += " a ball gag."
				if (!Flags.IsTookCuffs) { d+= " You could try them on. (try on the cuffs) or (try on the gag)"}
				else { d+= " You could try it on. (try on the gag)"}
				isContainsAny = true;
				level.Triggers.push(tryGag);
			}

			if (isContainsAny == false) {
				d = "The locker is empty";
			}

			level.Triggers.push(goBack);

			level.Entry = d + ". You could of course also go back (go back)";
		};

		S.Levels.push(r);
	}

	{
		let r = new Level("Basement");

		//Triggers
		let acceptFate = new Trigger("door");
		{
			acceptFate.Action = () => CE("The door is simply too solid, and any attempt at prying it open seems meaningless");
		}
		let lens = new Trigger("lens");
		{
			lens.Action = function () {
				if (InventoryGet(C, "ItemArms") && InventoryGet(C, "ItemMouth")){
				if (InventoryGet(C, "ItemArms").Asset.Name == "LeatherCuffs") {
					if (InventoryGet(C, "ItemArms").Property) {
						if (CharacterIsNaked(C) && InventoryGet(C, "ItemArms").Property.Restrain == "Both" && InventoryGet(C, "ItemMouth").Asset.Name == "BallGag") {

							var r = S.GetRoom("Basement");

							S.Flags.DoorOpen = true;

							CE("The door opens");

							r.Entry = "With the door open you can now either (go through the door) or (go back) upstairs";

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
				}
				else {
					CE("The sensor moves a bit, but nothing seems to happen")
				}
				for(var i=0; i<ChatRoomCharacter.length; i++){
				var X = ChatRoomCharacter[i]
				if (InventoryGet(X, "ItemVulva")){
				if (InventoryGet(X, "ItemVulva").Asset.Name == "VibratingDildo"){
					if(!InventoryGet(X, "ItemVulva").Property) InventoryGet(X, "ItemVulva").Property = { Intensity: -1 }
					if(InventoryGet(X, "ItemVulva").Property.Intensity < 3){
					InventoryGet(X, "ItemVulva").Property.Effect = ["Egged", "Vibrating"]
					InventoryGet(X, "ItemVulva").Property.Intensity = InventoryGet(X, "ItemVulva").Property.Intensity + 1
					ServerSend("ChatRoomChat", { Content: "Dildo" + ((1 > 0) ? "Increase" : "Decrease") + "To" + InventoryGet(X, "ItemVulva").Property.Intensity, Type: "Action", Dictionary: [{Tag: "DestinationCharacterName", Text: X.Name, MemberNumber: X.MemberNumber}]} )
					CharacterLoadEffect(X)
					ChatRoomCharacterUpdate(X)
				} else {
					InventoryGet(X, "ItemVulva").Property.Effect = ["Egged", "Vibrating"]
					InventoryGet(X, "ItemVulva").Property.Intensity = InventoryGet(X, "ItemVulva").Property.Intensity - 1
					ServerSend("ChatRoomChat", { Content: "Dildo" + ((-1 > 0) ? "Increase" : "Decrease") + "To" + InventoryGet(X, "ItemVulva").Property.Intensity, Type: "Action", Dictionary: [{Tag: "DestinationCharacterName", Text: X.Name, MemberNumber: X.MemberNumber}]} )
					CharacterLoadEffect(X)
					ChatRoomCharacterUpdate(X)
				}
			}
		}
		}
			};
		}
		let goThroughDoor = new Trigger("go through")
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
			var d = "At the end of the basement stairs is a large metal door with the picture of a naked girl with her arms cuffed at her wrist and elbows behind her back, and a ballgag strapped tight between her lips. " +
			"Next to the door is some kind of lens. You could try to get the " + acceptFate.Print() + " open, " + goBack.Print() + " upstairs, or stand in front of the (lens)";

			level.Triggers = [];

			if (!S.Flags.DoorOpen) {
				r.Triggers.push(lens);
				r.Triggers.push(acceptFate);
			} else{
				d = "With the door open you can now either" + goThroughDoor.Print() + " the door, or " + goBack.Print() + " upstairs";
				isContainsAny = true;
				level.Triggers.push(goThroughDoor);

			}
			level.Triggers.push(goBack);

			level.Entry = d;
		};


		Room.push(r);
	}

	{
		let r = new Level("Hook");

		//Triggers
		let hookCloth = new Trigger("cloth");
		{
			hookCloth.Action = function () {
				CE("The hook seems like it almost was made for this, and it even moves a bit to swiftly tear up your clothes, then retracts back into the wall. Standing in front of it might extend it once more (lens)");
				CharacterNaked(C);
				ChatRoomCharacterUpdate(C);
				GotoRoom("Basement", false);
			};
			r.Triggers.push(hookCloth);
		}
		let struggle = new Trigger("gag");
		{
			struggle.Action = function () {
				CE("The hook retracts back into the wall at any attempt at moving the gag close to it. Maybe standing in front of the (lens) again will extend it again?");
				GotoRoom("Basement", false);
			};
			r.Triggers.push(struggle);
		}
		let hookCuff = new Trigger("cuff");
		{
			hookCuff.Action = function () {
				DialogFocusItem = InventoryGet(C, "ItemArms");
				if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Restrain: null };
				if (InventoryGet(C, "ItemArms").Property.Restrain != "Both") {
					var NewPose = "Both"
				if (InventoryGet(Engine.C, "ItemArms").Property) {
					var NewPose = "Both"
					DialogFocusItem = InventoryGet(Engine.C, "ItemArms");
					CharacterRefresh(C);
					ChatRoomCharacterUpdate(C)
					CE("The hook moves and swiftly makes sure your cuffs are connected both at Wrists and Elbows. Maybe it will trigger again if you move something else close to it as well")
				} else {
					CE("The cuffs slide onto the hook, but they're simply too sturdy to go anywhere. Maybe something else can trigger it (hook gag), (hook cuffs), (hook clothes)")
				}
			};
			r.Triggers.push(hookCuff);
		}

		r.Entry = "The sensor moves a bit, before a panel opens and a hook extends from the wall. Maybe somthing can be hooked onto it (hook gag), (hook cuffs) or (hook clothes)";

		S.Levels.push(r);
	}

	{
		let r = new Level("Room2");

		//Triggers
		let acceptFate = new Trigger("door");
		{
			acceptFate.Action = () => CE("The door seems to have locked behind you leaving no way back at the current moment.");
			r.Triggers.push(acceptFate);
		}
		let struggle = new Trigger("platform");
		{
			struggle.Action = function () {
				InventoryWear(C, "SpreaderMetal", "ItemFeet", "Default", 20);
				InventoryWear(C, "Corset5", "ItemTorso",  InventoryGet(C, "HairFront").Color, 20)
				ChatRoomCharacterUpdate(C);
				GotoRoom("Stuck");
			};
			r.Triggers.push(struggle);
		}

		r.Entry = "The door closes behind you" + acceptFate.Print() + " as you enter a round room, with a slightly elevated platform in the middle (stand on the platform)";

		S.Levels.push(r);
	}

	{
		let r = new Level("Stuck");

		//Triggers
		let sameAction = () => {
			InventoryWear(C, "VibratingDildo", "ItemVulva")
			InventoryWear(C, "OneBarPrison", "ItemDevices", "Default", 20)
			ChatRoomCharacterUpdate(C)

			setTimeout(setVibe, 500);

			GotoRoom("Stuck2");
		};

		let acceptFate = new Trigger("relax");
		acceptFate.Action = sameAction;
		r.Triggers.push(acceptFate);

		var struggle = new Trigger("struggle");
		struggle.Action = sameAction;
		r.Triggers.push(struggle);

		r.Entry = "A light mechanical clatter fills the room, and small metal panels open on the platform, extending mechanical arms to grab and lock a set of cuffs with a spreader between your ankles." +
			" More mechanical arms extend to snare a corset around your waist so it squeezes you tightly. The arms then lock in place to keep you still, while a pole extends towards your crotch from below, with a vibrating dildo at the end. You can " + struggle.Print() + " or try to " + acceptFate.Print() + "and accept your fate";

		Room.push(r);
	}
		//several stages of stuck
	{
		let r = new Level("Stuck2");

		let sameAction = () => {
			
			InventoryRemove(C, "ItemDevices")
			InventoryWear(C,"PolishedChastityBelt", "ItemPelvis")
			ChatRoomCharacterUpdate(C)
			setTimeout(setVibe, 500);

			GotoRoom("Stuck3");
		};

		let acceptFate = new Trigger("relax");
		acceptFate.Action = sameAction;
		r.Triggers.push(acceptFate);

		var struggle = new Trigger("struggle");
		struggle.Action = sameAction;
		r.Triggers.push(struggle);

		r.Entry = "The pole pushes the vibrating dildo deep between your pussy lips. The mechanical arms keeps firmly locked around your waist while another set extends to lock a chastity belt over the dildo. You can still (struggle) or (relax)"

		Room.push(r);
	}

	{
		let r = new Level("Stuck3");

		let sameAction = () => {
			
			InventoryWear(C, "Stockings1", "Socks")
			InventoryWear(C, "HarnessPanelGag", "ItemMouth2", "Default", 20)
			InventoryRemove(C, "ItemFeet")
			ChatRoomCharacterUpdate(C)
			CE("the ankle cuffs loosen and is pulled down under the floor. With the vibrator buzzing, a female voice can be heard speaking through the room.")
			setTimeout(Welcome, 3000);
			setTimeout(NowYouAreStuck, 6000);
			setTimeout(AWayOut, 10000);
			setTimeout(goToKeyRoom, 14000)
		};

		let acceptFate = new Trigger("relax");
		acceptFate.Action = sameAction;
		r.Triggers.push(acceptFate);

		var struggle = new Trigger("struggle");
		struggle.Action = sameAction;
		r.Triggers.push(struggle);

		r.Entry = "The pole retracts, and the belt is secured tightly. With the belt securely in place, the ankle cuffs expand a little to allow a bit of fabric to be pulled up over your feet and underneathe the cuffs. the cuffs then move up along your legs while expanding to roll a pair of soft stockings onto your thighs. Another pair of arms extends, one to grab your hair, the other to secure a panel over that ball gag. (relax) or (struggle)"

		Room.push(r);
	}
		//press the right button game:
	{
		let r = new Level("KeyRoom");

		let sameAction = () => {
			GotoRoom("Doomed")
		}

		let foot = new Trigger("foot");
		{
		foot.Action = function () {
			CE('As you bring your foot close to the button it retracts into the floor, and the voice echoes through the room. "Sorry, but that is cheating. you will have to kneel down to press it"')
		}
		}
		let button = new Trigger("press button")
		{
		button.Action = function (){
			if (C.ActivePose == null){
				CE ("The button can't be reached while standing")
			} else {
				if (Flags.atButton){
					if (Flags.atButton != j) {
						CE("That button is too far away, you can stand up to walk there, or (crawl to button <number>) to remain on your knees")
					} else if (j == rightButton) {
						CE("As you press the button you hear a light 'click' and the door opens behind you leaving the exit free")
						UnlockRoom()
						GotoRoom("EscapeChance")
					}
					else{
						CE("The button doesn't do anything, it simply sets the intensity of your vibrator")
						setVibe()
						Flags.atButton = j
					}
				} else if (j == rightButton) {
						CE("As you press the button you hear a light 'click' and the door opens behind you leaving the exit free")
						UnlockRoom()
						GotoRoom("EscapeChance")
				} else {
					CE("The button doesn't do anything, it simply sets the intensity of your vibrator")
					setVibe()
					Flags.atButton = j
				} 
			} 	
		}
		}
		let standsUp = new Trigger("standup")
		{
			standsUp.Action = function (){
				Flags.atButton = null
				CE("The chastity belt sends a sharp, electric jolt through your body as you stand up")
				CE("Standing up makes it easy to move around. you simply need to kneel down again, to press the button you want (press button <n>")
			}
		}
		let OrgasmResist = new Trigger("orgasmresist")
		{
			OrgasmResist.Action = function(){
				CE ("")
			}
		}

		let Orgasm = new Trigger("orgasm")
		Orgasm.Action = sameAction

		var Cums = new Trigger("cums");
		Cums.Action = sameAction;

		var isCumming = new Trigger("is cumming")
		isCumming.Action = sameAction;


		r.Prepare = level => { 
			var d 
			var availbuttons
			level.Triggers = [];
			r.Triggers.push(foot);
			var crawlToButton = new Trigger("crawl to button")
			// this action should probably be above. logic was planned otherwise at some point. it works as it should currently though
			crawlToButton.Action = function (){
					Flags.atButton = j
					CE("Now at the button " + j +", you can press it(press button "+ j + "), or crawl to a different button (crawl to button <n>)")
			}
		
			r.Triggers.push(crawlToButton);
			r.Triggers.push(standsUp)
			r.Triggers.push(button);
			r.Triggers.push(OrgasmResist)
			r.Triggers.push(Orgasm);
			r.Triggers.push(Cums);
			r.Triggers.push(isCumming);
			

			if (!Flags.EntryRead) {
				d = "Several small panels open on the floor, accross the room and tiny stands, with numbered buttons between 0 and 20, extend. The buttons are all the way down on the floor, so either you can try pressing one with your foot(press button <number> with foot), or you will have to kneel to reach them (press button <number>) (without <>)";
				Flags.EntryRead = true;
			} else{
				d = "now at button "+ j +"you can try to press it (press button " + j + ") or crawl to another button (crawl to button <n>)"
			}

			level.Entry = d;
		};
		Room.push(r);
	}

	{
		let r = new Level("EscapeChance")

		let esc = new Trigger("escape");
		{
			esc.Action = function () {
				ChatRoomAdminChatAction("Kick", "/Kick " + C.MemberNumber.toString())
				Reset()
			}
			r.Triggers.push(esc)
		}
		let stay = new Trigger("stay")
		{
			stay.Action = function () {
				CE("After a short while the doors close again")
				GotoRoom("Doomed")
			}
			r.Triggers.push(stay)
		}
		r.Entry = "With all the doors open. you can choose either to surrender your freedom to your captor and (stay) behind to see who else might stumble into the warehouse, or you can (escape) through the open doors to get help with your predicament. (Warning: escaping will kick you out of the room so it can be updated for new players)"

		Room.push(r);
	}

	{
		let r = new Level("Doomed")

		let enter = new Trigger("enter the opening")
		{
			enter.Action = function () {
				var d = "The opening closes behind you, and mechanical arms grabs you to keep you in place while the floor starts moving upwards."
				if (!InventoryGet(C, "ItemNeck")){
					InventoryWear(C, "LeatherChoker", "ItemNeck", "Default", 60)
					ChatRoomCharacterUpdate(C)
					d = d + " A leather collar is secured snugly around your neck so it hugs your skin all the way around, and"
				}
				InventoryWear(C, "CollarNameTag", "ItemNeckAccessories", "#ffffff")
				DialogFocusItem = InventoryGet(C, "ItemNeckAccessories");
				if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Type: null };
				DialogFocusItem.Property.Type = "Slave";
				DialogFocusItem.Property.Effect = [];
	
				CharacterRefresh(C);
				ChatRoomCharacterUpdate(C);
				d = d + " A tag with the word 'slave' on it is attached to your collar."
				CE(d)
				setTimeout(arrival, 9000)
			}
			r.Triggers.push(enter)
		}

		r.Entry = 'The buttons retract down into the floor and a hidden panel on the wall at the side of the room opens up. The voice from earlier resounds across the room. "seems you are mine then". The opening can be entered (enter the opening) beyond that the room is just empty.'

		Room.push(r)
	}


	/**@type {Level} */
	var CurrentRoom = Room[0];

	function FollowUp(a) {
		CE("- The warehouse is fairly big, but mostly empty. There's a locker you can check out on the wall to the right(check the locker), or you can head down the stairs to the left, into the basement(go down)")
	}
	function Explanation(r) {
		CA("Type an emote containing (locker) or (go down) into chat, to get started.")
	}
	function Explanation2() {
		CA("I might answer questions, but I won't intervene too much, since I'd like to see if you find your way through on your own")
	}
	function Welcome() {
		CE('"Congratulations, ' + C.Name + ', on finding your way in here. It has been a pleassure watching you get yourself into this position"')
	}

	function NowYouAreStuck () {
		CE('"You are now my captive"')
	}

	function AWayOut() {
		CE('"I will offer you a way out though. If you can find the button that opens the door without cumming, I will let you go. Otherwise you will be kept here as my toy and pet. Or possibly sold away as a slave"')
	}

	function goToKeyRoom() {
		GotoRoom("KeyRoom");
	}
	function arrival() {
		CE ("Finally you arrive at the control room to meet your captor, and you can see the redheaded woman watching you with a calm smile. The room has a good overlook to the warehouse, and several screens to keep track of anyone that might enter")
		Reset()
	}


	function Reset() {
		var UpdatedRoom = {
			Name: ChatRoomData.Name,
			Description: ChatRoomData.Description,
			Background: "AbandonedBuilding",
			Limit: (ChatRoomCharacter.length + 1).toString(),
			Admin: ChatRoomData.Admin,
			Ban: ChatRoomData.Ban,
			Private: false,
			Locked: false
		}
		ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Room: UpdatedRoom, Action: "Update" });
		ChatAdminMessage = "UpdatingRoom";
		Flags = {};
		console.log("CYOA Resetting")
	}

	function UnlockRoom() {
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

	function CharacterStillInRoom() {
		var resetcheck = 0
		for (var i=0;i<ChatRoomCharacter.length;i++){
			if (C.MemberNumber == ChatRoomCharacter[i].MemberNumber)
			resetcheck = 1 
		}
		if (resetcheck != 1)
			Reset()
		resetcheck = 0
	}

	function setVibe() {
		if (!InventoryGet(C, "ItemVulva").Property) InventoryGet(C, "ItemVulva").Property = { Intensity: -1 }
		if (InventoryGet(C, "ItemVulva").Property.Intensity < 3) {
				InventoryGet(C, "ItemVulva").Property.Effect = ["Egged", "Vibrating"]
				InventoryGet(C, "ItemVulva").Property.Intensity = InventoryGet(C, "ItemVulva").Property.Intensity + 1
				ServerSend("ChatRoomChat", { Content: "Dildo" + ((1 > 0) ? "Increase" : "Decrease") + "To" + InventoryGet(C, "ItemVulva").Property.Intensity, Type: "Action", Dictionary: [{ Tag: "DestinationCharacterName", Text: C.Name, MemberNumber: C.MemberNumber }] })
				CharacterLoadEffect(C)
				ChatRoomCharacterUpdate(C)
			} else {
				InventoryGet(C, "ItemVulva").Property.Effect = ["Egged", "Vibrating"]
				InventoryGet(C, "ItemVulva").Property.Intensity = InventoryGet(C, "ItemVulva").Property.Intensity - 1
				ServerSend("ChatRoomChat", { Content: "Dildo" + ((-1 > 0) ? "Increase" : "Decrease") + "To" + InventoryGet(C, "ItemVulva").Property.Intensity, Type: "Action", Dictionary: [{ Tag: "DestinationCharacterName", Text: C.Name, MemberNumber: C.MemberNumber }] })
				CharacterLoadEffect(C)
				ChatRoomCharacterUpdate(C)
			}
	}

	function Process(data) {
		var sender = CharFromID(data.Sender);
		var msg = String(data.Content).toLowerCase();
		const regge = /[0-9]/g;
		if (msg.match(regge)){
			j = msg.match(regge).join('')
		}

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
			rightButton = Math.round(Math.random() * 20).toString();
			GotoRoom("Entrance", false);

			CE("As you enter, the door slams shut behind you with the light, mechanical click of a closing lock. Before you is the wide interior of what appears to be an abbandoned warehouse");
			setTimeout(FollowUp, 3000);
			setTimeout(Explanation, 7000);
			setTimeout(Explanation2, 15000);
			return;
		}
			// Reset room if current player disconnects
		if ((data.Type == "Action") && (msg.startsWith("serverdisconnect")) || (msg.startsWith("serverLeave"))) setTimeout(CharacterStillInRoom, 3000);

		//Current player types in chat
		if (sender == C) {
			//Iterate room triggers for a match
			var triggers = CurrentRoom.GetTriggers();
			for (var i = 0; i < triggers.length; i++) {
				var trigger = triggers[i];
				var patt = new RegExp(trigger.Text);
				if (patt.test(msg)) {
					console.log("[INFO] Trigger hit: " + trigger.Text);
					trigger.Action();
					return;
				}
			}

			//Print room entry
			var regex = /(look|help)/mg;
			if (regex.test(msg))
				GotoRoom(CurrentRoom.Name);
		}
	}

	return S;
}