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
var nodemailer = require('nodemailer');
var path = require('path');
var templatesDir = path.resolve(__dirname, 'templates');
var emailTemplates = require('email-templates');
var randomstring = require("randomstring");


var app = express();

app.use(express.static('image'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(validate(validation));


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abc123',
    database: 'vw_autofruehling'
});

var transport = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'dmitry.prudnikov@hotmail.com',
        pass: '100%Pravda'
    }
});

app.post('/api/customers', function (req, res) {


// create reusable transporter object using SMTP transport
        var customerData = req.body.data;

        connection.query('INSERT INTO cashback_data SET ?', customerData, function (err, result) {
            if (!err) {
                var string = customerData.upload_file;

                var regex = /^data:.+\/(.+);base64,(.*)$/;

                var matches = string.match(regex);
                var ext = matches[1];
                var rawBase64Data = matches[2];
                var buffer = new Buffer(rawBase64Data, 'base64');

                var fileDir = './tmp';
                var randomFileName = randomstring.generate() + '.pdf';
                var fullFileName = fileDir + '/' + randomFileName;

                fs.writeFile(fullFileName, buffer, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });

                var customerLocals = {
                    customerData: customerData,
                    recipient: customerData.email
                };

                sendEmail('response_customer', customerLocals, function (err, responseStatus, html, text) {
                    console.log(responseStatus);
                    if (err) {
                        console.log(err);
                    }
                });

                var vwLocals = {
                    customerData: customerData,
                    recipient: 'dmitry.prudnikov@amag.ch',
                    attachment: fullFileName
                };

                sendEmail('response_customer', vwLocals, function (err, responseStatus, html, text) {
                    console.log(responseStatus);
                    if (err) {
                        console.log(err);
                    }
                    fs.unlink(fullFileName, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        res.send('OKAY');
                    });
                });
            }
            else {
                console.log(err);
                res.send(err);
            }
        });
    }
);

function sendEmail(templateName, locals, fn) {

    emailTemplates(templatesDir, function (err, template) {
        if (err) {
            //console.log(err);
            return fn(err);
        }
        // Send a single email
        template(templateName, locals, function (err, html, text) {
            if (err) {
                //console.log(err);
                return fn(err);
            }

            var attachments = [];
            attachments.push({
                filename: 'cashback.jpg',
                path: 'image/cashback.jpg',
                cid: 'unique@cashback.pic'
            });

            if(locals.attachment){
                attachments.push({
                    filename: locals.attachment.split('.')[0],
                    path: locals.attachment
                });
            }

            transport.sendMail({
                from: 'Dmitry Prudnikov <dmitry.prudnikov@hotmail.com>',
                to: locals.recipient,
                subject: 'Empfangsbestätigung Cashback-Antrag',
                html: html,
                generateTextFromHTML: true,
                text: text,
                attachments: attachments
            }, function (err, responseStatus) {
                if (err) {
                    return fn(err);
                }
                return fn(null, responseStatus, html, text);
            });
        });
    });
}


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

app.use(function (err, req, res, next) {
    console.log('ERROR');
    console.log(req.body.data);
    res.status(400).json(err);
});

app.set('port', process.env.PORT || 3002);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + app.get('port'));
    log.info('Express server listening on port ' + app.get('port'));
});
/*
 var transporter = nodemailer.createTransport({
 service: 'hotmail',
 auth: {
 user: 'dmitry.prudnikov@hotmail.com',
 pass: '100%Pravda'
 }
 });

 var emailTemplate = '';

 var mailOptions = {
 from: 'Dmitry Prudnikov <dmitry.prudnikov@hotmail.com>',
 to: 'dmitry.prudnikov@amag.ch',
 subject: 'Hello ✔',
 text: 'Hello world ✔',
 html: emailTemplate
 };

 transporter.sendMail(mailOptions, function(error, info){
 if(error){
 res.status(200).send(result);
 return console.log(error);
 }else {
 console.log(error);
 res.send(error);
 }
 console.log('Message sent: ' + info.response);
 });*/