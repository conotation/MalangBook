'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var fs = require('fs');
var mysql = require('mysql');
var async = require('async');
var crypto = require('crypto');
var multer = require('multer');
var randomString = require('randomstring');

var connection = mysql.createConnection({
    host : 'localhost',
    user : 'prec',
    password : 'connotation',
    database:'malangbook'
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(8001, function(){
    console.log("Server Run");
});

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
  secret: 'precipitation',
  resave: false,
  saveUninitialized: true,
  cookie: {
     maxAge: 60 * 1000 * 60
   }
}));
var router_upload = require('./router/upload')(app, fs, connection, async, crypto, multer, randomString);
var router_login = require('./router/login')(app, fs, connection, async, crypto);
var router_main = require('./router/main')(app, fs, connection, async);
