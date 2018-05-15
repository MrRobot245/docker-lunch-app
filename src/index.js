var Botkit = require('botkit');
var MongoUrl = process.env.MONGODB_URI || 'mongodb://db:27017/lunchbot';
var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');

var doc = new GoogleSpreadsheet('file-id-here');
function getRandomPlace(callback){
doc.useServiceAccountAuth(creds, function (err) {
	doc.getCells(1, function(err, cells) {
		randomPlace=cells[Math.floor(Math.random() * cells.length)].value;
		callback(randomPlace);
	});

});
}

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT) {
  console.log('Error: Specify CLIENT_ID, CLIENT_SECRET and PORT in environment');
  process.exit(1);
}

var controller = Botkit.slackbot(
  {
    // interactive_replies: true, // tells botkit to send button clicks into conversations
    hostname: '0.0.0.0',
    storage: require('./lib/botkit-custom-mongo')(
      {
        collections: ['lunches'], // Add custom collections
        mongoUri: MongoUrl
      }
    )
  }
).configureSlackApp(
  {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['commands'],
  }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});


//
// BEGIN EDITING HERE!
//

controller.on('slash_command', function (slashCommand, message) {

    switch (message.command) {
        case "/lunch":
            if (message.token !== process.env.VERIFICATION_TOKEN) return; //just ignore it.

				var getMe= getRandomPlace(function(result) {
                slashCommand.replyPrivate(message,
                    "Your should have lunch at: " + result+"!");
						});
                return;
        default:
            slashCommand.replyPublic(message, "I'm afraid I don't know how to " + message.command + " yet");

    }

})
;
