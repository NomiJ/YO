var express = require('express'),
    config = require('./config'),
    errorHandler = require('errorhandler'),
    http = require('http'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    server;

// MongoDB Connection
mongoose.connect(config.db);

var mongodbConnect = mongoose.connection;
mongodbConnect.on('error', function () {
    console.error.bind(console, 'connection error:').apply(console, arguments)
});
mongodbConnect.once('open', function () {
    console.log('mongodb Connected');
});

var app = express();
server = http.createServer(app);
require("./controllers/socket")(server);

app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        return res.send(200);
    }
    next();
});

// Gets data with Database
app.use('/api', require('./routes'));

app.all('*', function (req, res) {
    res.status(400).send('Bad request');
});
// Error handler
app.use(errorHandler());

server.listen(config.port, function () {
    console.info('Server listening on port ' + this.address().port);
});