// Simple functions to visualize the test progress.
//
var progressElements = {

    // There aren't too many elements to get here
    progressBarFailed: window.$("#progressBarFailed"),
    progressBarPassed: window.$("#progressBarPassed"),

    countPassed: window.$("#countPassed"),
    countFailed: window.$("#countFailed"),
    countTotal: window.$("#countTotal"),

    btnCancelTest: window.$("#btnCancelTest"),
    btnViewResults: window.$("#btnViewResults"),

    monitorArgs: {},
}

// Button Events
progressElements.btnViewResults.click(function(e) {

    // Nothing to do here but show the result page
    window.carousel.showResults();
    window.resultElements.showLog();

});
progressElements.btnCancelTest.click(function(e) {

    // Just tell our server to stop.  This doesn't take a payload
    fetch("/cancel", {
        method: "POST",
        headers: {
            Accept: 'application/json',
        },
    })
    .then( response => response.json())
    .then( data => {
        if (data.error) {

            // We'll show the warning sign here if something went wrong
            window.footerElements.iconShowRejected();
            window.footerElements.changeFooterText(data.error)
        } else {

            // Assuming everything was fine, we'll just go back normally
            window.footerElements.iconShowBusy();
            window.footerElements.changeFooterText(data.message)
        }

        // Then go back to test selection
        window.footerElements.hideAfterDelay(500);
        window.carousel.showTestSelection();

        // Reset our page when we leave
        progressElements.resetPage();
    });
});

// Update our text with the pass / fail / information
progressElements.update = function(passed, failed, total) {

    // We can update the progress bars with this info
    let passPercent = (total === 0) ? 0 : passed / total;
    let failPercent = (total === 0) ? 0 : failed / total;

    progressElements.progressBarPassed.css('width', 100*passPercent+'%').attr('aria-valuenow', passPercent).change();
    progressElements.progressBarFailed.css('width', 100*failPercent+'%').attr('aria-valuenow', failPercent).change();

    // These are all <h3> elements, so we can set their text easily
    progressElements.countPassed.text(passed);
    progressElements.countFailed.text(failed);
    progressElements.countTotal.text(total);
}

// Clear everything back to normal for this page
progressElements.resetPage = function() {

    // Reset back to zero and disable buttons
    progressElements.update(0, 0, 0);

    progressElements.btnViewResults.attr("disabled", "disabled");
    progressElements.btnCancelTest.attr("disabled", "disabled");

    // Clear the interval we're using on the monitor below
    clearInterval(progressElements.monitorCode);
    progressElements.monitorArgs.code = null;
}

// Lastly, we'll have a loop that will be triggered from the test-selection promise
// chain.  This will run until the test server reports that all tests have completed
// and the test is over.
progressElements.startStatusMonitor = function() {

    // Reset the page
    progressElements.resetPage();

    // We know that our server is expecting POST requests at the /status path,
    // so we'll set up a small promise chain to run until we either get an error
    // or a "done" property on the returned json object
    progressElements.monitorCode = setInterval(checkStatus, 2000);

    // Allow the Cancel button since this is up
    progressElements.btnCancelTest.removeAttr("disabled");
}

function checkStatus(args) {

    fetch("/status", {
        method: "POST",
        headers: {
            Accept: 'application/json',
        },
    })
    .then( response => {
        return response.json();
    })
    .then( summary => {

        // Check if we've cancelled this since calling.  Can use == as
        // this might be null or undefined
        if (progressElements.monitorCode == undefined)
            return;

        // Make sure we didn't have an error over there
        if (summary.error === undefined) {

            // Check if the tests are done
            if(summary.state == "cancelled" || summary.state == "finished") {

                // Clear the process
                setTimeout(function() {
                    window.footerElements.hideAll();

                    // Off the main scope, so we need to do this manually
                    window.$("#btnViewResults").removeAttr("disabled");

                }, 500);

                // Update our footer message
                window.footerElements.iconShowSuccess();
                window.footerElements.changeFooterText("Tests complete!");

                // Allow the results button and disable our cancel button
                progressElements.btnViewResults.removeAttr("disabled");
                progressElements.btnCancelTest.attr("disabled", "disabled");

                clearInterval(progressElements.monitorCode );
            }

            // Regardless, update our progress
            progressElements.update(summary.passed, summary.failed, summary.total)

        // If we had an error, break out of here and stop the interval
        } else {
            progressElements.update(summary.passed, summary.failed, summary.total);

            // Update our footer message
            window.footerElements.iconShowRejected();
            window.footerElements.changeFooterText("Error within tests.")
            window.footerElements.hideAfterDelay(500);

            // Nothing here to cancel
            progressElements.btnCancelTest.attr("disabled", "disabled");

            clearInterval(progressElements.monitorCode );
        }
    })
}

// Initialize our visuals
progressElements.resetPage();

window.progressElements = progressElements;
