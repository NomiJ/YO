"use strict";

var request = require('request');
var type = 0;

var config = require('../config');

module.exports = function (number, text, callback) {
    var url = "http://" + config.sms.server + ":" + config.sms.defaultHttpPort + "/" + config.sms.path;
    var timer = setTimeout(function () {
        console.log("sms: timeout");
        callback("timeout")
    },20000);

    request.post({url:url, form: {
        type:type,
        phone:number,
        msg:text
    }}, function(err,res,body){
        clearTimeout(timer);
        if(!res) return callback(new Error("SMS Server error"));
        console.log("Got statusCode: " + res.statusCode);
        if(err) return callback(err);

        body = body.trim();
        if(typeof body !== "object"){
            try{
                body = JSON.parse(body);
            }catch (e){
                return callback(new Error("Response parsing failed"));
            }
        }
        if(body.result) return callback(null, body.message);
        else return callback(new Error(body.message));
    });
};