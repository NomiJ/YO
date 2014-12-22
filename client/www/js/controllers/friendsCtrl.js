angular.module('App.controllers')
    .controller('friendsCtrl', function ($rootScope, $scope, $state,User) {
        $scope.friends=User.user.friends.concat(User.user.groups.map(function (v) {
            v.isGroup=true;
            return v
        }));
        User.socket._on('onMsg', function(obj){
            $scope.friends.forEach(function (v) {
                if(v._id==obj.id){
                    v.msg=obj.msg;
                    setTimeout(function(){
                        v.msg="";
                        $scope.$$phase||$scope.$digest();
                    },3000);
                    $scope.$$phase||$scope.$digest();
                }
            });
        });
        $scope.sendMsg=function(index){
            var id,user=$scope.friends[index];
            if(user.isGroup){
                id=user.users.map(function (v) {
                    return v._id
                });
            }else id=user._id;
            User.socket
                .emit('sendMsg', id);
        };
        $scope.delete= function (index) {
            var user=$scope.friends[index];
            if(user.isGroup){
                User.socket
                    ._on('DeleteGroup', function (res) {
                        if(res.resultCode==200){
                        }
                    })
                    .emit('DeleteGroup',user.name);
            }else{
                User.socket
                    ._on('DeleteFriend', function (res) {
                        if(res.resultCode==200){
                        }
                    })
                    .emit('DeleteFriend',user.username);
            }
            $scope.friends.splice(index,1)
        };
        $scope.on=function(){};
        $scope.off=function(){};
    })
;
