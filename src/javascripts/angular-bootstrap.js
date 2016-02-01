// Import angular
import 'angular/angular.js';
// Material design css
import 'angular-material/angular-material.css';
// Icons
//import 'font-awesome/css/font-awesome.css';
// Materail Design lib
import angularMaterial from 'angular-material';
// Router
import angularUIRouter from 'angular-ui-router';
//Icons
import angularMaterialIcons from 'angular-material-icons';
//Controllers
import navigationController from './controllers/navigationController'
//Filters
import filterModule from './filters/filterModules'

var init = function(customizedModules){
    "use strict";
    customizedModules = customizedModules || [];
    var dependenciesModules = bootStrapObj.sharedModules.concat(customizedModules)
    return angular.module('demo', dependenciesModules)
        .config(['$mdThemingProvider', function($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('orange');
        }])
        .controller('navigationController',['$scope', navigationController]);
}

var bootStrapObj = {
    appModuleName: 'demo',
    init: init,
    sharedModules: [
        angularMaterial,
        angularUIRouter,
        angularMaterialIcons,
        filterModule]
}



export default bootStrapObj;