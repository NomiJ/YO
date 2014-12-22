angular.module('App.controllers')
    .controller('registerCtrl', function ($rootScope,$scope,$state,User) {
        $scope.user={};
        $scope.submit = function (form) {
            $scope.errorMsg=!1;
            if(form.$invalid) return;
            User.register($scope.user, function (res) {
                User.verifyMsg=res;
                User.username=$scope.user.username;
                $rootScope.verifyErr=true;
                $state.go('app.verify');
                $scope.user={};
                $scope.$$phase||$scope.$digest();
            }, function (err) {
                $scope.errorMsg = err;
                $scope.$$phase||$scope.$digest();
            })
        }
    })
;
