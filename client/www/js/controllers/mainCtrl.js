angular.module('App.controllers')
    .controller('mainCtrl', function ($rootScope, $scope, $state, User) {
        function getUser(){
            User.socket
                .connect()
                ._on('User', function(res){
                    if(res.resultCode==200) {
                        if(!res.result.groups) res.result.groups=[];
                        $scope.user = User.user = res.result;
                        $scope.$$phase||$scope.$digest();
                    }
                })
                .emit('User')
                .on('disconnect', function(){
                    $scope.user=false;
                    $state.go('app.login');
                    $scope.$$phase||$scope.$digest();
                })
        }
        getUser();
        $rootScope.$on('user', function (e,disconnect) {
            if(disconnect) {
                User.logout();
                $scope.user=false;
                $scope.$$phase||$scope.$digest();
            }else getUser();
        });
        $rootScope.$on('updateUser', function () {
            $scope.user=User.user;
            $scope.$$phase||$scope.$digest();
        });
    })
;
