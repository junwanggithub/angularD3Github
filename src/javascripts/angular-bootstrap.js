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
import NavigationController from './controllers/NavigationController.js'


// Create our demo module

var demoModule = angular.module('demo', [
    angularMaterial,
    angularUIRouter,
    angularMaterialIcons
])
.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('orange');
}])
.controller('navigationController',['$scope', NavigationController]);



export default demoModule;