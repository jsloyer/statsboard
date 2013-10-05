var Browser = require("zombie-phantom")
  , async = require("async")
  , expect = require("chai").expect
  , statsboard = require("../lib/statsboard")
  , testStats = require("../lib/test-stats")
  , url = require("url")
  ;
  
  
module.exports = function() {
  var api = new Browser({ debug: false }),
    page = Object.create(null),
    mainPage,
    statsPage,
    server;
    
  api.stats = testStats();
  server = statsboard(api.stats);
  
  api.start = function(callback) {
    server.start(callback);
  };
  
  api.stop = function(callback) {
    api.close();
    server.stop(callback);
  };
  
  Object.defineProperties(page,{
    navigation: {
      get:function() {
        return api.queryAll("nav .navLink");
      }
    }
  });
  function getText(attribute,done) {
      api.query(attribute,function(dom) {
        api.text(dom,function(data) {
          done(null,data);
        });
      });
    }
  function getAttributes(attributes,parent,done) {
    var retVal = {};
    async.each(attributes,function(item,callback) {
      api.query("."+item,parent,function(dom) {
        api.text(dom,function(data) {
          retVal[item] = data;
          callback();
        });
      });
    }, function(err) {  done(err,retVal); });
  }
  function getTableText(tableClass,attributes,done) {
    async.waterfall( [
      function(next) {
        api.queryAll("."+tableClass,next.bind(undefined,null));
      },
      
      function(statsLinks,next) {
        async.map(statsLinks,getAttributes.bind(undefined,attributes),next);
      }
    ],
    done);
    
  }
    
  page.checkGeneral = function(done) {
    async.waterfall( [
      function(next) {
        api.queryAll("nav .navLink",next.bind(undefined,null));
      },
      
      function(navLinks,next) {
        async.map(navLinks,function(data,next) {
          api.text(data,function(newData) {
            next(null,newData);
          });
          
        }
          ,next);
      },
      function(navigation,next) {
        expect(navigation.length).to.be.equal(3);
        expect(navigation[0]).to.be.equal("Stats Board");
        expect(navigation).to.contain("Test Stats 1");
        expect(navigation).to.contain("Test Stats 2");
        next();
      }
    
    ],
    done );
    
  };
  mainPage = Object.create(page);
  statsPage = Object.create(page);
  mainPage.getStatsType= function(callback) {
    getTableText("statsLinks",["statsName","statsDesc"],callback);
  };
  
  statsPage.statName = function(done) {
    getText(".statsName",done);
  };
  
  statsPage.statDescription = function(done) {
    getText(".statsDesc",done);
  };
  statsPage.stats = function(done) {
    getTableText("gameStats",["playerName","ranking","rank"],done);
  };
    
  api.mainPage = function(callback) {
    
    async.waterfall(
      [
        function(next) {
          var urlIn = url.resolve(server.url(),"/");
          api.visit(urlIn,next);
        },
        function(next) {
          next(null,Object.create(mainPage));
        }
      ],
      callback
    );
  };
  
  api.statsPage = function(page,callback) {
    async.waterfall(
      [
        function(next) {
          var urlIn = url.resolve(server.url(),"/"+page);
          api.visit(urlIn,next);
        },
        function(next) {
          next(null,Object.create(statsPage));
        }
      ],
      callback
    );
  };
  return api;
};
  