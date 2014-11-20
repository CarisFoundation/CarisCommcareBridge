var express = require('express');
var app = express();
var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');


SERVER_ADDRESS = "";
SERVER_PORT = 3000;
COMMCARE_URL = "https://www.commcarehq.org/a/caris-test/";

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

        var parser = new xml2js.Parser();

        parser.parseString(body, function (err, result) {
     //   console.dir(result);

        form_data = result['data'];
        case_data = form_data['n0:case'][0]['$'];
        meta_data = form_data['n1:meta'][0];

        if(form_data['health_status']==2){
            console.log("ATTENTION: PATIENT IS UNWELL");
        } 

        console.log(meta_data['n1:username'][0] + ' has made a visit to ' + form_data['patient_code']);
        console.log('Reason of visit: '+ form_data['type_of_visit']);
        console.log('Plan of action: '+ form_data['plan_of_action']);
        console.log("Access patient details at " + COMMCARE_URL + "reports/case_data/" + case_data['case_id'] + '/#!history');

        //For debugging
        // for(var i in form_data) {
        //     if(typeof(i)!=="object"){
        //         console.log(i + ": " + result['data'][i]);
        //     }
        // }
            console.log('Done');
        });

        res.end("Received");
    });

}).listen(SERVER_PORT);
console.log('Server running at ' + SERVER_ADDRESS + ':' + SERVER_PORT);