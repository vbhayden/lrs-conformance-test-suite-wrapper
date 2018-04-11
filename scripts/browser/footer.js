// Information we're showing on the footer.
//
// This is primarily for the loading / busy indicator
//
var footerElements = {

    // Loading notifications.  We will use JQuery objects here
    // to simplify the visibility changes here
    //
    loadingContainer: window.$("#loadingContainer"),
    loadingIcon:  window.$("#loadingIcon"),
    loadingMessage:  window.$("#loadingMessage"),
}

// Change our loading icon's color
function changeIconColor(speed, color1, color2, color3, color4) {

    // The 4 colors will change the CSS styling
    let c1 = color1;
    let c2 = color2 || "transparent";
    let c3 = color3 || c1;
    let c4 = color4 || c2;
    let s = speed || 2;

    // Then  use these to update our CSS
    footerElements.loadingIcon.css({
        "border-left": "10px solid " + c1.toString(),
        "border-top": "10px solid " + c2.toString(),
        "border-right": "10px solid " + c3.toString(),
        "border-bottom": "10px solid " + c4.toString(),
        "animation": "spin " + s.toString() + "s linear infinite",
    });

    // Then show the container
    footerElements.loadingContainer.show();
    footerElements.loadingIcon.show();
}

// Presets using the above
footerElements.iconShowSuccess = function() {
    changeIconColor(0.5, "white");
}
footerElements.iconShowBusy = function() {
    changeIconColor(3, "white");
}
footerElements.iconShowRejected = function() {
    changeIconColor(5, "yellow");
}
footerElements.changeFooterText = function(text) {
    footerElements.loadingMessage.text(text);
}
footerElements.hideAll = function() {
    footerElements.loadingContainer.hide();
    footerElements.loadingIcon.hide();
}
footerElements.hideAfterDelay = function(delayMS) {
    setTimeout(footerElements.hideAll, delayMS);
}

// Hide these on startup
footerElements.hideAll();

window.footerElements = footerElements;
