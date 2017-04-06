//Global Variables
var keys = require("./key.js");
var inquirer = require("inquirer");
var file = require("file-system");
var fs = require("fs");
var request = require("request");
require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    } 
//Initialize JQuery
    var $ = require("jquery")(window);

    //Initialize Inquirer
    inquirer.prompt([
       {
           type: "input",
           message:"State what you would like LIRI to do:",
           name: "action"
       }
    ]).then(function (answers){
        //Initialize Twitter Command
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
                    $.each(tweets, function(i, tweet){
                        consoleAppendFile("Tweet #" + (i + 1) + " was created at " +tweet.created_at.replace(" +0000", "") + " and " + params.screen_name + " tweeted " + tweet.text);
                    });
                    logTimeLine();
                }  
            });
        }
        //Initialize Spotify Command
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
        //OMDBAPI command
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
                    console.log("error:", error); // Print the error if one occurrence
                    var bodyJSON = JSON.parse(body);
                    consoleAppendFile("Movie Title: " + bodyJSON.Title);
                    consoleAppendFile("Year Released: " + bodyJSON.Year);
                    consoleAppendFile("IMDB Rating: " + bodyJSON.imdbRating);
                    consoleAppendFile("Country of Movie Production: " + bodyJSON.Country);
                    consoleAppendFile("Movie Language: " + bodyJSON.Language);
                    consoleAppendFile("Plot: " + bodyJSON.Plot);
                    consoleAppendFile("Actors: " + bodyJSON.Actors);
                    //Rotten Tomatoes Ranking
                    consoleAppendFile("Rotten Tomatoes Rating: " + bodyJSON.Ratings[2].Value);
                    //Official Movie URL instead of Rotten Tomatoes URL as it does not exist in response
                    consoleAppendFile("Official Movie Website: " + bodyJSON.Website);
                    logTimeLine();
                });
            });
        }
        //Initial random.txt command
        else if(answers.action.toLowerCase() === "do-what-it-says"){
            var data = fs.readFileSync("./random.txt", "utf8");
            var randomQuery = data.substring(data.search(",") + 2,data.length - 1);
            spotifyApp(randomQuery);
        }

        //Initialize delete-log command
        else if(answers.action.toLowerCase() === "clear-log"){
            fs.writeFileSync("./log.txt","");
            console.log("Log is Cleared!")
        }

        function spotifyApp(song){   
        var spotify = require("spotify");
            spotify.search({ type: "track", query: song }, function(err, data) {
                if ( err ) {
                    console.log("Error occurred: " + err);
                    return;
                }
                else if (!err){
                    console.log();
                    var firstSong = data.tracks.items[0];
                    var songInformation = {
                        artist: firstSong.artists[0].name,
                        name: firstSong.name,
                        previewLink: firstSong.preview_url,
                        album: firstSong.album.name
                    };
                    consoleAppendFile("Song Artist(s): " + songInformation.artist);
                    consoleAppendFile("Song Name: " + songInformation.name);
                    consoleAppendFile("Song Preview Link: " + songInformation.previewLink);
                    consoleAppendFile("Song Album Name: " + songInformation.album);
                    logTimeLine();
                }
            });
        }

        function consoleAppendFile(log){
            console.log(log);
            fs.appendFileSync("./log.txt",log + "\r\n");
        }

        function logTimeLine(){
            fs.appendFileSync("./log.txt", "Logged at " + Date() + "\r\n");
            fs.appendFileSync("./log.txt", "" + "\r\n");
        }
    });
});
