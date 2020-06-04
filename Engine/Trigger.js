// @ts-check

class Trigger {
    /**Possible Trigger Types 
     * @enum {string}
    */
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
    };

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
