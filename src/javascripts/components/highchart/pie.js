var moduleName = 'pieModule';

//var data = {"data": {
//    "totalClientCount": 99999999,
//    "poorClientCount": 27,
//    "clientsByOss": [
//        {
//            "osName": "Apple OS",
//            "clients": 13
//        },
//        {
//            "osName": "HiveOS",
//            "clients": 10
//        },
//        {
//            "osName": "windows",
//            "clients": 13
//        }
//    ]
//}};


var _formatData = function(data) {
    var chartData = [];
    var legendColors = [];
    var chartColors= ["#2D358E", "#3F72B8", "#37C6F4", "#1D6790", /*"#SD89BC",*/ "#B6E3F6", "#02344F", "#0F9193", "#37C0CD", "#52723C", "#93C563", "#C1E1C1"];
    var bakChartColors= ['#3994d0','#34c1cd','#1c9395','#9ccd6a', '#37c6f4','#fcc12e', '#f89f33', '#fef2c2', '#567d39', '#c1e2c2', '#023550', '#266a92', '#b6e4f9', '#2c3691'];
    for(var i = 0; i < data.clientsByOss.length; i++) {
        //chartData[i] = [data.data.clientsByOss[i].osName, data.data.clientsByOss[i].clients];
        chartData[i] = {
            name:  data.clientsByOss[i].osName,
            color: this._getChartColor(data.clientsByOss[i].osName),
            y:     data.clientsByOss[i].clients
        }
    }
    return chartData;
}
var createSeries = function(data) {
    var data = _formatData(data);
    return data;
}

angular.module(moduleName, [])
    .service('logDataService', ['$q','$http', function($q, $http){
        "use strict";
        this.data = {};
        this.getData = function(startTime, endTime){
            var deferred = $q.defer()
            var path = './data/pieData.json'
            return $http.get(path).then(function(data){
                //this.data = data
                return $q.when(data)
            }, function(error){
                return $q.reject(error)
            })
        }
    }])
    .controller('linechartController',['$scope','logDataService', function($scope, logDataService){
        "use strict";
        $scope.name = 'wj'
        logDataService.getData().then(function(res){
            $scope.chartConfig = {
                options: {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        type: 'pie',
                        height: '200',
                        margin: [0, 0, 0, 0],
                        spacingTop: 0,
                        spacingBottom: 0,
                        spacingLeft: 0,
                        spacingRight: 0,
                        backgroundColor: '#FFFFFF'
                    },
                    tooltip: {
                        pointFormat: '<div id="pieChartToolTip">{point.options.name}<br/> Number: {point.options.y}<br/><b>Percentage: {point.percentage:.1f}%</b></div>',
                        headerFormat: '',
                        useHTML: true,
                    },
                    legend: {
                        itemWidth: 160,
                        align: 'right',
                        verticalAlign: 'middle',
                        layout: 'vertical',
                        borderWidth: 0,
                        itemMarginTop: 5,
                        itemStyle: {
                            marginTop: '5px',
                            fontSize: '10px'
                        },
                        labelFormatter: function () {
                            return $scope.name +'<span style="font-weight:normal;"> (' + Math.round(this.percentage*10)/10+'%)</span>';
                        }
                    },
                    scrollbar : {
                        enabled : false
                    }

                },
                series:   [{
                    data: createSeries(res.data),
                    type: 'pie',
                    name: 'Clients By Os',
                    innerSize: '60%'
                }],
                title: {
                    //text: 'Hello',
                    margin: 20
                },
                useHighStocks: false,

                loading: false
            }
        })
    }])
//.directive('timeline', function(){
//    "use strict";
//    return {
//        restrict: 'E',
//        //scope: {
//        //    data: '=',
//        //    name: '='
//        //},
//        template: 'D3 Scatter Plot abc {{data}} --{{name}}'
//    }
//})


export default moduleName

