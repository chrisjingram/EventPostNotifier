var graph = require('fbgraph');
var Twitter = require('twitter');
var moment = require('moment');
var async = require("async");

var T = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

var argv = require('minimist')(process.argv.slice(2));

graph.setAccessToken(process.env.GRAPH_ACCESS_TOKEN);

var latestPost;

if(argv.e && argv._){
	
	eventId = argv.e;
	twitterHandles = argv._;

	graph.get(eventId + '/feed',function(err, result){

		console.log(result.data[0].created_time);
		latestPost = moment(result.data[0].created_time);

		setInterval(function(){
			console.log("checking");
			checkForNewPost();
		}, 10000)

	});

}else{
	console.log("Please provide an event id with argument -e and a twitter handle with argument -t")
	process.exit(1)
}

function checkForNewPost(){

	graph.get(eventId + '/feed',function(err, result){
		var eventLastestPostDate = moment(result.data[0].created_time);
		if(eventLastestPostDate.isAfter(latestPost)){

			latestPost = eventLastestPostDate;

			var messagebody = 'New post from ' + result.data[0].from.name + ': ' + result.data[0].message;
			console.log("SEND MESSAGE", messagebody);

			async.each(twitterHandles, function(handle, callback){
				T.post('direct_messages/new',{screen_name: handle, text: messagebody},function(err, tweets, response){
					if(err){
						console.log(err);
					}else{
						console.log(true);
					}
				});
			});

		}
	});

}

