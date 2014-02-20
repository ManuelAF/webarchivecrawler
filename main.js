var http = require('http');
var async = require('async');
var fs = require('fs');
var colors = require('colors');

var limit = 30;
var URL = 'http://web.archive.org/web/timemap/link/http://www.elmundo.es';

function get(URL, cb) {
    http.get(URL,function (res) {

        var body;

        res.setEncoding('ascii');

        res.on('data',function (chunk) {
            body += chunk;
        }).on('end', function () {
                cb(null, body);
            })

    }).on('error', function (err) {
            cb(err);
        });
}

async.waterfall([
    function (cb) {
        get(URL, cb);
    }, function (body, cb) {

        var r = /^<(http:\/\/web.archive.org\/web\/\d+\/.*?)>;/gm;
        var n = /^http:\/\/web.archive.org\/web\/(\d+)\/.*?/;
        var url, urls = [];
        while ((url = r.exec(body)) !== null) {
            urls.push(url[1]);
        }
        async.mapLimit(urls, limit, function (url, cb) {
            get(url, function () {
                var filename = n.exec(url);
                fs.writeFile('tmp/' + filename[1] + '.html', body, { encoding : 'ascii' }, function (err) {
                    console.log(url.green);
                    cb(err, 'nada');
                });
            });
        }, function (err, results) {
            cb(err, results);
        });

    }], function (err, results) {
    if (err) {
        console.log(err);
    }
});
