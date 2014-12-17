var express = require('express');
var app = express();
var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');
var config = require('./config.js');

var db = require('./db.js');

var http = require('http');

var send_alert = function (msg) {

    //Documentation at : https://mandrillapp.com/api/docs/messages.nodejs.html#method=send
    var mandrill = require('mandrill-api/mandrill');
    var mandrill_client = new mandrill.Mandrill(config.mandrill.clientId);

    console.log(msg);

    var message = {
        "html": msg.body,
        "text": "Here should be a information about ODK Visit",
        "subject": msg.title,
        "from_email": "automated@hivhaiti.org",
        "from_name": "Caris Foundation - HIVHAITI",
        "to":  msg.receipent,
        "headers": {
            "Reply-To": "support@hivhaiti.org"
        },
        "important": false,
        "track_opens": null,
        "track_clicks": null,
        "auto_text": null,
        "auto_html": null,
        "inline_css": null,
        "url_strip_qs": null,
        "preserve_recipients": null,
        "view_content_link": null,
        "bcc_address": "admin@hivhaiti.org",
        "tracking_domain": null,
        "signing_domain": null,
        "return_path_domain": null,
        "tags": [
            "Notification",
            "odkVisits"
        ]
    };
    var async = true;
    var ip_pool = "Main Pool";
    //Scheduling is allowed only for paid subscribers
    //var send_at = "2014-03-20 09:46:00";
    mandrill_client.messages.send({
        "message": message,
        "async": async,
        "ip_pool": ip_pool
    }, function (result) {
        console.log(result);

    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
}


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

        var msg = new Object();
        msg.title = "";
        msg.body = "";
        //For TEST
        msg.receipent = [];

        if(form_data['health_status']==2 || form_data['patient_health_status']==2){
//            console.log("ATTENTION: PATIENT IS UNWELL");
            msg.title+= "[ALERT] ";   
        } 

        msg.body+= meta_data['n1:username'][0] + ' has made a visit to ' + (form_data['patient_code'] || form_data['health_id']) + '<br><br>';
        msg.body+= 'Reason of visit: ' + form_data['type_of_visit'] + '<br><br>';
        msg.body+= 'Plan of action: ' + form_data['plan_of_action'] + '<br><br>';
        msg.body+= "Access patient details at " + config.commcare.host + "reports/case_data/" + case_data['case_id'] + '/#!history'+ '<br><br>';

        msg.body+= "List of visits by health agent:  " + meta_data['n1:username'][0] + '<br>';
        msg.body+= config.commcare.host + "reports/submit_history/" + "?emw=u__" + meta_data['n1:userID'] + '<br>';

        //TODO: Add if urgent in patient_code
        msg.title+= "Visit for " + (form_data['patient_code'] || form_data['health_id'])  + " by " + meta_data['n1:username'][0];

//        send_alert(b);

        //For debugging
        // for(var i in form_data) {
        //     if(typeof(i)!=="object"){
        //         console.log(i + ": " + result['data'][i]);
        //     }
        // }
        console.log(msg);
        res.end("Received");

        db.findAlertEmail(meta_data['n1:username'][0], function(email) {
            msg.receipent = email;
            console.log("receipent--->");
            console.log(msg.receipent);
            send_alert(msg);
            });
        });

    });

}).listen(config.server.port);
console.log('Server running at ' + config.server.address + ':' + config.server.port);
