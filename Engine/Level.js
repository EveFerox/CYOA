// @ts-check

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
