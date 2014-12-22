angular.module('App.controllers')
    .controller('createGroupCtrl', function ($rootScope, $scope, $state,User, $ionicPopup) {
        $scope.group={};
        $scope.friends=User.user.friends;
        /*[
         {username: "hafizbilal112"},
         {username: "owaismoon"},
         {username: "nomi"},
         {username: "funter"},
         {username: "OMG"},
         {username: "badBoys",isGroup:true}
         ]*/
        $scope.submit= function () {
            if(!$scope.group.name) return $ionicPopup.alert({
                title:"Error!",
                template:"Please enter a group name"
            });
            $scope.group.users=$scope.friends.filter(function(v){
                return v.checked;
            });
            $scope.group.users=$scope.group.users.map(function (v) {
                return v._id;
            });
            if(!$scope.group.users.length){
                return $ionicPopup.alert({
                    title:"Error!",
                    template:"Please select any one"
                })
            }
            User.socket
                ._on('AddGroup', function(res){
                    if(res.resultCode==200){
                        if(res.result.exist) return;
                        User.user.groups.push(res.result);
                        $rootScope.$emit('updateUser');
                        $scope.group={};
                        $scope.$$phase||$scope.$digest();
                    }
                })
                .emit('AddGroup', $scope.group.name,$scope.group.users)
        }
    })
;
