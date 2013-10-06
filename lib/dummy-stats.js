var _ = require("underscore");
module.exports = function() {
  var api = {};
  api.getName = function() {
    return "Test Stats";
  };

  api.getDescription = function() {
    return "Test Stats Description";
  };
  
  api.runStats = function(result,players,done) {
    _.each(result.winner, function(player) {
      var playerData = _.findWhere(players,{name:player});
      if(playerData) {
        playerData.rank+=result.margin;
      } else {
        players.push({name:player,rank:result.margin});
      }
    });
    
    _.each(result.loser, function(player) {
      var playerData = _.findWhere(players,{name:player});
      if(playerData) {
        playerData.rank-=result.margin;
      } else {
        players.push({name:player,rank:(result.margin*-1)});
      }
    });
    done(null,players);
  };
  return api;
};