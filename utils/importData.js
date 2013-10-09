var async = require("async")
  , statsEngine = require("../lib/stats")
  , config = require("../lib/config")()
  , MongoClient = require("mongodb").MongoClient
  , fs = require("fs")
  , _ = require("underscore")
  ;
    
var db;

function parsePoolResults(stat) {
  var result = {};
  if( stat.date ) {
    result.revision = Date.parse(stat.date);
  }
  if( stat.losers ) {
    result.loser = stat.losers;
  }
  if( stat.winners ) {
    result.winner = stat.winners;
  }
  if( stat["foul-end"] ) {
    result.technical = true;
  } else {
    result.technical = false;
  }
  
  if( stat.ordered ) {
    result.ordered = stat.ordered;
  }
  
  if( stat["loser-left"] ) {
    result.loserLeft = stat["loser-left"];
  } else {
    result.loserLeft = 0;
  }
  
  if( stat["winner-left"] ) {
    result.winnerLeft = stat["winner-left"];
  } else {
    result.winnerLeft = 0;
  }
  
  if( stat.players ) {
    if( stat.players.length >= 2 ) {
      stat.team1 = [ stat.players[0] ];
      stat.team2 = [ stat.players[1] ];
    }
    if( stat.players.length > 2 ) {
      stat.team1.push(stat.players[2]);
      stat.team2.push(stat.players[3]);
    }
    if( stat["winning-team"] === 0 ) {
      result.winner = stat.team1;
      result.loser = stat.team2;
    } else {
      result.winner = stat.team2;
      result.loser = stat.team1;
    }
  }
  return result;
  
}

async.waterfall([
    function(next) {
      MongoClient.connect(config.getMongoURI(),next);
    },
    function(dbIn,next) {
      db = dbIn;
      fs.readFile(process.argv[2], 'utf-8', next);
    },
    function(cont,next) {
      var poolResults,
        poolFunctions = [];
      poolResults = JSON.parse(cont);
      poolResults.forEach(function(stat) {
        
        poolFunctions.push(function(callback) {
          var stats = statsEngine(db),
            result = parsePoolResults(stat);
          stats.addResult(result,callback);
        });
      });
      async.series(poolFunctions,next);
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