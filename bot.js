/* Configure the Twitter API */
var TWITTER_CONSUMER_KEY = '';
var TWITTER_CONSUMER_SECRET = '';
var TWITTER_ACCESS_TOKEN = '';
var TWITTER_ACCESS_TOKEN_SECRET = '';

var WOLFRAM-TOKEN = ""; /* Configure the wolfram API */


var TWITTER_SEARCH_PHRASE = '#waatbot'; /* Set Twitter search phrase */

var INTERVAL = 30*60*1000; /*30 minutes (in microsecondes)*/

var wolfram = require('wolfram-alpha').createClient(WOLFRAM-TOKEN);
var split = require('split-string-words');
var Twit = require('twit');

var T = new Twit({
	consumer_key: TWITTER_CONSUMER_KEY,
	consumer_secret: TWITTER_CONSUMER_SECRET,
	access_token: TWITTER_ACCESS_TOKEN, 
	access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
});

console.log('The bot is running...');
/* handle our error response for tweets */
function tweeted(err, data, response) {
	if (err) {
		console.log('Unable to retweet, : ' + err);
	}
	else {		
		console.log('Replied with: ' + data.text);
	}
}
/*handle our latest tweets from our search*/
function latest_tweet(err, data, response) {
	if (err) {
		console.log('Unable to find latest tweets :( : ' + err);
	}
	else {
		for(var status in data.statuses){ //get all our incoming tweets
			console.log(data.statuses[status].user.screen_name);			
			var splitted = split(data.statuses[status].text);
			var question = ""
			for (var i in splitted) { //making sure to strip out hashtags
				console.log('split: ' + splitted[i]);
				if(splitted[i][0] == '#'){ 

				}else
				{
					question = question + ' ' + splitted[i]; //construct question
				}
			}
			console.log('Answering question: ' + question);

			wolfram.query(question, function (err, result) { //query our question to wolfram
			  if (err) {
			  	console.log(err);
			  	throw err;

			  }else{
				  	var id = {
					in_reply_to_status_id : data.statuses[status].id_str,
					status: '@' + data.statuses[status].user.screen_name + ' ' + result[0].subpods[0].text + ' ' + result[1].subpods[0].text
					}
				  	console.log("Responding: " + id.status);
					T.post('statuses/update', id, tweeted); //respond answer to user
			  }
			});
							
		}	
	}
}

function start_answering() {
	var query = {
		q: TWITTER_SEARCH_PHRASE,
		result_type: "recent"
	}
	T.get('search/tweets', query, latest_tweet);	
	/* Set an interval */
	setInterval(start_answering, INTERVAL);
}
/* Initiate the Bot */
start_answering();