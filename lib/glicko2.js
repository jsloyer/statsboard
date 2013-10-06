var _ = require("underscore")
  , glicko2 = require("glicko2")
  ;
module.exports = function() {
  var api = {};
  api.getName = function() {
    return "Glicko2";
  };

  api.getDescription = function() {
    return "The algorithm is explained by its author, Mark E. Glickman, on " +
      "http://glicko.net/glicko.html.";
  };
  
  api.runStats = function(result,players,done) {
    var ranking = new glicko2.Glicko2({
      tau : 0.5,
      rating : 1500,
      rd : 200,
      vol : 0.06
    }),
      playerRank = {},
      matches = [];
    
    _.union(result.winner,result.loser).forEach(function(player) {
      var playerData = _.findWhere(players,{name:player});
      if( playerData ) {
        playerRank[player] = ranking.makePlayer(
          playerData.rating,playerData.rd, playerData.vol);
      } else {
        playerRank[player] = ranking.makePlayer();
      }
    });
    result.winner.forEach(function(winner) {
      result.loser.forEach(function(loser) {
        matches.push([playerRank[winner],playerRank[loser],1]);
      });
    });
    ranking.updateRatings(matches);
    _.each(playerRank, function(player,name) {
      var playerData = _.findWhere(players,{name:name});
      if(!playerData) {
        playerData = { name:name };
        players.push(playerData);
      }
      playerData.rating = player.getRating();
      playerData.rd = player.getRd();
      playerData.vol = player.getVol();
      playerData.rank = playerData.rating / 30;
    });
    done(null,players);
  };
  return api;
};