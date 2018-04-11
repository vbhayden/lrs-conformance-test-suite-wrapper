var https = require("https");
var http = require('http');
var axios = require("axios");
var fs = require("fs");
var auth = require("./scripts/node/auth");

// Conformance suite references
var TestRunner = require("./lrs-conformance-test-suite/bin/testRunner").testRunner;
var currentTest = new  TestRunner("console", null, {});

// Different resources require different content types
function checkContentType(url) {

	if (url.indexOf(".css") > 0)
		return "text/css";

	if (url.indexOf(".html") > 0)
		return "text/html";

	if (url.indexOf(".png") > 0)
		return "image/png";

	if (url.indexOf(".jpeg") > 0 || url.indexOf(".jpg") > 0)
		return "image/jpeg";

	// Assume this is html
	return "text/plain";
}

// Some of the pages use partial html and layout files
function processMarkdown(fileData) {

	// Convert this to a string and check that we had
	let fileString = fileData.toString();

	// We'll do a regex on this and check matches
	let blocks = fileString.match(/{{(.*?)}}/g);
	if (blocks === undefined || blocks === null)
		return fileData

	for (let k=0; k < blocks.length; k++)
	{
		// We already know where these should be
		let blockPath = "views/" + blocks[k].substr(2, blocks[k].length - 4);

		// Check that they exist synchronously
		if (fs.existsSync(blockPath) ){

			// Same thing, do it synchronously
			let partialFileData = fs.readFileSync(blockPath);

			// A bit redundant as we're calling this FROM here, but it will
			// allow us to nest other partial html blocks
			let partialFileString = processMarkdown(partialFileData);

			// Replace all of the markdown
			fileString = fileString.replace(blocks[k], partialFileString);

		} else {
			console.log(">> Partial HTML file not found: " + blockPath);
		}
	}

	return fileString;
}

// Get the data from an http request
function parseRequestData(request, callback) {

	// We need to gradually read the body from this request
	var body = "";
	request.on('data', function (chunk) {
		body += chunk
	});

	// Once we have the entire payload, we can use the callback
	// to send that out of this function
	request.on('end', function () {
		var jsonObj = JSON.parse(body);
		callback(jsonObj)
	});
}

http.createServer(function (req, res) {

	// Remove first character
	let localPath = req.url.substr(1);

	// If our page is sending information to us
	if (req.method == "POST") {

		// If this was information for our lrs authentication
		if (localPath === "config") {

			// Parse the configuration data
			parseRequestData(req, function(data) {

				// Once we have the data passed from the browser, we can create
				// our test runner using those parameters.
				var options = {
					basicAuth: true,
					authUser: data.authUser,
					authPass: data.authPass,
					endpoint: data.endpoint,
					grep: data.regex,
					errors: true,
				};

				// Pass these to our runner constructor
				currentTest = new TestRunner("console", null, options);
				res.end('{"message": "LRS Test Ready!"}');
			});

		} else if (localPath === "start") {

			// If we're checking status, then we need to check how things
			// are going with our test
			//
			if (currentTest === undefined) {
				res.end('{"error": "No current test."}');
			} else {

				// Start the test
				currentTest.start();
				res.end('{"message": "LRS Test Started!"}');
			}

		} else if (localPath === "status") {

			// If we're checking status, then we need to check how things
			// are going with our test
			//
			if (currentTest === undefined) {

				// If we don't have a test, send that back
				res.end('{"error": "No current test."}');

			} else {

				// If we have an endTime, then we're done
				var summary = currentTest.summary;
				summary.state = currentTest.state;

				res.end(JSON.stringify(currentTest.summary));
			}

		}  else if (localPath === "cancel") {

			// Need a test to cancel
			if (currentTest === undefined) {
				res.end('{"error": "No current test."}');
			} else {

				// Cancel the current test.
				currentTest.cancel();

				res.end('{"message": "Test cancelled!"}');
			}

		}else if (localPath === "log") {

			// Need a test to get the log
			if (currentTest === undefined) {
				res.end('{"error": "No current test."}');

			} else {

				// The test runner class has a function for this
				var cleanLog = currentTest.getCleanRecord();

				// Taken from /bin/console_runner.js
				function removeNulls (log) {
					var temp;

					if (log && log.status === 'failed')
					{
						temp = {
							title: log.title,
							name: log.name,
							requirement: log.requirement,
							log:log.log,
							status: log.status,
							error: log.error
						};
						var t = log.tests.map(removeNulls);
						if (t) temp.tests = t.filter(function(v){return v != undefined});
					}
					return temp;
				}

				// The console runner does this with the command line --errors
				// argument, but we'll just do the same thing here
				var errOnly = {
					name: cleanLog.name,
					owner: cleanLog.owner,
					flags: cleanLog.flags,
					options: cleanLog.options,
					rollupRule: cleanLog.rollupRule,
					uuid: cleanLog.uuid,
					startTime: cleanLog.startTime,
					endTime: cleanLog.endTime,
					duration: cleanLog.duration,
					state: cleanLog.state,
					summary: cleanLog.summary,
					log: removeNulls(cleanLog.log)
				};

				// Send back whatever errors they had
				res.end(JSON.stringify(errOnly));
			}

		}  else {
			// We're not sure what this was supposed to be
		    res.end('{"error": "POST requests require paths of /config, /cancel, /status, /log, /start"}');
		}

		return;
	}

	// Default home page for "/"
	if (localPath === "")
		localPath = "views/home.html"

	// Read whatever page we chose for this
	fs.readFile(localPath, function(err, fileData) {

		// Check if we got anything
		if (fileData === undefined) {
			res.writeHead(404);
		    res.end("File not found: " + err.toString());
			return;
		}

		// Determine what sort of content we're sending back
		let contentType = checkContentType(localPath);

		// Check if we need to swap out any markdown
		let fileString = processMarkdown(fileData);

		// Now write the actual response object to send
	    res.writeHead(200, {'Content-Type': contentType});
	    res.write(fileString);
	    res.end();

  	});

}).listen(8000);

console.log("Server is running on port 8000");
