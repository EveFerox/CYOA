# CYOA
Choose your own adventure for Bondage Club

### How to setup in vscode and localhost
- TODO

### How to setup as chrome extention
1. Navigate to chrome://extensions/
2. Enable Developer mode
3. Click 'Load unpacked' button and browse to this folder
4. Host room and click on the extensions button to start

## TODO
- Fix reset when current player leaves
- Utils - room admin actions
- Utils - vibes settings
- Utils proper permission check
- Create story auto test tool
- Code clean up - put extension and other parts of code in folders 

## Errors  
- When triggering the check to see if current player is still in the room: this.Reset is not a function

## Notes
- Please try to generally leave a version that can be left to run on it's own to test on other players, without having to manually reset the script.
- I removed the check for message type again, to get the standup trigger to work.

## Questions
- Q: When I start the script it now puts me in the button room for some reason. Any idea why it starts me in that room?
    - A: S.EntryLevel = r; in KeyRoom means it will start first, i set it to debug it quickly
- Q: Is the first letter of flags uppercase or lowercase now? saw both occuring.
    - A: theres class Flags inside the story creation function and S.Flags inside the story class itself.
        flags is a local variable to be used in the story,
        its a trick to have better view of all the flags and allows adding comments to them with /**...*/
