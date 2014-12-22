angular.module('App.controllers')
    .controller('homeCtrl', function ($rootScope, $scope, User) {
        $scope.username="";
        $scope.logout=User.logout;
        $scope.addFriend= function () {
            User.socket
                ._on('AddFriend', function (res) {
                    if(res.resultCode==200){
                        if(res.result.exist) return;
                        User.user.friends.push(res.result);
                        $rootScope.$emit('updateUser');
                        $scope.username='';
                        $scope.$$phase||$scope.$digest();
                    }
                })
                .emit('AddFriend', $scope.username);
        }
    })
;
