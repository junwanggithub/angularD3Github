import './asyncModules'
import exclaimify from './exclaimify'
import bootStrapObj from './angular-bootstrap'
import timeline from './components/dashboard/timeline.js'

const button = document.getElementById('button')

const alertAsyncMessage = function() {
  // CommonJS async syntax webpack magic
  require.ensure([], function() {
    const message = require("./asyncMessage")
    alert(exclaimify(message))
  })
}

var appModule = bootStrapObj.init([
  timeline
]);

appModule.run(["$log",($log) => {
  $log.info('demo running');
}])
