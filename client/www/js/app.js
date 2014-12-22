angular.module('App', ['ionic', 'App.controllers', 'App.services'])

    .config(function ($stateProvider, $urlRouterProvider) {
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('app', {
                url: "",
                abstract: true,
                controller: 'mainCtrl',
                templateUrl: "templates/main.html"
            })
            .state('app.login',{
                cache: false,
                url: "/login",
                controller: 'loginCtrl',
                templateUrl: "templates/login.html",
                authenticate:false
            })
            .state('app.register',{
                url: "/register",
                controller: 'registerCtrl',
                templateUrl: "templates/register.html",
                authenticate:false
            })
            .state('app.verify',{
                cache: false,
                url: "/verify",
                controller: 'verifyCtrl',
                templateUrl: "templates/verify.html",
                authenticate:false
            })
            .state('app.forgotPassword',{
                url: "/forgotPassword",
                controller: 'forgotPasswordCtrl',
                templateUrl: "templates/forgotPassword.html",
                authenticate:false
            })
            .state('app.home', {
                url: "/",
                controller:'homeCtrl',
                templateUrl: "templates/home.html",
                authenticate:true
            })
            .state('app.friends', {
                cache:false,
                url: "/friends",
                controller:"friendsCtrl",
                templateUrl: "templates/friends.html",
                authenticate:true
            })
            .state('app.createGroup', {
                cache:false,
                url: "/createGroup",
                controller:"createGroupCtrl",
                templateUrl: "templates/createGroup.html",
                authenticate:true
            })
        ;
    })
    .run(function ($rootScope, $ionicPlatform,$state, User) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
        $state.back = function () {
            $state.go($state.previous&&$state.previous.name?$state.previous.name:'app.login');
        };
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $state.previous=fromState;
            if (toState.authenticate === false && User.isLogin()) {
                event.preventDefault();
                if (!fromState.name) $state.go('app.home');
            } else if (toState.authenticate === true && !User.isLogin()) {
                event.preventDefault();
                if (!fromState.name) $state.go('app.login');
            }
        });
    })
;
angular.module('App.controllers', []);
angular.module('App.services', []);
angular.module('App.directives', []);