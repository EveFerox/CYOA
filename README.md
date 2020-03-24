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
- Fix the button flags. Crawling to a button does not seem to update the flag correctly
- Fix reset when current player leaves
- Utils - room admin actions
- Utils - vibes settings
- Utils proper permission check
- Create story auto test tool

## Questions
- Q: Is the first letter of flags uppercase or lowercase now? saw both occuring.
    - A: theres class Flags inside the story creation function and S.Flags inside the story class itself.
        flags is a local variable to be used in the story,
        its a trick to have better view of all the flags and allows adding comments to them with /**...*/
