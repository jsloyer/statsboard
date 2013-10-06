
/**
 * Module dependencies.
 */

var async = require("async")
  , statsEngine = require("./lib/stats")
  , statsboard = require("./lib/statsboard")
  , config = require("./lib/config")()
  , MongoClient = require("mongodb").MongoClient
  ;
    
async.waterfall([
    function(next) {
      MongoClient.connect(config.getMongoURI(),next);
    },
    function(db,next) {
      var stats = statsEngine(db);
      statsboard(stats);
      next();
    }
  ],function(err) {
    if(err) {
      console.log("Could not init server ");
      console.log(err);
      process.exit(1);
    }
  }
);