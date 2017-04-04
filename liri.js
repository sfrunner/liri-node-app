var keys = require("./key.js");
var inquirer = require("inquirer");
var fs = require("file-system");
var request = require("request");
require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }
 
    var $ = require("jquery")(window);
//var twitterUsername;
inquirer.prompt([
	{
		type: "input",
		message:"State what you would like LIRI to do:",
		name: "action"
	}
]).then(function (answers){
    if(answers.action.toLowerCase() === "my-tweets"){
    	var Twitter = require("twitter");
 
		var client = new Twitter({
 			consumer_key: keys.twitterKeys.consumer_key,
  			consumer_secret: keys.twitterKeys.consumer_secret,
  			access_token_key: keys.twitterKeys.access_token_key,
  			access_token_secret: keys.twitterKeys.access_token_secret
		});
		var params = {screen_name: "sfrunner1188"};
		client.get("statuses/user_timeline", params, function(error, tweets, response) {
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
    		spotifyApp(answers.song);
    	});
    }
    else if(answers.action.toLowerCase() === "movie-this"){
        inquirer.prompt([
            {
                type: "input",
                message: "What movie should I look up?",
                name: "movie",
                default: "Mr. Nobody"
            }
        ]).then(function(answers){
            request("http://www.omdbapi.com/?type=movie&plot=short&r=json&t=" + answers.movie, function (error, response, body) {
                console.log("error:", error); // Print the error if one occurred 
                console.log(body.Title);
                console.log(body.Year);
                console.log(body.imdbRating);
                console.log(body.Country);
                console.log(body.Language);
                console.log(body.Plot);
                console.log(body.Actors);
                //Rotten Tomates Rating
                //console.log(body.Ratings);
                //Rotten Tomatoes URL
                //console.log(body.Title);
            });
        });
    }
    else if(answers.action.toLowerCase() === "do-what-it-says"){
            var data = fs.readFileSync("./random.txt", "utf8");
            var randomQuery = data.substring(data.search(",") + 2,data.length - 1);
            spotifyApp(randomQuery);
    }

    function spotifyApp(song){
    var spotify = require("spotify");
            spotify.search({ type: "track", query: song, limit: 1 }, function(err, data) {
                if ( err ) {
                    console.log("Error occurred: " + err);
                    return;
                }
                else if (!err){
                    $.each(data.tracks.items, function(i,val){
                        var songInformation = {
                            artist: val.artists[0].name,
                            name: val.name,
                            previewLink: val.preview_url,
                            album: val.album.name
                        };
                        $.each(songInformation, function(i,val){
                            console.log(i + ": " + val)
                            appendFile(i + ": " + val);
                        });
                        console.log("");
                    });
                }
            });
    }

    function appendFile(log){
        fs.appendFileSync("./log.txt",log);
    }
});
});

