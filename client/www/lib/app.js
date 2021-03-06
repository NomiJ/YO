angular.module("App", [ "ionic", "App.controllers", "App.services" ]).config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/"), $stateProvider.state("app", {
        url: "",
        "abstract": !0,
        controller: "mainCtrl",
        templateUrl: "templates/main.html"
    }).state("app.login", {
        cache: !1,
        url: "/login",
        controller: "loginCtrl",
        templateUrl: "templates/login.html",
        authenticate: !1
    }).state("app.register", {
        url: "/register",
        controller: "registerCtrl",
        templateUrl: "templates/register.html",
        authenticate: !1
    }).state("app.verify", {
        cache: !1,
        url: "/verify",
        controller: "verifyCtrl",
        templateUrl: "templates/verify.html",
        authenticate: !1
    }).state("app.forgotPassword", {
        url: "/forgotPassword",
        controller: "forgotPasswordCtrl",
        templateUrl: "templates/forgotPassword.html",
        authenticate: !1
    }).state("app.home", {
        url: "/",
        controller: "homeCtrl",
        templateUrl: "templates/home.html",
        authenticate: !0
    }).state("app.friends", {
        cache: !1,
        url: "/friends",
        controller: "friendsCtrl",
        templateUrl: "templates/friends.html",
        authenticate: !0
    }).state("app.createGroup", {
        cache: !1,
        url: "/createGroup",
        controller: "createGroupCtrl",
        templateUrl: "templates/createGroup.html",
        authenticate: !0
    });
}).run(function($rootScope, $ionicPlatform, $state, User) {
    $ionicPlatform.ready(function() {
        window.cordova && window.cordova.plugins.Keyboard && cordova.plugins.Keyboard.hideKeyboardAccessoryBar(!0), 
        window.StatusBar && StatusBar.styleDefault();
    }), $state.back = function() {
        $state.go($state.previous && $state.previous.name ? $state.previous.name : "app.login");
    }, $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState) {
        $state.previous = fromState, toState.authenticate === !1 && User.isLogin() ? (event.preventDefault(), 
        fromState.name || $state.go("app.home")) : toState.authenticate !== !0 || User.isLogin() || (event.preventDefault(), 
        fromState.name || $state.go("app.login"));
    });
}), angular.module("App.controllers", []), angular.module("App.services", []), angular.module("App.directives", []), 
angular.module("App.controllers").controller("createGroupCtrl", function($rootScope, $scope, $state, User, $ionicPopup) {
    $scope.group = {}, $scope.friends = User.user.friends, $scope.submit = function() {
        return $scope.group.name ? ($scope.group.users = $scope.friends.filter(function(v) {
            return v.checked;
        }), $scope.group.users = $scope.group.users.map(function(v) {
            return v._id;
        }), $scope.group.users.length ? void User.socket._on("AddGroup", function(res) {
            if (200 == res.resultCode) {
                if (res.result.exist) return;
                User.user.groups.push(res.result), $rootScope.$emit("updateUser"), $scope.group = {}, 
                $scope.$$phase || $scope.$digest();
            }
        }).emit("AddGroup", $scope.group.name, $scope.group.users) : $ionicPopup.alert({
            title: "Error!",
            template: "Please select any one"
        })) : $ionicPopup.alert({
            title: "Error!",
            template: "Please enter a group name"
        });
    };
}), angular.module("App.controllers").controller("forgotPasswordCtrl", function($scope, $state, User) {
    $scope.user = {}, $scope.submit = function(form) {
        $scope.errorMsg = !1, form.$invalid || User.resetPassword($scope.user, function(res) {
            User.loginMsg = res, $state.go("login"), $scope.user = {}, $scope.$$phase || $scope.$digest();
        }, function(err) {
            $scope.errorMsg = err, $scope.$$phase || $scope.$digest();
        });
    };
}), angular.module("App.controllers").controller("friendsCtrl", function($rootScope, $scope, $state, User) {
    $scope.friends = User.user.friends.concat(User.user.groups.map(function(v) {
        return v.isGroup = !0, v;
    })), User.socket._on("onMsg", function(obj) {
        $scope.friends.forEach(function(v) {
            v._id == obj.id && (v.msg = obj.msg, setTimeout(function() {
                v.msg = "", $scope.$$phase || $scope.$digest();
            }, 3e3), $scope.$$phase || $scope.$digest());
        });
    }), $scope.sendMsg = function(index) {
        var id, user = $scope.friends[index];
        id = user.isGroup ? user.users.map(function(v) {
            return v._id;
        }) : user._id, User.socket.emit("sendMsg", id);
    }, $scope["delete"] = function(index) {
        var user = $scope.friends[index];
        user.isGroup ? User.socket._on("DeleteGroup", function(res) {
            200 == res.resultCode;
        }).emit("DeleteGroup", user.name) : User.socket._on("DeleteFriend", function(res) {
            200 == res.resultCode;
        }).emit("DeleteFriend", user.username), $scope.friends.splice(index, 1);
    }, $scope.on = function() {}, $scope.off = function() {};
}), angular.module("App.controllers").controller("homeCtrl", function($rootScope, $scope, User) {
    $scope.username = "", $scope.logout = User.logout, $scope.addFriend = function() {
        User.socket._on("AddFriend", function(res) {
            if (200 == res.resultCode) {
                if (res.result.exist) return;
                User.user.friends.push(res.result), $rootScope.$emit("updateUser"), $scope.username = "", 
                $scope.$$phase || $scope.$digest();
            }
        }).emit("AddFriend", $scope.username);
    };
}), angular.module("App.controllers").controller("loginCtrl", function($rootScope, $scope, $state, User) {
    User.loginMsg && ($scope.success = User.loginMsg, delete User.loginMsg), $scope.user = {}, 
    $scope.submit = function(form) {
        $scope.errorMsg = !1, form.$invalid || User.login($scope.user, function(res) {
            User.setToken(res), $rootScope.$emit("user"), $state.go("app.home"), $scope.user = {}, 
            $scope.$$phase || $scope.$digest();
        }, function(err) {
            /verif*/.test(err) ? (User.username = $scope.user.username, $rootScope.verifyErr = !0) : $rootScope.verifyErr = !1, 
            $scope.errorMsg = err, $scope.$$phase || $scope.$digest();
        });
    };
}), angular.module("App.controllers").controller("mainCtrl", function($rootScope, $scope, $state, User) {
    function getUser() {
        User.socket.connect()._on("User", function(res) {
            200 == res.resultCode && (res.result.groups || (res.result.groups = []), $scope.user = User.user = res.result, 
            $scope.$$phase || $scope.$digest());
        }).emit("User").on("disconnect", function() {
            $scope.user = !1, $state.go("app.login"), $scope.$$phase || $scope.$digest();
        });
    }
    getUser(), $rootScope.$on("user", function(e, disconnect) {
        disconnect ? (User.logout(), $scope.user = !1, $scope.$$phase || $scope.$digest()) : getUser();
    }), $rootScope.$on("updateUser", function() {
        $scope.user = User.user, $scope.$$phase || $scope.$digest();
    });
}), angular.module("App.controllers").controller("registerCtrl", function($rootScope, $scope, $state, User) {
    $scope.user = {}, $scope.submit = function(form) {
        $scope.errorMsg = !1, form.$invalid || User.register($scope.user, function(res) {
            User.verifyMsg = res, User.username = $scope.user.username, $rootScope.verifyErr = !0, 
            $state.go("app.verify"), $scope.user = {}, $scope.$$phase || $scope.$digest();
        }, function(err) {
            $scope.errorMsg = err, $scope.$$phase || $scope.$digest();
        });
    };
}), angular.module("App.controllers").controller("verifyCtrl", function($rootScope, $scope, $state, User) {
    return $rootScope.verifyErr ? (User.verifyMsg && ($scope.success = User.verifyMsg, 
    delete User.verifyMsg), $scope.user = {}, $scope.submit = function(form) {
        $scope.errorMsg = !1, form.$invalid || User.verifyAccount($scope.user, function(res) {
            User.setToken(res), $rootScope.$emit("user"), $state.go("app.home"), $scope.user = {}, 
            $scope.$$phase || $scope.$digest();
        }, function(err) {
            $scope.errorMsg = err, $scope.$$phase || $scope.$digest();
        });
    }, void ($scope.resendCode = function() {
        $scope.success = !1, User.resendVerifyCode(null, function(res) {
            $scope.success = res, $scope.$$phase || $scope.$digest();
        }, function(err) {
            $scope.errorMsg = err, $scope.$$phase || $scope.$digest();
        }), $scope.$$phase || $scope.$digest();
    })) : $state.back();
}), angular.module("App.services").service("Main", function() {
    this.baseUrl = "http://localhost:8000";
}), angular.module("App.services").service("User", function($http, Main) {
    function log() {
        console.log.apply(console, arguments);
    }
    var socket, self = this, baseUrl = Main.baseUrl || "", token = localStorage.token || !1, func = function() {};
    self.getToken = function() {
        return token || localStorage.token;
    }, self.setToken = function(t) {
        token = localStorage.token = t;
    }, self.logout = function() {
        token = !1, delete localStorage.token, self.socket.disconnect();
    }, self.isLogin = function() {
        return !!self.getToken();
    }, self.msgHandler = function(err, cb) {
        return null === err ? cb("Check your internet connection.") : void (500 != err.resultCode && "string" == typeof err.message ? cb(err.message) : 500 == err.resultCode && (cb("Internal Server Error."), 
        log(err)));
    }, self.register = function(obj, success, error) {
        success = "function" == typeof success ? success : func, error = "function" == typeof error ? error : func, 
        $http.post(baseUrl + "/api/register", obj).success(success).error(function(err) {
            self.msgHandler(err, error);
        });
    }, self.login = function(obj, success, error) {
        success = "function" == typeof success ? success : func, error = "function" == typeof error ? error : func, 
        $http.post(baseUrl + "/api/login", obj).success(success).error(function(err) {
            self.msgHandler(err, error);
        });
    }, self.verifyAccount = function(obj, success, error) {
        success = "function" == typeof success ? success : func, error = "function" == typeof error ? error : func, 
        $http.post(baseUrl + "/api/verifyAccount", obj).success(success).error(function(err) {
            self.msgHandler(err, error);
        });
    }, self.resendVerifyCode = function(obj, success, error) {
        success = "function" == typeof success ? success : func, error = "function" == typeof error ? error : func, 
        $http.post(baseUrl + "/api/resendVerifyCode", obj || {
            username: self.username
        }).success(success).error(function(err) {
            self.msgHandler(err, error);
        });
    }, self.resetPassword = function(obj, success, error) {
        success = "function" == typeof success ? success : func, error = "function" == typeof error ? error : func, 
        $http.post(baseUrl + "/api/forgotPassword", obj).success(success).error(function(err) {
            self.msgHandler(err, error);
        });
    }, self.socket = {
        _callback: {},
        _tmpCallback: {},
        _call: function(name, arg) {
            self.socket._callback[name] && self.socket._callback[name].forEach(function(v) {
                "function" == typeof v && v.apply(this, arg);
            }), "function" == typeof self.socket._tmpCallback[name] && self.socket._tmpCallback[name].apply(this, arg);
        },
        connect: function() {
            return (token = self.getToken()) ? socket && socket.connected ? self.socket : (socket = io.connect(baseUrl, {
                query: {
                    token: token
                },
                forceNew: !0
            }), socket.on("connect", function() {
                log("connected");
            }).on("User", function(data) {
                return null === data.result ? (self.logout(), self.socket.disconnect(), log("User not found")) : (self.socket._call("User", arguments), 
                void log("User", data));
            }).on("onMsg", function(data) {
                self.socket._call("onMsg", arguments), log("onMsg", data);
            }).on("AddFriend", function(data) {
                self.socket._call("AddFriend", arguments), log("AddFriend", data);
            }).on("ImportContacts", function(data) {
                self.socket._call("ImportContacts", arguments), log("ImportContacts", data);
            }).on("AddGroup", function(data) {
                self.socket._call("AddGroup", arguments), log("AddGroup", data);
            }).on("DeleteFriend", function(data) {
                self.socket._call("DeleteFriend", arguments), log("DeleteFriend", data);
            }).on("DeleteGroup", function(data) {
                self.socket._call("DeleteGroup", arguments), log("DeleteGroup", data);
            }).on("error", function(err) {
                ("invalid_token" == err.code || "UnauthorizedError" == err.type) && (self.logout(), 
                self.socket.disconnect()), log("error", err);
            }).on("disconnect", function() {
                self.socket._call("disconnect", arguments), log("disconnect");
            }), self.socket) : self.socket;
        },
        disconnect: function() {
            return socket && (socket.disconnect(), socket.destroy(), socket.io.close()), self.socket;
        },
        on: function(name, func) {
            return socket ? "string" != typeof name ? self.socket : "function" != typeof func ? self.socket : (Array.isArray(self.socket._callback[name]) ? self.socket._callback[name].push(func) : self.socket._callback[name] = [ func ], 
            self.socket) : self.socket;
        },
        _on: function(name, func) {
            return socket ? "string" != typeof name ? self.socket : "function" != typeof func ? self.socket : (self.socket._tmpCallback[name] = func, 
            self.socket) : self.socket;
        },
        emit: function(name) {
            if (!socket) return self.socket;
            if ("string" != typeof name) return self.socket;
            var arg = [ name ].concat([].slice.call(arguments, 1));
            return socket.emit.apply(socket, arg), self.socket;
        }
    };
});