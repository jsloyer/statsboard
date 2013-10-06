
/**
 * Module dependencies.
 */

var async = require("async")
  , statsEngine = require("../lib/stats")
  , config = require("../lib/config")()
  , MongoClient = require("mongodb").MongoClient
  , _ = require("underscore")
  ;
    
var db;
async.waterfall([
    function(next) {
      MongoClient.connect(config.getMongoURI(),next);
    },
    function(dbIn,next) {
      var stats = statsEngine(dbIn),
          count = 0,
          players,
          i;
      db = dbIn;
      players = _.map(_.range(1,10),function(num) { return "player"+num; });
      async.whilst(
        function() { return count < 300; },
        function(callback) {
          var sample = _.sample(players,4),
            result={};
          result.margin = _.random(0,10);
          result.winner = [ sample[0], sample[1] ];
          result.loser = [ sample[2], sample[3] ];
          stats.addResult(result,callback);
          count+=1;
        },
        next);
    },
    function(next) {
      db.close(next);
    }
    
  ],function(err) {
    if(err) {
      console.log("Could not init server ");
      console.log(err);
      process.exit(1);
    }
  }
);