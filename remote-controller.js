var controller = angular.module("statsboard.controller",['btford.socket-io']);
controller.controller("statsController", 
function($scope,socket,$rootScope,$http) {
  
  $rootScope.addResult=function(result) {
    socket.emit("addResult",result);
  };
  $scope.stats = <%= JSON.stringify(stats) %> ;
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
  $scope.loadGraphData = function(key,player) {
    $http.get("graph",{ params:{statsType:key,name:player.name}}).success(
      function(data) {
        var cnt = 0,
          min=false;
        data.forEach(function(item) {
          if( min === false ) {
            min = item.rank;
          } else {
            min = Math.min(item.rank,min);
          }
        });
        data.forEach(function(item) {
          cnt +=1;
          item.x = cnt;
          delete item.revision;
          item.y =  Math.round((item.rank-min)*1000)/1000;
          delete item.rank;
        });
        player.graphData.replace(data);
      });
  };
});
