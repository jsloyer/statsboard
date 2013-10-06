var _ = require("underscore")
  , trueskill = require("trueskill")
  ;
module.exports = function() {
  var api = {};
  api.getName = function() {
    return "Trueskill";
  };

  api.getDescription = function() {
    return "The TrueSkill(TM) ranking system";
  };
  
  api.runStats = function(result,players,done) {
    
    _.union(result.winner,result.loser).forEach(function(player) {
      var playerData = _.findWhere(players,{name:player});
      if( ! playerData ) {
        players.push({name:player, skill:[25.0, 25.0/3.0]});
      }
    });
    result.winner.forEach(function(winner) {
      _.findWhere(players,{name:winner}).rank = 1;
    });
    result.loser.forEach(function(loser) {
      _.findWhere(players,{name:loser}).rank = 2;
    });
    trueskill.AdjustPlayers(players);
    _.each(players, function(player) {
      delete player.rank;
      player.rank = player.skill[0];
    });
    done(null,players);
  };
  return api;
};