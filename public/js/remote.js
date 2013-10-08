'use strict';
var app = angular.module("statsboard",['ngRoute','btford.socket-io','ui.bootstrap']);
app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      templateUrl: "partials/root.partial.html"
    });
  $routeProvider.
    when('/:statsId', {
      templateUrl: "partials/stats.partial.html",
      controller:"statsIdController"
    });
  $routeProvider.otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
});
app.controller("statsIdController", 
function($scope, $routeParams) { 
        $scope.statsId = $routeParams.statsId;
});

app.controller("addResultController",  function ($scope, socket, $modalInstance) {

  $scope.addResults=function(result) {
    var message = {},
      teams = [[],[]];
    if(result.team1.player1) {
      teams[0].push(result.team1.player1);
    }
    if(result.team1.player2) {
      teams[0].push(result.team1.player2);
    }
    if(result.team2.player1) {
      teams[1].push(result.team2.player1);
    }
    if(result.team2.player2) {
      teams[1].push(result.team2.player2);
    }
    if(result.winningTeam == 1) {
      message.winner = teams[0];
      message.loser = teams[1];
    } else {
      message.winner = teams[1];
      message.loser = teams[0];
    }
    message.margin = parseInt(result.margin);
    socket.emit("addResult",message);
    
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

app.controller("statsController", 
function($scope,socket,$modal) {
  $scope.addResultModal = function() {
    $modal.open({
      templateUrl: "partials/addResult.partial.html",
      controller: "addResultController"
    });
  };
        $scope.stats ={}; /* <%= JSON.stringify(stats) %> ;*/
        socket.on("changeInfo",function(data) {
          console.log(data);
          _.each(data,function(value,key) {
            _.each(value,function(change) {
              $scope.stats[key].stats = _.filter(
                $scope.stats[key].stats, function(item) {
                return item.name != change.name;
              });
              
              $scope.stats[key].stats.push(change);
            });
          });
        });
        
});
