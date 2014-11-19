var express = require('express');
var app = express();
var util = require('util');
var fs = require('fs');

SERVER_ADDRESS = "";
SERVER_PORT = 3000;

var http = require('http');
http.createServer(function(req, res) {

    console.log(req);

    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    var body = "";
    req.on('data', function(chunk) {
        body += chunk;
    });

    body += "\n";

    req.on('end', function() {
        console.log('POSTed: ' + body);
        res.writeHead(200);
        fs.appendFile('message.txt', body, function(err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        });

        res.end("Received");
    });

}).listen(SERVER_PORT);
console.log('Server running at ' + SERVER_ADDRESS + ':' + SERVER_PORT);