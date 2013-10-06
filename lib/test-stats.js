var _ = require("underscore");
module.exports = function() {
  var api ={},
    stats;
  api.resetStats = function() {
    stats = {
      testStats1: {
        name:"Test Stats 1",
        description: "Test Best Test Stats",
        stats :[
          {name:"chris",rank:50},
          {name:"jeff",rank:30},
          {name:"matt",rank:40}
        ]
      },
      testStats2:{
        name:"Test Stats 2",
        description: "Test Second Best Test Stats",
        stats :[
          {name:"chris",rank:20},
          {name:"jeff",rank:80},
          {name:"matt",rank:90}
        ]
      }
    };
  };
  function setStats(name,change) {
    var retVal = {};
    _.each(stats,function(value,key) {
      console.log(retVal);
      retVal[key]=[];
      var id = _.find(stats[key].stats,function(item) {
        return item.name === name;
      });
      console.log(id);
      if(id) {
        id.rank+=change;
        retVal[key].push(id);
      } else {
        var newItem = _.clone({name:name,rank:change});
        stats[key].stats.push(newItem);
        retVal[key].push(newItem);
      }
      
    });
    return retVal;
  }
  api.getStats = function(callback) {
    callback(null, stats);
  };
  api.addResult = function(data,callback) {
    var retVal = {};
    data.winner.forEach(function(player) {
      var changes = setStats(player,data.margin);
      _.each(changes,function(value,key) {
        if(retVal[key]) {
          value.forEach(function(valToAdd) {
            retVal[key].push(valToAdd);
          });
        } else {
          retVal[key] = _.clone(value);
        }
      });
    });
    
    data.loser.forEach(function(player) {
      var changes = setStats(player,data.margin*-1);
      _.each(changes,function(value,key) {
        if(retVal[key]) {
          value.forEach(function(valToAdd) {
            retVal[key].push(valToAdd);
          });
        } else {
          retVal[key] = _.clone(value);
        }
      });
    });
    callback(null,retVal);
  };
  api.resetStats();
  return api;
};
