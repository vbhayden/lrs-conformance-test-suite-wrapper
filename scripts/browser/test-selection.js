// JS controlling the test-selection.html page logic.
//
// While we're showing options to run specific test subsets, these options
// do not actually exist explicitly within the conformance suite.  Instead,
// we need to run with the -g --grep argument and do that slimming  manually.
//
var testElements = {

    // Toggle checkboxes for the various test selections.  We'll use "check" for
    // the naming convention as the values here are kept within Checkbox inputs.
    //
    btnRunAll: window.$("#btnRunAll"),
    btnRunConfiguration: window.$("#btnRunConfiguration"),

    checkData: window.$("#checkData"),
    checkCommunication:  window.$("#checkCommunication"),
    checkFormat:  window.$("#checkFormat"),
    checkRegex:  window.$("#checkRegex"),

    inputRegex: window.$("#inputRegex"),
}

var checkConfiguration  = function(regex) {

    // Show the loading icon when we start
    window.footerElements.iconShowBusy();
    window.footerElements.changeFooterText("Configuring tests ... ");

    // Assign that regex to our auth object
    window.auth.regex = regex;

    // We'll do an ajax call here and resolve it with promises
    //
    fetch("/config", {
        method: "POST",
        body: JSON.stringify(window.auth),
        headers: {
            Accept: 'application/json',
        },
    })
    .then( response => {
        return response.json();
    })
    .then( data => {

        // Update footer
        window.footerElements.iconShowSuccess();
        window.footerElements.changeFooterText(data.message);

        // We don't need to pass anything as the server will  start our
        // tests once the /start is posted
        return fetch("/start", {
            method: "POST",
            headers: {
                Accept: "application/json",
            }
        });
    })
    .then(response => {
        return response.json();
    })
    .then(data => {

        // Update our footer message
        window.footerElements.iconShowSuccess();
        window.footerElements.changeFooterText(data.message)

        // Move to the results page and start the tests
        window.carousel.showProgress();

        // And start the progress monitor
        window.progressElements.startStatusMonitor();
    })
    .catch(function(reason) {
        window.footerElements.iconShowRejected();
        window.footerElements.changeFooterText(reason.toString());
        return;
    });
}

// Button for running all available tests
testElements.btnRunConfiguration.click(function(e) {

    // We'll join a list of whatever they entered
    function checked(jqueryElement) {
        return jqueryElement.prop("checked") === true;
    }

    // If we're running everything, then the 3 sections will all be used
    let selections = []

    if (checked(testElements.checkData) === true) {
        selections.push("(Data)");
    }
    if (checked(testElements.checkCommunication) === true) {
        selections.push("(Communication)");
    }
    if (checked(testElements.checkFormat) === true) {
        selections.push("(Format)");
    }
    if (checked(testElements.checkRegex) === true) {

        // Make sure we actually have a regex value
        let regexValue = testElements.inputRegex.val();
        if (regexValue === undefined || regexValue.trim() === "" )
        {
            alert("A regex string must be provided if you want to use this feature.  If you are " +
                  "not familiar with Regular Expressions, you can uncheck this option.");
            return;
        }
        else
        {
            selections.push(regexValue);
        }
    }

    // Then create our total query
    let regex = selections.join("|");

    // At this point, we better have something
    if (selections.length === 0) {
        alert("You must select at least one set of tests.");
        return;
    }

    checkConfiguration(regex);
});

// Button for running all available tests
testElements.btnRunAll.click(function(e) {

    // Run everything
    checkConfiguration("(Data)|(Communication)|(Format)");
});

window.testElement = testElements;
