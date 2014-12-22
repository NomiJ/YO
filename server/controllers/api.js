var User = require('../models/user'),
    app = require('express')(),
    sendSms = require('./sms'),
    jwt = require('jsonwebtoken'),
    validator = require('validator'),
    config = require('../config');

function random(length) {
    var tmp = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var val = '';
    for (var i = 0; i < length; i++) {
        val += tmp.charAt(Math.floor(Math.random() * tmp.length));
    }
    return val;
}

function sendRes(res, data, code){
    code = code || 200;
    if(code!=200){
        if(code!=500 && typeof data === "string") data={message:data};
        if(typeof data==="object") data.resultCode=code;
    }
    res.status(code).json(data);
}

function sendVerification(user, res, isReset, cb) {
    var token = random(6), expire=1000*60*60;
    if (isReset) {
        user.tmpPassword = token;
        user.tmpPasswordExpires = Date.now() + expire;
    }
    else {
        user.verify.code = token;
        user.verify.expires = Date.now() + expire;
    }
    user.save(function (err) {
        if (err) return sendRes(res, err, 500, code);
        sendSms(user.mobileNumber, (isReset?"Your new temporary password is: ":"Your verification code: ")+token+"\nNote:This will be expired in 24 hours.\nBy "+config.appName, function (err) {
           if (err) {
               user.remove();
               return sendRes(res, err, 500);
           }
            if (typeof cb === "function")
                cb();
            else sendRes(res, isReset?'SMS has been sent to ' + user.mobileNumber + ' with your temporary password.':'SMS has been sent to ' + user.mobileNumber + ' for verify Account with verification code ');
        });

    })
}

exports.resendVerifyCode = function (req, res, next) {
    var body=req.body;
    if(!body.username || !validator.isAlphanumeric(body.username) || !validator.isLength(body.username,4,20))
        return sendRes(res,"Username is Invalid",400);
    User.findOne({username: body.username.toLowerCase()}, function (err, user) {
        if (err) return sendRes(res, err, 500);
        if (!user) return sendRes(res, "Account with that username not exist.", 404);
        sendVerification(user, res)
    })
};

exports.forgotPassword = function (req, res, next) {
    var body = req.body;
    if(!body.username || !validator.isAlphanumeric(body.username) || !validator.isLength(body.username,4,20))
        return sendRes(res,"Username is Invalid",400);
    User.findOne({username: body.username.toLowerCase()}, function (err, user) {
        if (err) return sendRes(res, err, 500);
        if (!user) return sendRes(res, "Account with that Username not exist.", 404);
        sendVerification(user, res, true)
    });
};

exports.verifyAccount = function (req, res, next) {
    var body = req.body;
    if(!body.code || !validator.isAlphanumeric(body.code) || !validator.isLength(body.code,4,8))
        return sendRes(res,"Verify code is Invalid",400);
    User.findOne({'verify.code': body.code,'verify.expires':{$gt:Date.now()}}, function (err, user) {
        if (err) return sendRes(res, err, 500);
        if (!user) return sendRes(res, "Code is invalid or expired", 404);
        user.verify.code="";
        user.verify.isVerified=true;
        user.save(function () {
            if (err) return sendRes(res, err, 500);
            sendRes(res, jwt.sign({id: user._id, email: user.username}, config.secret, {expiresInMinutes: config.sessionExpire || 5}));
        });
    });
};

exports.register = function (req, res) {
    var body = req.body, error="";
    if(!body.username || !validator.isAlphanumeric(body.username) || !validator.isLength(body.username,4,20))
        error+="Username is Invalid\n";
    if(!body.mobileNumber || !validator.isNumeric(body.mobileNumber) || !validator.isLength(body.mobileNumber,10,15))
        error+="Number is invalid\n";
    if(!body.password || !validator.isLength(body.password,4,64))
        error+="Password is invalid\n";
    if(error) return sendRes(res, error, 400);
    var user = new User({
        username: body.username,
        mobileNumber: body.mobileNumber,
        password: body.password
    });
    User.findOne({$or:[{username: body.username.toLowerCase()},{mobileNumber:Number(body.mobileNumber)}]})
        .exec(function (err, exist) {
        if (err) return sendRes(res, err, 500);
        if (exist) return sendRes(res, "Account with that username or mobile number is already exists.", 400);
        user.save(function (err) {
            if (err) return sendRes(res, err, 500);
            sendVerification(user, res);
        });
    })
};

exports.login = function (req, res) {
    var body = req.body, error="", isPass;
    if(!body.username || !validator.isAlphanumeric(body.username) || !validator.isLength(body.username,4,20))
        error+="Username is Invalid\n";
    if(!body.password || !validator.isLength(body.password,4,64))
        error+="Password is invalid\n";
    if(error) return sendRes(res, error, 400);
    User.findOne({username: body.username.toLowerCase()}, function (err, user) {
        if (err) return sendRes(res, err, 500);
        var invalidUserMsg = "Username or password is invalid.";
        if (!user) {
            return sendRes(res, invalidUserMsg, 400);
        }
        if(!user.verify.isVerified) return sendRes(res, "Account is not verified", 400);
        user.comparePassword(body.password, function(err, isMatch){
            if (err) return sendRes(res, err, 500);
            if(isMatch) isPass=true;
            else if(body.password===user.tmpPassword && user.tmpPasswordExpires>Date.now()) isPass=true;
            if(isPass)
                sendRes(res, jwt.sign({id: user._id, email: user.username}, config.secret, {expiresInMinutes: config.sessionExpire || 5}));
            else sendRes(res, invalidUserMsg, 400);
        });
    })
};