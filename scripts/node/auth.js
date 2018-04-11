const axios = require("axios");
const buffer = require("buffer").Buffer

module.exports = {

    // Settings for the authorization and endpoint selection
    authBasic: "",
    endpoint: "",

    // Checks the username, password, and endpoint for the given LRS.
    // The callback argument is called with a boolean for whether we
    // successfully logged into the LRS
    checkCredentials: function(basicAuth, endpoint, callback) {

        // We'll need an instance of this to use
        var instance = axios.create({
            baseURL: endpoint,
            timeout: 5000,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + basicAuth,
                "X-Experience-API-Version": "1.0.3",
            }
        });

        // With this, we can start our promise chain
        instance.get("/statements?format=exact&limit=1")
        .then(function (response) {
            callback(response.status == 200, response.statusText);
        })
        .catch(function(reason) {
            callback(reason.response.status == 200, reason.response.statusText);
        });
    }
}
