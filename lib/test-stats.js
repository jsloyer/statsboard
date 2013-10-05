module.exports = function() {
  return {
      getStats:function(callback) {
        callback(null, {
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
        });
      },
      getPlayers:function(callback) {
        callback(null,["player1","player2"]);
      }
    };
};
