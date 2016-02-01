var moduleName = 'timelineModule';

angular.module(moduleName, [])
    .service('timelineService', ['$q','$http', function($q, $http){
        "use strict";
        this.data = {};
        this.getData = function(startTime, endTime){
            var deferred = $q.defer()
            var path = './timelineData.json'
            return $http.get(path).then(function(data){
                //this.data = data
                return $q.when(data)
            }, function(error){
                return $q.reject(error)
            })
        }
    }])
    .controller('timelineController',['$scope','timelineService', function($scope, timelineService){
        "use strict";
        $scope.name = 'wj'
        timelineService.getData().then(function(res){
            $scope.data = res.data.data
        })
    }])
    .directive('timeline', function(){
        "use strict";
        return {
            restrict: 'E',
            //scope: {
            //    data: '=',
            //    name: '='
            //},
            template: 'D3 Scatter Plot abc {{data}} --{{name}}'
        }
    })


export default moduleName

