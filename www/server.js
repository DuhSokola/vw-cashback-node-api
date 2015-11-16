#!/usr/bin/env node

'use strict';

var debug = require('debug')('restapi');
var libs = process.cwd() + '/libs/';
var express = require('express');
var log = require(libs + 'log')(module);
var mysql = require('mysql');
var bodyParser = require('body-parser');
var validate = require('express-validation');
var validation = require('./validation');
var fs = require('fs');


var app = express();

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abc123',
    database: 'vw_autofruehling'
});

app.use(bodyParser.json({limit: '10mb'}));
app.use(validate(validation));

app.post('/api/customers', validate(validation.customer), function (req, res) {
        connection.query('INSERT INTO cashback_data SET ?', req.body.data, function (err, result) {
            if (!err) {
                var string = req.body.data.upload_file;

                var regex = /^data:.+\/(.+);base64,(.*)$/;

                var matches = string.match(regex);
                var ext = matches[1];
                var data = matches[2];
                var buffer = new Buffer(data, 'base64');
k
                fs.writeFile("file.pdf", buffer, function(err) {
                    console.log(err);
                });

                res.status(200).send(result);
            }
            else {
                console.log(err);
                res.send(err);
            }
        });
    }
);

app.get('/api/customers', function (req, res) {
    console.log(req.body);

    connection.query('SELECT * from cashback_data', function (err, rows, fields) {
        if (!err) {
            console.log('The solution is: ', rows);
            res.send(rows);
        }
        else {
            console.log(err);
            res.send(err);
        }
    });
});

app.use(function(err, req, res, next){
    console.log(req.body.data);
    res.status(400).json(err);
});

app.set('port', process.env.PORT || 3002);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + app.get('port'));
    log.info('Express server listening on port ' + app.get('port'));
});



/*
 app.get('/api/customers/file', function (req, res) {

 connection.query('SELECT upload_file from cashback_data order by upload_file limit 1', function (err, row, fields) {
 if (!err) {
 res.download('/PDFTEST.pdf');
 }
 else {
 console.log(err);
 res.send(err);
 }
 });
 });
 */