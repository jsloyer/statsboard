var async = require("async")
  , _ = require("underscore");
module.exports = function(db) {
  var api ={},
    statsEngines;
  if(!arguments[1]) {
    statsEngines = {};
    statsEngines.chris = require("./chris")();
    statsEngines.glicko2 = require("./glicko2")();
    statsEngines.trueskill = require("./trueskill")();
  } else {
    statsEngines = arguments[1];
  }
  api.getStatsHistory = function(statsType,name,done) {
    async.waterfall( [
      function(next) {
        db.collection("statsHistory",next);
      },
      function(collection,next) {
        collection.find({name:name,statsType:statsType},{
          sort:{revision:1},
          fields:{rank:1,revision:1,_id:0}
        }).toArray(next);
      }
    ],done);
  };
  api.getStats = function(done) {
    var retVal = {};
    async.waterfall( [
      function(next) {
        db.collection("stats",next);
      },
      function(collection,next) {
        collection.find().toArray(next);
      },
      function(results,next) {
        results.forEach(function(item) {
          if(!retVal[item.statsType]) {
            retVal[item.statsType] = {};
            retVal[item.statsType].stats = [];
          }
          retVal[item.statsType].stats.push(
            {name:item.name,rank:item.rank }
            
          );
        });
        next();
      },
      function(next) {
        _.each(statsEngines,function(item,key) {
          retVal[key].name = statsEngines[key].
            getName();
          retVal[key].description = statsEngines[key].
            getDescription();
        });
        next(null,retVal);
      }
    ],done);
  };
  api.addResult = function(data,callback) {
    var resultsCollection,
      historyCollection,
      rawCollection,
      incrementalCallback,
      revision;
      if( data.revision ) {
          revision = data.revision;
        } else {
          revision = (new Date()).getTime();
        }
    if(arguments.length  === 3 ) {
      incrementalCallback = arguments[1];
      callback = arguments[2];
    }
    async.waterfall( [
      function(next) {
        db.collection("stats",next);
      },
      function(collection,next) {
        resultsCollection = collection;
        db.collection("statsHistory",next);
      },
      function(collection,next) {
        historyCollection = collection;
        db.collection("allStats",next);
      },
      function(collection,next) {
        rawCollection = collection;
        rawCollection.insert(data,next);
      },
      function(doc,next) {
        var players = _.union(data.winner,data.loser);
        resultsCollection.find({name:{"$in": players }}).toArray(next);
      },
      function(results,next) {
        var workers = {};
        
        _.each(statsEngines, function(engine,key) {
          workers[key] = function(done) {
            
            var enginePlayers,
              players;
            enginePlayers = _.where(results,{statsType:key});
            
            async.waterfall( [
              function(run) {
                engine.runStats(data,enginePlayers,run);
              },
                             
              function(engineResults,run) {
                players = engineResults;
                if(incrementalCallback) {
                  async.nextTick(function(){
                    var callData = {};
                    callData[key] =  _.map(engineResults,function(item) {
                      return _.pick(item,"name","rank");
                    });
                    incrementalCallback(callData);
                  });
                }
                
                async.each(players,function(item,runner) {
                  item.statsType = key;
                  resultsCollection.save(item,runner);
                },run);
                
              },
              
              function(run) {
                async.each(players,function(item,runner) {
                    var insertItem = {};
                    insertItem.name = item.name;
                    insertItem.rank = item.rank;
                    insertItem.statsType = key;
                    insertItem.revision = revision;
                    historyCollection.insert(insertItem,runner);
                  },run);
              },
              function(run) {
                run(null,players);
              }
            ],done);
            
          };
        
        });
        async.parallel(workers,next);
      },
      function(results,next) {
        _.each(results, function(value,key) {
          results[key] = _.map(value,function(item) {
            return _.pick(item,"name","rank");
          });
        });
        next(null,results);
      }
    ],callback);
  };
  return api;
};
