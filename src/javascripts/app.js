import './asyncModules'
import exclaimify from './exclaimify'
import demoModule from './angular-bootstrap'

const button = document.getElementById('button')

const alertAsyncMessage = function() {
  // CommonJS async syntax webpack magic
  require.ensure([], function() {
    const message = require("./asyncMessage")
    alert(exclaimify(message))
  })
}

console.log(`
  asset references like this one:
    images/gulp.png
  get updated in js too!`)

demoModule.run(["$log",($log) => {
  $log.info('demo running');
}])
