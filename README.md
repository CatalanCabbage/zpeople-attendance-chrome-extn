# ZOHO People Attendance Chrome Extension
**Easier Check-in/out in Zoho People.**

 Chromium browser extension to view status and check-in/check-out in [Zoho People](https://www.zoho.com/people/) _from any tab_ in the browser.


### Why?
* At the start of [WFH in Zoho Corporation](https://www.zoho.com/general/blog/how-zoho-went-remote-on-zoho.html), the feature [attendance in Zoho People](https://www.zoho.com/people/attendance-tracker.html) was used to determine if a co-worker was currently available or not
* Checking in/out frequently and contextually was the best practice
* But check-in/out could be made only from the Zoho People website, which made it a hassle every time you stepped away
* Thus, make it easier to use by enabling that functionality from any tab in the browser; eliminate the need to go to that website

### Deployment:
* Download the `src` folder
* Open the Extensions menu in the browser (`chrome://extensions/` for Google Chrome)
* Enable Developer Mode
* Drag and drop the `src` folder or Click on 'Load Unpacked' and choose the `src` folder

### Prerequisite:
The user needs to be logged into _any_ Zoho service on the browser.

### Usage:
* Click once on the extension; a popup appears indicating the current status (checked-in/out)
* Click 'Ok' on the resulting popup to check-in/out

### Internals:
* Makes a `GET` call to `https://people.zoho.com/zpeoplehr/AttendanceAction.zp` with the browser's cookie and extract the CSRF token from response with a regex
* Makes a `POST` call to `https://people.zoho.com/zpeoplehr/AttendanceAction.zp` with the CSRF token and parameter:
    * `mode=getStatus` to get the current status
    * `mode=punchIn` to check-in
    * `mode=punchOut` to check-out
