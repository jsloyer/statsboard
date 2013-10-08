var controller = angular.module("statsboard.controller",[]);
controller.controller("statsController", 
function($scope,$rootScope) {
  
  $rootScope.addResult=function(result) {
    result.winner.forEach(function(player) {
      $scope.stats.testStats1.stats.push({name:player,rank:result.margin});
      $scope.stats.testStats2.stats.push({name:player,rank:result.margin});
    });
    result.loser.forEach(function(player) {
      $scope.stats.testStats1.stats.push({name:player,rank:result.margin*-1});
      $scope.stats.testStats2.stats.push({name:player,rank:result.margin*-1});
    });
  };
        $scope.stats = {
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
        
});
