var keys = require("./key.js");
var inquirer = require('inquirer');
var fs = require('file-system');
//var twitterUsername;
inquirer.prompt([
	{
		type: "input",
		message:"State what you would like LIRI to do:",
		name: "action"
	}
]).then(function (answers){
    if(answers.action.toLowerCase() === "my-tweets"){
    	var Twitter = require('twitter');
 
		var client = new Twitter({
 			consumer_key: keys.twitterKeys.consumer_key,
  			consumer_secret: keys.twitterKeys.consumer_secret,
  			access_token_key: keys.twitterKeys.access_token_key,
  			access_token_secret: keys.twitterKeys.access_token_secret
		});
		var params = {screen_name: "sfrunner1188"};
		client.get('statuses/user_timeline', params, function(error, tweets, response) {
  			if (!error) {
  				console.log("Latest 20 Tweets for " + params.screen_name);
  				console.log("");
    			tweets.forEach(function(tweet){
    				console.log("Tweet was created at " + tweet.created_at + " and the person tweeted " + tweet.text);
    			});
  			}
		});
    }

    else if(answers.action.toLowerCase() === "spotify-this-song"){
    	inquirer.prompt([
    		{
    			type: "input",
    			message: "What song should I look up?",
    			name: "song",
    			default: "The Sign"
    		}
    	]).then(function(answers){
    		var spotify = require('spotify');
			spotify.search({ type: 'track', query: answers.song, limit: 1 }, function(err, data) {
    			if ( err ) {
        			console.log('Error occurred: ' + err);
        			return;
   				}
 				else if (!err){
 					var number = 1;
 					data.tracks.items.forEach(function(song){
    					var songInformation = {
    						artist: song.artists[0].name,
    						name: song.name,
    						previewLink: song.preview_url,
    						album: song.album.name
    					};
    					console.log("Song #" + number + ": " + JSON.stringify(songInformation, null, 2));
    					console.log("");
    					number++;
    				});
    				number = 1;
 				}
 			});		
    	});
    }
});