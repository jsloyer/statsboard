'use strict';
var app = angular.module("statsboard",['ngRoute','ui.bootstrap','statsboard.controller']);
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
function($scope, $routeParams, $modal, $rootScope) { 
        $scope.statsId = $routeParams.statsId;
        $rootScope.addResultModal = function() {
    $modal.open({
      templateUrl: "partials/addResult.partial.html",
      controller: "addResultController"
    });
  };
});

app.controller("addResultController",  function ($scope, $modalInstance,$rootScope) {
  

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
    $rootScope.addResult(message);
    
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

app.directive('chart', function () {
  return function (scope, element, attrs) {
    var state = 0;
    scope.$watch(attrs.show,function(value) {
      state +=1;
      console.log("testing",value,state);
    });
  };
});
