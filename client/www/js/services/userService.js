angular.module('App.services')
    .service('User', function ($http,Main) {
        var self = this, baseUrl=Main.baseUrl||"", token=localStorage.token||!1, socket, func=function(){};
        function log(){
            console.log.apply(console,arguments);
        }
        self.getToken=function(){
            return token||localStorage.token;
        };
        self.setToken=function(t){
            token=localStorage.token=t;
        };
        self.logout = function(){
            token=!1;
            delete localStorage.token;
            self.socket.disconnect();
        };
        self.isLogin = function () {
            return !!self.getToken()
        };

        self.msgHandler=function(err,cb){
            if(err===null) return cb("Check your internet connection.");
            if (err.resultCode!=500 && typeof err.message === "string") {
                cb(err.message);
            }else if(err.resultCode==500){
                cb("Internal Server Error.");
                log(err);
            }
        };

        self.register = function (obj, success, error) {
            success = typeof success === "function"?success:func;
            error = typeof error === "function"?error:func;
            $http.post(baseUrl+'/api/register', obj)
                .success(success)
                .error(function (err) {self.msgHandler(err,error)});
        };

        self.login = function (obj, success, error) {
            success = typeof success === "function"?success:func;
            error = typeof error === "function"?error:func;
            $http.post(baseUrl+'/api/login', obj)
                .success(success)
                .error(function (err) {self.msgHandler(err,error)});
        };

        self.verifyAccount = function (obj, success, error) {
            success = typeof success === "function"?success:func;
            error = typeof error === "function"?error:func;
            $http.post(baseUrl+'/api/verifyAccount', obj)
                .success(success)
                .error(function (err) {self.msgHandler(err,error)});
        };

        self.resendVerifyCode = function (obj, success, error) {
            success = typeof success === "function"?success:func;
            error = typeof error === "function"?error:func;
            $http.post(baseUrl+'/api/resendVerifyCode', obj||{username:self.username})
                .success(success)
                .error(function (err) {self.msgHandler(err,error)});
        };

        self.resetPassword = function (obj, success, error) {
            success = typeof success === "function"?success:func;
            error = typeof error === "function"?error:func;
            $http.post(baseUrl+'/api/forgotPassword', obj)
                .success(success)
                .error(function (err) {self.msgHandler(err,error)});
        };

        self.socket = {
            _callback:{},
            _tmpCallback:{},
            _call: function (name,arg) {
                if(self.socket._callback[name]){
                    self.socket._callback[name].forEach(function (v) {
                        if(typeof v==="function") v.apply(this,arg);
                    });
                }
                if(typeof self.socket._tmpCallback[name]==="function")
                    self.socket._tmpCallback[name].apply(this,arg);
            },
            connect:function(){
                token = self.getToken();
                if(!token) return self.socket;
                if (socket && socket.connected) return self.socket;
                socket=io.connect(baseUrl,{
                    query:{token:token},
                    forceNew:true
                });
                socket
                    .on('connect', function () {
                        log('connected');
                    })
                    .on('User', function (data) {
                        if(data.result === null) {
                            self.logout();
                            self.socket.disconnect();
                            return log("User not found");
                        }
                        self.socket._call('User',arguments);
                        log('User',data)
                    })
                    .on('onMsg', function (data) {
                        self.socket._call('onMsg',arguments);
                        log('onMsg', data);
                    })
                    .on('AddFriend', function (data) {
                        self.socket._call('AddFriend',arguments);
                        log('AddFriend', data);
                    })
                    .on('ImportContacts', function (data) {
                        self.socket._call('ImportContacts',arguments);
                        log('ImportContacts', data);
                    })
                    .on('AddGroup', function (data) {
                        self.socket._call('AddGroup',arguments);
                        log('AddGroup', data);
                    })
                    .on('DeleteFriend', function (data) {
                        self.socket._call('DeleteFriend',arguments);
                        log('DeleteFriend', data);
                    })
                    .on('DeleteGroup', function (data) {
                        self.socket._call('DeleteGroup',arguments);
                        log('DeleteGroup', data);
                    })
                    .on('error', function (err) {
                        if(err.code=='invalid_token' || err.type=="UnauthorizedError"){
                            self.logout();
                            self.socket.disconnect();
                        }
                        log('error', err);
                    })
                    .on('disconnect',function(){
                        self.socket._call('disconnect',arguments);
                        log('disconnect');
                    })
                ;
                return self.socket;
            },
            disconnect: function () {
                if(socket){
                    socket.disconnect();
                    socket.destroy();
                    socket.io.close();
                }
                return self.socket;
            },
            on: function(name, func){
                if(!socket) return self.socket;
                if(typeof name!=="string") return self.socket;
                if(typeof func!=="function") return self.socket;
                if(Array.isArray(self.socket._callback[name])){
                    self.socket._callback[name].push(func);
                }else{
                    self.socket._callback[name]=[func];
                }
                return self.socket;
            },
            _on: function(name, func){
                if(!socket) return self.socket;
                if(typeof name!=="string") return self.socket;
                if(typeof func!=="function") return self.socket;
                self.socket._tmpCallback[name]=func;
                return self.socket;
            },
            emit: function (name) {
                if(!socket) return self.socket;
                if(typeof name!=="string") return self.socket;
                var arg = [name].concat([].slice.call(arguments,1));
                socket.emit.apply(socket,arg);
                return self.socket;
            }
        };
    })
;