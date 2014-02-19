var http = require('http');
var async = require('async');
var request = require('request');
var fs = require('fs');
var colors = require('colors');

var limit = 30;
var URL = 'http://web.archive.org/web/timemap/link/http://www.elmundo.es';

async.waterfall([
    function (cb) {
        request(URL, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                cb(null, body);
            } else {
                cb(err);
            }
        });
    }, function (body, cb) {
        var r = /^<(http:\/\/web.archive.org\/web\/\d+\/.*?)>;/gm;
        var n = /^http:\/\/web.archive.org\/web\/(\d+)\/.*?/;
        var url, urls = [];
        var filename;
        while ((url = r.exec(body)) !== null) { urls.push(url[1]); }
        async.mapLimit(urls, limit, function (url, cb) {
            request(url, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    filename = n.exec(url);
                    fs.writeFileSync('tmp/' + filename[1] + '.html', body, { encoding : 'ascii' });
                    console.log(url.green);
                    cb(null, 'nada');
                } else {
                    console.log(url.red);
                    cb(err);
                }
            });        
        }, function (err, results) {
            cb(err, results);
        });
    }], function(err, results) {
        if (err) {
            console.log(err);
        }
    });
