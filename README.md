# dialler
UI for dialing and storing numbers
Build instructions:
-------------------
*Unpack the enclosed zip and navigate to the folder where the "bower.json" file exists and type on the command line "bower install"
*Locate the server in your web browser Chrome, Firefox and IE11 have been tested with this application
Build notes: Bootstrap's Customize components facility was used and the customized bootstrap files were located within the zip file.

I have temporarily placed the work at:
-------------------------------------- 
http://chasbeen.frih.net/8X8/

Assumptions:
------------
*The 'Dial' button remains disabled until the user inputs 11 valid numbers (Validation).
*Refreshing the browser does not mean the data is lost (Persisting data)
*Include maximum "on call" timer that is initially set to 10 seconds (Upgradable).
*A call count is below the keypad.
*A report with "The 3 most called numbers" appears below the keypad "call count report" after the first call.
