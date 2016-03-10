//import $ from 'jquery'
import bootStrapObj from './angular-bootstrap'
//import 'highcharts'
import 'highcharts-ng'
import linechart from './components/highchart/linechart.js'
import radialCircle from './components/highchart/radialCircle.js'
import pie from './components/highchart/pie.js'


var appModule = bootStrapObj.init([
    //'highcharts',
    'highcharts-ng',
    linechart,
    radialCircle,
    pie
]);

appModule.run(["$log",($log) => {
    $log.info('highchart-index.js loaded');
}])