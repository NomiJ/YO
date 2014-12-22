module.exports = function (server) {
    var io = require('socket.io').listen(server),
        jwt = require('socketio-jwt'),
        config = require('../config'),
        validator = require('validator'),
        User = require('../models/user');

    io.use(jwt.authorize({
        secret: config.secret,
        handshake: true
    }));

    io.sockets.on('connection', function (socket) {
        var du = socket.decoded_token, self = this, userQuery="username mobileNumber picture friends groups";

        function sendRes(event, data, code){
            code=code || 200;
            data={resultCode:code,result:data};
            socket.emit(event, data)
        }

        socket.join(du.id);

        socket.on('User', function () {
            var event='User';
            User.findById(du.id, userQuery)
                .populate('friends', 'username')
                .populate('groups.users', 'username')
                .exec(function (err, user) {
                if(err) return sendRes(event, err, 500);
                if(!user) return sendRes(event, null, 404);
                sendRes(event, user);
            })
        });

        socket.on('AddFriend', function (username) {
            var event='AddFriend';
            User.findOne({username:username.toLowerCase()}, function (err, friend) {
                if(err) return sendRes(event, err, 500);
                if(!friend) return sendRes(event, null, 404);
                User.findById(du.id)
                    .populate('friends', 'username', {username:username})
                    .exec(function (err, user) {
                        if(err) return sendRes(event, err, 500);
                        if(!user) return sendRes(event, null, 404);
                        if(user.friends.length) return sendRes(event, {exist:true,_id:user.friends[0]._id});
                        user.friends.push(friend);
                        user.save(function (err) {
                            if(err) return sendRes(event, err, 500);
                            var newObj={};
                            newObj._id=friend._id;
                            newObj.username=friend.username;
                            newObj.name=friend.name;
                            sendRes(event, newObj);
                        });
                    });
            })
        });

        socket.on('DeleteFriend', function (username) {
            var event='DeleteFriend';
            User.findById(du.id)
                .populate('friends', 'username', {username:username})
                .populate('groups.users', 'username', {'username':username})
                .exec(function (err, user) {
                    if(err) return sendRes(event, err, 500);
                    if(!user) return sendRes(event, null, 404);
                    if(!user.friends.length) sendRes(event, "Friend not found", 404);
                    var id = user.friends[0]._id;
                    user.friends.remove(id);
                    user.groups.forEach(function (g,i) {
                        g.users.remove(id);
                    });
                    user.save(function (err) {
                        if(err) return sendRes(event, err, 500);
                        sendRes(event, true);
                    });
                });
        });

        socket.on('DeleteGroup', function (name) {
            var event='DeleteGroup';
            User.findById(du.id)
                .exec(function (err, user) {
                    if(err) return sendRes(event, err, 500);
                    if(!user) return sendRes(event, null, 404);
                    if(!user.groups.length) sendRes(event, "Group not found", 404);
                    user.groups.forEach(function (v,i) {
                        if(v.name==name) user.groups.splice(i,1);
                    });
                    user.save(function (err) {
                        if(err) return sendRes(event, err, 500);
                        sendRes(event, true);
                    });
                });
        });

        socket.on('ImportContacts', function (numbers) {
            var event='ImportContacts';
            if(!Array.isArray(numbers) || !numbers.length) return sendRes(event, null, 400);
            User.find({_id:{$in:numbers}}, function (err, users) {
                if(err) return sendRes(event, err, 500);
                if(!users.length) return sendRes(event, null, 404);
                User.findById(du.id, function (err, user) {
                    if(err) return sendRes(event, err, 500);
                    if(!user) return sendRes(event, null, 404);
                    user.friends.addToSet.apply(user.friends, users);
                    user.save(function(err){
                        if(err) return sendRes(event, err, 500);
                        sendRes(event, users.map(function (v) {
                            return {
                                username: v.username,
                                name: v.name,
                                _id: v._id
                            }
                        }));
                    });
                })
            })
        });

        socket.on('AddGroup', function (name, userIds) {
            var event='AddGroup';
            if(!(typeof name==="string")||!name) return sendRes(event, null, 400);
            if(!Array.isArray(userIds) || !userIds.length) return sendRes(event, null, 400);
            User.findOne({_id:du.id, group:{name:name}}, function (err, user) {
                if(err) return sendRes(event, err, 500);
                if(user) return sendRes(event, {exist:true});
                User.find({_id:{$in:userIds}},"username", function (err, users) {
                    if(err) return sendRes(event, err, 500);
                    if(!users.length) return sendRes(event, null, 404);
                    User.findById(du.id, function (err, user) {
                        if(err) return sendRes(event, err, 500);
                        if(!user) return sendRes(event, null, 404);
                        var group = {name: name, users: users};
                        user.groups.push(group);
                        user.save(function (err) {
                            if(err) return sendRes(event, err, 500);
                            sendRes(event, group);
                        });
                    })
                })
            });
        });

        socket.on('sendMsg', function(id){
            var msg="Hi";
            if(typeof id === "string"){
                io.sockets.in(id).emit('onMsg',{id:du.id,msg:msg})
            }else if(Array.isArray(id) && id.length){
                id.forEach(function (v) {
                    if(typeof v === "string")
                        io.sockets.in(v).emit('onMsg',{id:du.id,msg:msg})
                });
            }
        });

    });
};