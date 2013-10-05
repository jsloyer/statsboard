var driver = require("./driver")
  , async = require("async")
  , expect = require("chai").expect
  , _ = require("underscore")
  ;

describe("Main Page", function() {
  var testDriver = driver(),
         page;
  before( function(done) {
    async.waterfall( [
        testDriver.start,
        testDriver.mainPage,
        function(info,next) {
          page = info;
          next();
        }
      ],
      done
    );
  });
  after( function(done) {
    testDriver.stop(done);
  });
    
  it("should contain the general items", function(done) {
    page.checkGeneral(done);
  });
  it("should contain information about the other stats", function(done) {
    async.waterfall( [
      page.getStatsType,
      function(stats,next){
        var stats1,
          stats2;
        
        stats1 = _.findWhere(stats,{statsName:"Test Stats 1"});
        expect(stats1).to.be.ok;
        expect(stats1.statsDesc).to.be.equal("Test Best Test Stats");
        
        stats2 = _.findWhere(stats,{statsName:"Test Stats 2"});
        expect(stats2).to.be.ok;
        expect(stats2.statsDesc).to.be.equal("Test Second Best Test Stats");
        next();
      }
    ], done);
    
  });
});

describe("Test Stats 1", function() {
  var testDriver = driver(),
         page;
  before( function(done) {
    async.waterfall( [
        testDriver.start,
        testDriver.statsPage.bind(undefined,"testStats1"),
        function(info,next) {
          page = info;
          next();
        }
      ],
      done
    );
  });
  after( function(done) {
    testDriver.stop(done);
  });
    
  it("should contain the general items", function(done) {
    page.checkGeneral(done);
  });
  it("should contain right stat name", function(done) {
    async.waterfall( [
      page.statName,
      function(item,next){
        expect(item).to.be.equal("Test Stats 1");
        next();
      }
    ], done);
  });
  it("should contain right stat description", function(done) {
    async.waterfall( [
      page.statDescription,
      function(item,next){
        expect(item).to.be.equal("Test Best Test Stats");
        next();
      }
    ], done);
  });
  
  it("should contain right stats", function(done) {
    async.waterfall( [
      page.stats,
      function(item,next){
        var stats = [
          { playerName:"chris", ranking: "1", rank: "50" },
          { playerName:"matt", ranking: "2", rank: "40" },
          { playerName:"jeff", ranking: "3", rank: "30" }
        ];
        stats.forEach(function(stat) {
          var currentStat = _.findWhere(item,{playerName:stat.playerName});
          expect(currentStat.ranking).to.be.equal(stat.ranking);
          expect(currentStat.rank).to.be.equal(stat.rank);
        });
        next();
      }
    ], done);
  });
  
});

describe("Test Stats 2", function() {
  var testDriver = driver(),
         page;
  before( function(done) {
    async.waterfall( [
        testDriver.start,
        testDriver.statsPage.bind(undefined,"testStats2"),
        function(info,next) {
          page = info;
          next();
        }
      ],
      done
    );
  });
  after( function(done) {
    testDriver.stop(done);
  });
    
  it("should contain the general items", function(done) {
    page.checkGeneral(done);
  });
  it("should contain right stat name", function(done) {
    async.waterfall( [
      page.statName,
      function(item,next){
        expect(item).to.be.equal("Test Stats 2");
        next();
      }
    ], done);
  });
  it("should contain right stat description", function(done) {
    async.waterfall( [
      page.statDescription,
      function(item,next){
        expect(item).to.be.equal("Test Second Best Test Stats");
        next();
      }
    ], done);
  });
  
  it("should contain right stats", function(done) {
    async.waterfall( [
      page.stats,
      function(item,next){
        var stats = [
          { playerName:"matt", ranking: "1", rank: "90" },
          { playerName:"jeff", ranking: "2", rank: "80" },
          { playerName:"chris", ranking: "3", rank: "20" }
        ];
        stats.forEach(function(stat) {
          var currentStat = _.findWhere(item,{playerName:stat.playerName});
          expect(currentStat.ranking).to.be.equal(stat.ranking);
          expect(currentStat.rank).to.be.equal(stat.rank);
        });
        next();
      }
    ], done);
  });
  
});