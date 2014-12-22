angular.module('App.controllers')
    .controller('verifyCtrl', function ($rootScope, $scope, $state,User) {
        if(!$rootScope.verifyErr) return $state.back();
        if(User.verifyMsg){
            $scope.success=User.verifyMsg;
            delete User.verifyMsg;
        }
        $scope.user={};
        $scope.submit = function (form) {
            $scope.errorMsg=!1;
            if(form.$invalid) return;
            User.verifyAccount($scope.user, function (res) {
                User.setToken(res);
                $rootScope.$emit('user');
                $state.go('app.home');
                $scope.user={};
                $scope.$$phase||$scope.$digest();
            }, function (err) {
                $scope.errorMsg = err;
                $scope.$$phase||$scope.$digest();
            })
        };
        $scope.resendCode = function () {
            $scope.success=false;
            User.resendVerifyCode(null, function (res) {
                $scope.success=res;
                $scope.$$phase||$scope.$digest();
            }, function (err) {
                $scope.errorMsg = err;
                $scope.$$phase||$scope.$digest();
            });
            $scope.$$phase||$scope.$digest();
        }
    })
;
