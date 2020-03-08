/**
 * Zoho IAM cookie params are required for request to Zoho People
 * IAM cookie is present only on logged in *.zoho.com pages
 * Therefore, disable the extension on pages without "zoho" in the URL
 * Not handling edge cases.
 */
// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      // With a new rule ...
      chrome.declarativeContent.onPageChanged.addRules([
        {
          // That fires when a page's URL contains 'zoho' ...
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { urlContains: 'zoho' },
            })
          ],
          // And shows the extension's page action(the logo).
          actions: [new chrome.declarativeContent.ShowPageAction()]
        }
      ]);
    });
  });

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
                        performAction = confirm("Currently Checked Out.\nDo you want to Check-in?");
                        actionToBePerformed = "punchIn"; 
                    } else if(isCheckedOut === false){
                        performAction = confirm("Currently Checked In.\nDo you want to Check-out?");
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
                            alert("Check-in successful");
                        } else {
                            alert("Could not Check in :(");
                        }
                    } else if(actionToBePerformed == "punchOut") {
                        if(data.punchOut.tsecs != null || data.punchOut.error == "alreadyOut") {
                            alert("Check-out successful");
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


chrome.pageAction.onClicked.addListener(function(tab) {
    //Change icon on click
    chrome.pageAction.setIcon({tabId: tab.id, path: '/icon2-16.png'});
    //getRequiredCookies(tab);
    
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


