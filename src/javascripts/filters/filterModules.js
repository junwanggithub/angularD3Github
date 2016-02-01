import timeRange from './timeRange'

var moduleName = 'filterModule'

angular.module(moduleName,[])
    .filter('timeRange', timeRange)

export default moduleName