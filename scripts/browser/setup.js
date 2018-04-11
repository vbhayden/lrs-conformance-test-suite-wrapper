// JS controlling the setup.html page logic.
//
// This is just a simple login screen for their LRS, so we'll just be Checking
// to make sure that their basic auth credentials work on the given LRS.
//
// To facilitate the LearningLocker style, we'll also provide an option to
// enter the entire basic auth key down the road.
//
var loginElements = {

    // Elements we're using
    inputEndpoint: document.getElementById("inputEndpoint"),
    inputUsername: document.getElementById("inputUsername"),
    inputPassword: document.getElementById("inputPassword"),
    buttonLogin: document.getElementById("buttonLogin"),
}

// Check the inputs we received
function submitAuth() {

    // Make sure we actually have values
    let endp = loginElements.inputEndpoint.value;
    let user = loginElements.inputUsername.value;
    let pass = loginElements.inputPassword.value;

    // These can be empty or undefined
    if (endp === undefined || endp === "") {
        alert(  "You must enter an endpoint for your LRS. \n\n" +
                "This will usually have the form \"https://my.lrs.com/xapi\"");
        return;
    }
    if (user === undefined || user === "") {
        alert("You must enter a username for this LRS.");
        return;
    }
    if (pass === undefined || pass === "") {
        alert("You must this user's LRS password.");
        return;
    }

    // If we're still here, then those must have been acceptable Credentials
    // As a result, we're going to submit this information to our server.
    let auth = "Basic " + btoa(user + ":" + pass);

    // We'll make an ajax request with jquery to simplify this process
    window.$.ajax({
        url: endp + "/statements?format=exact&limit=1",
        type: "GET",
        contentType: "application/json",

        // If this was ok, we can go ahead to test selection
        success: function(data, status, xhr) {

            // Update our text
            window.footerElements.changeFooterText("LRS Authenticated!");
            window.footerElements.iconShowSuccess();

            // Keep our authentication for later
            window.auth.authUser = user;
            window.auth.authPass = pass;
            window.auth.endpoint = endp;

            // Move to test selection once all of this is fine
            setTimeout(function() {
                window.footerElements.loadingContainer.hide();
                window.carousel.showTestSelection();
            }, 500);
        },

        // If something went wrong, make sure their information was correct
        error: function(xhr, status, error) {

            // Update our text
            window.footerElements.loadingMessage.text("Could not authenticate LRS credentials.");
            window.footerElements.iconShowRejected();

            // Move to test selection once all of this is fine
            setTimeout(function() {
                window.footerElements.loadingContainer.hide();
            }, 1000);
        },

        // We need to set the headers here
        beforeSend: function(xhr){
            xhr.setRequestHeader("Authorization", auth);
            xhr.setRequestHeader("X-Experience-API-Version", "1.0.3");
        },
     });

     // Show the loading container
     window.footerElements.iconShowBusy();
     window.footerElements.loadingContainer.show();
     window.footerElements.loadingMessage.text("Checking LRS credentials ...")
}

// Assign this to the login button
loginElements.buttonLogin.onclick = submitAuth;

// Focus the endpoint box
loginElements.inputEndpoint.focus();

window.loginElements = loginElements;
