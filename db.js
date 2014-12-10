var mongoose = require('mongoose');
var subscriberData = require('./subscriberData.json');

mongoose.connect('mongodb://localhost/AgentSubscribe');

//TODO: Check for mongodb connection, otherwise handle the error
//TODO: Use following signature to connect to db
//const uri = process.env.MONGO_URI || 'mongodb://localhost/test';
//mongoose.connect(uri, function(err, res) {
//  ...
//});

var AgentSubscribeSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    alert_email: [{
        name: String,
        email: String,
        type: {
            type: String
        } // if we initialize as type: String, then mongoose considers each object in alert_email as String
    }]
}, {
    collection: 'subscriber'
});

var AgentSubscribe = mongoose.model("AgentSubscribe", AgentSubscribeSchema);


if (config.environment == "development") {
    // Clear previously saved database in testing:
    var query = AgentSubscribe.find().remove();
    query.remove({}, function(err, result) {
        console.log("remove query... clears anything that was in db");
        console.log(arguments);
    })
}

//Loads data from subscriberData.json
mongoose.connection.collection('subscriber').insert(subscriberData[config.environment], {
    w: 1
}, function(err, result) {});

//To show all data that has been loaded
AgentSubscribe.find({}).exec(function(err, result) {
    console.log(result);
});

mongoose.findAlertEmail = function(agentName, callback) {
    console.log(arguments);

    AgentSubscribe.findOne({
        'username': agentName
    }).exec(function(err, result) {
        if (err) return handleError(err);

        if (result) {
            callback(result['alert_email']);
        } else {
            console.log("no subscriber found for the agent")
        }
    });
}

module.exports = mongoose;