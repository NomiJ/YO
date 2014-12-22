angular.module('App.controllers')
    .controller('forgotPasswordCtrl', function ($scope, $state, User) {
        $scope.user={};
        $scope.submit = function (form) {
            $scope.errorMsg=!1;
            if(form.$invalid) return;
            User.resetPassword($scope.user, function (res) {
                User.loginMsg=res;
                $state.go('login');
                $scope.user={};
                $scope.$$phase||$scope.$digest();
            }, function (err) {
                $scope.errorMsg = err;
                $scope.$$phase||$scope.$digest();
            })
        }
    })
;
