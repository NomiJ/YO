angular.module('App.controllers')
    .controller('loginCtrl', function ($rootScope, $scope, $state, User) {
        if(User.loginMsg){
            $scope.success=User.loginMsg;
            delete User.loginMsg;
        }
        $scope.user={};
        $scope.submit = function (form) {
            $scope.errorMsg=!1;
            if (form.$invalid) return;
            User.login($scope.user, function (res) {
                User.setToken(res);
                $rootScope.$emit('user');
                $state.go('app.home');
                $scope.user={};
                $scope.$$phase||$scope.$digest();
            }, function (err) {
                if(/verif*/.test(err)){
                    User.username=$scope.user.username;
                    $rootScope.verifyErr=true;
                }
                else $rootScope.verifyErr=false;
                $scope.errorMsg = err;
                $scope.$$phase||$scope.$digest();
            })
        }
    })
;
