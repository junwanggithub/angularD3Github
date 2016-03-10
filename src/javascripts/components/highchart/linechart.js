var moduleName = 'linechartModule';

var _formatData = function(data) {
    var formattedData = [];

    for(var i = 0; i < data.length; i++) {
        formattedData.push([data[i].timestamp,data[i].value]);
    }

    return formattedData.sort(function(a,b) {
        if(a[0] < b[0]) return -1;
        if(a[0] > b[0]) return 1;
        return 0;
    });
}
var createSeries = function(data) {
    var data = _formatData(data.data);
    return data;
    //return [{
    //    name: 'client',
    //    data: data
    //}];
}

angular.module(moduleName, [])
    .service('logDataService', ['$q','$http', function($q, $http){
        "use strict";
        this.data = {};
        this.getData = function(startTime, endTime){
            var deferred = $q.defer()
            var path = './data/linechartData.json'
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
                        type: 'line',
                        backgroundColor:'#fbfbfb',
                        spacingBottom: 30,
                        width: 900,
                        height: 300
                        //padding: 10,
                        //x:10,
                        //marginLeft: 80
                    },
                    scrollbar : {
                        enabled : false
                    },

                    yAxis: {
                        labels: {
                            enabled: false,
                            y: -2
                            //distance: 20,
                            //align: 'right'
                        },
                        opposite: true,
                        showLastLabel: false
                        //title: {
                        //    text: 'client',
                        //    margin : 60
                        //}
                    },
                    //xAxis: {
                    //    type: 'datetime',
                    //    title: {
                    //        text: 'value'
                    //    }
                    //},
                    xAxis: {
                        //type: 'datetime',
                        labels: {
                            enabled: false,
                            overflow: "justify"
                        },
                        lineWidth: 0,
                        tickLength: 0,
                        tickWidth: 0,
                        minRange: 1 ,
                        //minRange: 3600 * 1000,
                        //minRange: 86400000
                        categories: null,
                        endOnTick: false,
                        index: 0,
                        isX: true,
                        maxPadding: 0,
                        minPadding: 0,
                        ordinal: true,
                        showLastLabel: true,
                        startOnTick: false,

                    },
                    rangeSelector: {
                        enabled: false,
                        allButtonsEnabled: true,
                        selected: 5,
                        buttonSpacing: 10,
                        inputBoxWidth: 120,
                        inputEnabled: true
                    },
                    navigator: {
                        enabled:true,
                        outlineColor: '#cfcfce',
                        outlineWidth: 1,
                        maskInside: false,
                        maskFill: 'rgba(255,255,255,0.8)',
                        height: 120,
                        handles: {
                            backgroundColor: '#ffffff',
                            borderColor: '#0d2a47'
                        },
                        yAxis: {
                            gridLineColor: '#cfd0d0',
                            gridLineWidth: 1,
                            startOnTick: false,
                            endOnTick: false,
                            minTickInterval:1,
                            //minPadding: 0.1,
                            //maxPadding: 0.1,
                            min: 0,
                            minRange : 0.1,
                            labels: {
                                //enabled: true,
                                enabled: false
                            },
                            title: {
                                text: 'client',
                                style: {
                                    color: '#969696',
                                    font: '10px Helvetica, Arial, sans-serif'
                                }
                            },
                            tickWidth: 0
                        },
                        xAxis: {
                            tickWidth: 0,
                            lineWidth: 1,
                            gridLineColor: '#cfd0d0',
                            gridLineWidth: 1,
                            //tickPixelInterval: 200,
                            labels: {
                                align: 'left',
                                style: {
                                    color: '#969696',
                                    font: '10px Helvetica, Arial, sans-serif'
                                },
                                x: 3,
                                y: 15
                            },
                            tickInterval: 3600 * 1000
                        },
                        series: {
                            type: 'line',
                            color: '#bcd1e8',
                            fillOpacity: 1,
                            dataGrouping: {
                                smoothed: true
                            },
                            lineWidth: 2,
                            marker: {
                                enabled: false
                            }
                        }
                    }
                },
                //series: [],
                 series:   [{
                    data: createSeries(res.data),
                    //data: [10, 15, 12, 8, 7, 1, 1, 19, 15, 10]
                    name: 'time'
                    //data: [
                    //        [1234137500000,0],
                    //        //[1234137600000,14.64],
                    //        //[1234224000000,13.98],
                    //        //[1234310400000,13.83],
                    //        //[1234396800000,14.18],
                    //        //[1234483200000,14.17],
                    //        //[1234828800000,13.50],
                    //        //[1234915200000,13.48],
                    //        //[1235001600000,12.95],
                    //        //[1235088000000,13.00],
                    //        //[1235347200000,12.42],
                    //        //[1235433600000,12.89],
                    //        //[1235520000000,13.02],
                    //        //[1235606400000,12.74],
                    //        //[1235692800000,12.76],
                    //        [1235952000000,12.56]
                    //
                    //    ]
                }],
                title: {
                    //text: 'Hello',
                    margin: 20
                },
                useHighStocks: true,

                loading: false
            }
            var data = [
                //[1234137500000,0],
                [1234137600000,14.64],
                [1234224000000,13.98],
                [1234310400000,13.83],
                [1234396800000,14.18],
                [1234483200000,14.17],
                [1234828800000,13.50],
                [1234915200000,13.48],
                [1235001600000,12.95],
                [1235088000000,13.00],
                [1235347200000,12.42],
                [1235433600000,12.89],
                [1235520000000,13.02],
                [1235606400000,12.74],
                [1235692800000,12.76],
                [1235952000000,12.56]
            ]

            //$scope.chartConfig.series.shift();
            //series.visible && series.hide();


            $scope.chartConfig.series.push(
                {
                    animation: {
                        duration: 15000
                    },
                    data: createSeries(res.data),
                    name: 'client',
                    color:'#407dbe',
                    xAxis: 1,
                    yAxis: 1,
                    lineWidth: 3,
                    fillOpacity:0,
                    marker: {
                        enabled: true
                    }
                }
            )
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

