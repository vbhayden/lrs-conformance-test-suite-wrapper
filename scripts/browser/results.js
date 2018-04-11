// This page just sets up the few elements for summarizing the test and
// maybe providing an option to download the log data.
var resultElements = {

    logTemplate: window.$("#logTemplate"),
    logTemplateContainer: window.$("#logTemplateContainer"),

    logTitle: window.$("#logTitle"),

    btnReturnToTests: window.$("#btnReturnToTests"),
}

// This button will just return to the test page
resultElements.btnReturnToTests.click(function(e) {

    // We'll move first
    window.carousel.showTestSelection();

    // Then clear our container
    resultElements.logTemplateContainer.empty();

});

// This will be called by our progress page when it changes to here
resultElements.showLog = function() {

    fetch("/log", {
        method: "POST",
        headers: {
            Accept: 'application/json',
        },
    })
    .then( response => {
        return response.json();
    })
    .then( data => {
        resultElements.buildLogElements(data.log);
    });
}

// Build out our elements
resultElements.buildLogElements = function(log) {

    // Each log has an array of tests (called "tests") and each of those
    // tests has its own array of tests.  We will use the helper function
    // below to get these error chains
    let chains = getErrorChains(log);

    // If we don't have any errors, show a more pleasant screen
    if (chains.length === 0)
        buildSuccessScreen(chains);

    else
        buildFailureScreen(chains);

}

// This will run if our test comes back with errors
function buildFailureScreen(chains) {

    // Adjust our title
    resultElements.logTitle.text("Each failure is listed below.");

    // Once we have that array of arrays, we'll go ahead and build our entries
    for (let k=0; k < chains.length; k++) {

        // Sanity
        let chain = chains[k].chain;
        let chainKey = "errorEntry" + k.toString();
        let req = Array.isArray(chains[k].req) ? chains[k].req.join(",") : chains[k].req;

        // Replace all of the spaces for the #ID search
        chainKey = chainKey.replace(" ", "");

        // Clone the template
        let entry = resultElements.logTemplate.clone();

        // The first item in our chain will be the title.  All others will be
        // details hidden by the collapse button, but we need to hook the id's
        // up for that to happen
        //
        entry.find("p.log-requirement").text(req);
        entry.find("button").attr('data-target', "#" + chainKey);
        entry.find("div.collapse").attr("id", chainKey);
        entry.find("h4").text(chain[0]);

        // Now we need to add each of our items in this chain
        for (let h=1; h < chain.length; h++) {

            // We'll do this just by appending <p> elements to the container
            entry.find("div.collapse").append('<p class="log-detail">' + chain[h] + "</p>");
        }

        // Now add that to our container
        resultElements.logTemplateContainer.append(entry);
    }
}

// This will run if the test comes back without any errors.
function buildSuccessScreen(chains) {

    // Update our top message
    resultElements.logTitle.text("All tests were successful!");

    // Attach our little fireworks display to the container
    resultElements.logTemplateContainer.append(
    `   <div id="gui"></div>
        <div id="canvas-container">
            <div id="mountains2"></div>
            <div id="mountains1"></div>
            <div id="skyline"></div>
        </div>  `
    );

    // Then start the fireworks
    window.setupFireworks();
}

// This will get the nested error messages and test chains.  These chains will be
// returned as an array of objects with .req and .chain for their failed requirement
// and the chain of test cases leading up to them.
function getErrorChains(log) {

    // We'll return an array or arrays
    var chainQueue = [log];
    var chains = [];
    var subObj = log;

    // If our log itself is undefined, then we're done
    if (log === undefined)
        return []

    // Keep following the tests arrays
    while (chainQueue.length > 0) {

        // Take the first element in this list at the moment
        var obj = chainQueue.shift()
        var tests = obj.tests;
        var title = obj.title;
        var parentChain = obj.parentChain;
        var req = obj.requirement;

        // Check if there's a tests array here
        if (tests !== undefined && tests.length > 0) {

            // Add each of these to our chains array, after telling it about
            // its parent here.
            for (let k=0; k < tests.length; k++) {

                // Sanity
                var iterTest = tests[k];

                // Copy the parent's parentChain into this, or create one if necessary
                if (parentChain === undefined) {

                    // Just use the parent's name
                    let newChain = (title.trim() === "") ? [] : [title];
                    iterTest.parentChain = newChain;

                // If we got a chain for the parent (which will be most of the time),
                // then we need to copy that array here into the child and append with
                // its parent's name
                } else {

                    iterTest.parentChain = parentChain.slice();
                    iterTest.parentChain.push(title);
                }

                // Assign the requirement if the child object has none
                if (iterTest.requirement === undefined || iterTest.requirement.length === 0) {
                    iterTest.requirement = req;
                }

                chainQueue.push(iterTest);
            }

        // If there ISN'T a tests array, then we're at the end of a chain
        // and need to return this entire chain.
        } else {

            // If somehow the parent chain is empty here, then the full chain
            // will just be the title
            if (parentChain === undefined) {
                parentChain = [title];
            } else {
                parentChain.push(title);
            }

            // Get the requirements
            chainObj = {
                "req": req,
                chain: parentChain,
            }

            // Now just append to the array we're returning
            chains.push(chainObj);
        }
    }

    // Return this whole thing
    return chains;
}

window.resultElements = resultElements;
