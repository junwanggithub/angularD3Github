//import $ from 'jquery'
import bootStrapObj from './angular-bootstrap'
//import 'highcharts'
import 'highcharts-ng'
import linechart from './components/highchart/linechart.js'


var appModule = bootStrapObj.init([
    //'highcharts',
    'highcharts-ng',
    linechart
]);

appModule.run(["$log",($log) => {
    $log.info('highchart-index.js loaded');
}])