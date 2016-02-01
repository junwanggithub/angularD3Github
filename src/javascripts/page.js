import exclaimify from './exclaimify'
import bootStrapObj from './angular-bootstrap'

var appModule = bootStrapObj.init([
]);

appModule.run(["$log",($log) => {
    $log.info('page2.js loaded');
}])
