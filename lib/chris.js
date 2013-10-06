var _ = require("underscore")
  ;
module.exports = function() {
  var api = {};
  api.getName = function() {
    return "Chris Skill";
  };

  api.getDescription = function() {
    return "A custom alogirth that is based on expected win";
  };
  /*
   * 100 points per game
   * 10 % = rank of other teams
   * next 90 is winners
   * 4 > rank - 2
   * ((.7 - .3 +.3) * .7) * 90
   *  .7 - .3 - .3
   * max number 2000
    team 1 rank .7
    team 2 rank .3
    if team 1 wins  by margin 
  */
  function getWinnerRating(winnerRank,loserRank, margin) {
    return ((winnerRank - loserRank + (margin *10))/100 ) * loserRank +
      winnerRank;
  }
  function getLoserRating(winnerRank,loserRank, margin) {
    return ((winnerRank - loserRank  - (margin *10))/100) * winnerRank +
      loserRank;
  }
  api.runStats = function(result,players,done) {
    var winnerRank = 0,
      loserRank = 0,
      winningRating,
      loserRating
      ;
    _.union(result.winner,result.loser).forEach(function(player) {
      var playerData = _.findWhere(players,{name:player});
      if( ! playerData ) {
        players.push({name:player, rank:50, currentRating:0, maxRating:0});
      }
    });
    
    result.winner.forEach(function(winner) {
      winnerRank +=_.findWhere(players,{name:winner}).rank;
    });
    winnerRank = winnerRank / (result.winner.length);
    
    result.loser.forEach(function(player) {
      loserRank +=_.findWhere(players,{name:player}).rank;
    });
    loserRank = loserRank / (result.loser.length);
    
    winningRating = getWinnerRating(winnerRank,loserRank,result.margin);
    
    loserRating = getLoserRating(winnerRank,loserRank,result.margin);
    
    
    result.winner.forEach(function(winner) {
      var current = _.findWhere(players,{name:winner});
      current.currentRating += winningRating;
      current.maxRating += 100;
      
    });
    
    result.loser.forEach(function(loser) {
      var current = _.findWhere(players,{name:loser});
      current.currentRating += loserRating;
      current.maxRating += 100;
    });
    _.union(result.winner,result.loser).forEach(function(player) {
      var playerData = _.findWhere(players,{name:player});
      playerData.rank = ( playerData.currentRating / playerData.maxRating ) *
        100;
      if( playerData.maxRating > 2000 ) {
        playerData.maxRating = 2000;
        playerData.currentRating = 2000 * ( playerData.rank / 100 );
      }
    });
    done(null,players);
  };
  return api;
};