/**
 * If specific Cookies need to be extracted
 */
function getCookie(inputUrl, inputName) {
    chrome.cookies.get({ url: inputUrl, name: inputName },
    function (cookie) {
        if (cookie) {
            //alert(cookie.name + cookie.value);
            return cookie.value;
        }
        else {
            alert('Cookie not found');
        }
    });
}

let conreqcsr;

/**
 * The CSRF param is required by the check-in/check-out URL
 * Makes a call to a general page and extracts the CSRF token from the response
 */
function getCsrfParam() {
    fetch('https://people.zoho.com/zpeoplehr/zp', {
        method: "GET",
        credentials: 'include'
      })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
            response.text()
                .then(data => {
                    //Get the csrf token from HTML response
                    let result = (data.match(/csrfToken\s=\s\'([^;]*)\'/));
                    conreqcsr = result[1];
                    if(conreqcsr == null) {
                        alert("Please log into any Zoho service!");
                        throw "conreqcsr = null";
                    }
                })
        } else {
          throw error;
        }
      })
      .catch(error => { console.log('request failed', error); });
}

/**
 * Gets the current status(checked-in or out?) and decides action based on the status
 */
function punchAction() {
    fetch('https://people.zoho.com/zpeoplehr/AttendanceAction.zp', {
        method: "POST",
        body: "mode=getStatus&conreqcsr=" + conreqcsr,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
            response.json()
                .then(data => {
                    isCheckedOut = data.allowedToCheckIn;
                    let performAction, actionToBePerformed;
                    if(isCheckedOut === true) {
                        performAction = confirm("You're currently Checked Out.\nDo you want to Check-in?");
                        actionToBePerformed = "punchIn"; 
                    } else if(isCheckedOut === false){
                        performAction = confirm("You're currently Checked In.\nDo you want to Check-out?");
                        actionToBePerformed = "punchOut";
                    } else {
                        alert("Error; isCheckedOut =" + isCheckedOut);
                        throw "error in isCheckedOut value";
                    }
                    if(performAction === true) {
                        performPunchAction(actionToBePerformed);
                    }
                })
        } else {
          response.text()
                .then(data => {
                    alert("error, status data : " + data);
                })
          throw error;
        }
      })
      .catch(error => { console.log('request failed', error); });
}

/**
 * Checks and performs the check-in/out action based on the input param
 */
function performPunchAction(actionToBePerformed) {
    fetch('https://people.zoho.com/zpeoplehr/AttendanceAction.zp', {
        method: "POST",
        body: "mode=" + actionToBePerformed + "&conreqcsr=" + conreqcsr,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
            response.json()
                .then(data => {
                    //Check if action was successfully performed
                    if(actionToBePerformed == "punchIn") {
                        if(data.msg.punchIn != null || data.msg.error == "alreadyIn") {
                            alert("Successfully checked in!");
                        } else {
                            alert("Could not Check in :(");
                        }
                    } else if(actionToBePerformed == "punchOut") {
                        if(data.punchOut.tsecs != null || data.punchOut.error == "alreadyOut") {
                            alert("Successfully checked out!");
                        } else {
                            alert("Could not Check out :(");
                        }
                    }
                })
        } else {
          response.text()
                .then(data => {
                    alert("error, status data : " + data);
                })
          throw error;
        }
      })
      .catch(error => { alert("error : " + error); });
}

/**
 * Gets Cookies for authentication in future requests
 */
chrome.browserAction.onClicked.addListener(function(tab) {    
    chrome.cookies.getAll({ url: tab.url },
    function (cookie) {
        if (cookie) {
            getCsrfParam(cookie);
            punchAction();
        }
        else {
            alert('Cookie not found');
        }
    });
});


