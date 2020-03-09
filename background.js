/**
 * Get required IAM cookies from any zoho page: _iamadt, _iambdt
 */
let iamadt, iambdt, conreqcsr;
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
function getRequiredCookies(tab){
    iamadt = getCookie(tab.url, '_iamadt');
    iambdt = getCookie(tab.url, '_iambdt');
}


function getCsrfParam() {
    fetch('https://people.zoho.com/zpeoplehr/zp', {
        method: "GET",
        headers: {
        },
        credentials: 'include'
      })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
            response.text()
                .then(data => {
                    //alert(data);
                    let result = (data.match(/csrfToken\s=\s\'([^;]*)\'/));
                    conreqcsr = result[1];
                    if(conreqcsr == null) {
                        alert("Please log into any Zoho service!");
                        throw "conreqcsr = null";
                    }
                    punchAction();
                })
        } else {
          throw error;
        }
      })
      .catch(error => { console.log('request failed', error); });
}

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


chrome.browserAction.onClicked.addListener(function(tab) {    
    chrome.cookies.getAll({ url: tab.url },
    function (cookie) {
        if (cookie) {
            getCsrfParam(cookie);
        }
        else {
            alert('Cookie not found');
        }
    });
});


