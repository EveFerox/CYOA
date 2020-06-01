// @ts-check

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
    OnStart = () => {};

    /**Called when story is being reset [Optional]
     * @type {function} */
    OnReset = () => {};

    /**Called when character enters ChatRoom [Optional]
     * @type {function}
     * @param {object} char
     */
    OnCharEnter = char => {};

    /**Called when character leaves ChatRoom [Optional]
     * @type {function}
     * @param {object} char
     */
    OnCharExit = char => {};

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
