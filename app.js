
/**
 * Module dependencies.
 */

var testStats = require("./lib/test-stats")()
    , statsboard = require("./lib/statsboard")
    ;

statsboard(testStats);
