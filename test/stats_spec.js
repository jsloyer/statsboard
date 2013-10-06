var config = require("../lib/config")()
  , statsEngine = require("../lib/stats")
  , MongoClient = require("mongodb").MongoClient
  , dummyStats = require("../lib/dummy-stats")
  , async = require("async")
  , expect = require("chai").expect
  , _ = require("underscore")
  ;

describe("Database Stats", function() {
  var db,
    stats;
    
  before(function(done) {
    var dbURI,
      dbName = "t"+(new Date()).getTime();
    dbURI = "mongodb://"+config.getMongoServer();
    dbURI +="/"+dbName;
    async.waterfall([
      function(next) {
        MongoClient.connect(dbURI,next);
      },
      function(dbIn,next) {
        db = dbIn;
        var statsEngines = {
          dummyStats1:dummyStats(),
          dummyStats2:dummyStats()
        };
        stats = statsEngine(db,statsEngines);
        next();
      }
    ],done);
  });
  
  after(function(done) {
    async.waterfall( [
      function(next) {
        db.dropDatabase(next);
      }
    ],done);
  });
  
  it("should be able to add a stat", function(done) {
    async.waterfall( [
      function(next) {
        stats.addResult({winner:["player1"],loser:["player2"],margin:3},next);
      },
      function(results,next) {
        ["dummyStats1","dummyStats2"].forEach(function(key) {
          expect(results).to.include.keys(key);
          expect(_.findWhere(results[key],{name:"player1",rank:3})).to.
            be.ok;
          expect(_.findWhere(results[key],{name:"player2",rank:-3})).to.
            be.ok;
        });
        stats.getStats(next);
      },
      function(results,next) {
        ["dummyStats1","dummyStats2"].forEach(function(key) {
          expect(results).to.include.keys(key);
          expect(results[key].name).to.be.equal("Test Stats");
          expect(results[key].description).to.be.equal(
            "Test Stats Description");
          expect(_.findWhere(results[key].stats,{name:"player1",rank:3})).to.
            be.ok;
          expect(_.findWhere(results[key].stats,{name:"player2",rank:-3})).to.
            be.ok;
        });
        next();
      },
    ],done);
  });
  
  it("should be able to update the stats", function(done) {
    async.waterfall( [
      function(next) {
        stats.addResult({winner:["player3"],loser:["player4"],margin:30},next);
      },
      function(results,next) {
        ["dummyStats1","dummyStats2"].forEach(function(key) {
          expect(results).to.include.keys(key);
          expect(_.findWhere(results[key],{name:"player3",rank:30})).to.
            be.ok;
          expect(_.findWhere(results[key],{name:"player4",rank:-30})).to.
            be.ok;
        });
        stats.addResult({winner:["player4"],loser:["player3"],margin:3},next);
      },
      function(results,next) {
        ["dummyStats1","dummyStats2"].forEach(function(key) {
          expect(results).to.include.keys(key);
          expect(_.findWhere(results[key],{name:"player3",rank:27})).to.
            be.ok;
          expect(_.findWhere(results[key],{name:"player4",rank:-27})).to.
            be.ok;
        });
        stats.getStats(next);
      },
      function(results,next) {
        ["dummyStats1","dummyStats2"].forEach(function(key) {
          expect(results).to.include.keys(key);
          expect(results[key].name).to.be.equal("Test Stats");
          expect(results[key].description).to.be.equal(
            "Test Stats Description");
          expect(_.findWhere(results[key].stats,{name:"player3",rank:27})).to.
            be.ok;
          expect(_.findWhere(results[key].stats,{name:"player4",rank:-27})).to.
            be.ok;
        });
        next();
      },
    ],done);
  });
  
});