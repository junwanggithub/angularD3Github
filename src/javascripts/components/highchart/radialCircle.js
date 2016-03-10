var moduleName = 'radialCircleModule';

angular.module(moduleName, [])
    .controller('radialCircleController',['$scope', function($scope){
        "use strict";
        var data = 86
        var chartData = [{name: '', color: '#f5a433', y: data},{name: '', color: '#eee', y: 100-data}];
        $scope.name = 'wj'
        $scope.chartConfig = {
            options: {
                //This is the Main Highcharts chart config. Any Highchart options are valid here.
                //will be overriden by values specified below.
                chart: {
                    type: 'pie',
                    //backgroundColor:'#fbfbfb',
                    spacingBottom: 30,
                    plotBackgroundColor: null,
                    plotBorderWidth: 0,
                    plotShadow: false,
                    margin: [0, 0, 0, 0],
                    spacingTop: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                tooltip: {
                    enabled: false
                },
                //tooltip: {
                //    style: {
                //        fontWeight: 'bold'
                //    }
                //},
                plotOptions: {
                    pie: {
                        size:'100%',
                        dataLabels: {
                            enabled: true,
                            distance: -10,
                            style: {
                                color: '#fff',
                                fontSize: '10px',
                                textShadow: "1px 1px #333"
                            }
                        },
                        startAngle: -90,
                        endAngle: 90,
                        borderWidth: 0
                    },
                    series: {
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    }
                }
            },
            //The below properties are watched separately for changes.

            //Series object (optional) - a list of series using normal Highcharts series options.
            series: [{
                //data: [10, 15, 12, 8, 7],
                data: chartData,
                name: 'usage',
                innerSize: '60%'
            }],
            //Title configuration (optional)
            title: {
                text: data + '%',
                align: 'center',
                verticalAlign: 'middle',
                y: 0,
                style: {
                    fontSize: '12px',
                    color: '#717174'
                },
                margin: 20
            },
            //Boolean to control showing loading status on chart (optional)
            //Could be a string if you want to show specific loading text.
            loading: false,
            //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
            //properties currentMin and currentMax provided 2-way binding to the chart's maximum and minimum
            xAxis: {
                currentMin: 0,
                currentMax: 20,
                title: {text: 'values'}
            },
            //Whether to use Highstocks instead of Highcharts (optional). Defaults to false.
            useHighStocks: false,
            //size (optional) if left out the chart will default to size of the div or something sensible.
            size: {
                width: 400,
                height: 300
            },

            //function (optional)
            func: function (chart) {
                //setup some logic for the chart
            }
        }


    }])


export default moduleName

