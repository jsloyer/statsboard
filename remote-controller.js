var controller = angular.module("statsboard.controller",['btford.socket-io']);
controller.controller("statsController", 
function($scope,socket,$rootScope) {
  
  $rootScope.addResult=function(result) {
    socket.emit("addResult",message);
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
        
});
