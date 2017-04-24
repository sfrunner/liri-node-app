//Global Variables
var keys = require("./key.js");
var inquirer = require("inquirer");
var file = require("file-system");
var fs = require("fs");
var request = require("request");
var promptInput = function(Type,Message,Name, Default){
    this.type = Type;
    this.message = Message;
    this.name = Name;
    this.default = Default;
};

// Requiring in a jsdom environment just so you can mount jQuery on the in memory window object
// is probably overkill for this assignment. Especially because you're only using jQuery's `.each`
// method. You could simplify this a bunch by using the native `forEach` method on js arrays
// check out the docs for it here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach?v=example

require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    } 
//Initialize JQuery
    var $ = require("jquery")(window);

    //Initialize Inquirer
    inquirer.prompt([
       new promptInput("input","State what you would like LIRI to do:","action", null)
    ]).then(function (answers){
        //Initialize Twitter Command
        if(answers.action.toLowerCase() === "my-tweets"){
            var Twitter = require("twitter");
            // since you've already named your twitter keys the same as what the Twitter client expects
            // you can simply pass those in instead of redundantly naming them.
            var client = new Twitter(keys.twitterKeys)

            var params = {screen_name: "sfrunner1188"};
            client.get("statuses/user_timeline", params, function(error, tweets, response) {
                if (!error) {
                    console.log("Latest 20 Tweets for " + params.screen_name);
                    console.log("");
                    // only noticeable difference is the order in which they define the arguments passed to the callback function
                    tweets.forEach(function(tweet, i){
                        consoleAppendFile("Tweet #" + (i + 1) + " was created at " +tweet.created_at.replace(" +0000", "") + " and " + params.screen_name + " tweeted " + tweet.text);
                    });
                    logTimeLine();
                }  
            });
        }
        //Initialize Spotify Command
        else if(answers.action.toLowerCase() === "spotify-this-song"){
            inquirer.prompt([
                new promptInput("input","What song should I look up?","song", "My Ace"),
            ]).then(function(answers){
                spotifyApp(answers.song);
            });
        }
        //OMDBAPI command
        else if(answers.action.toLowerCase() === "movie-this"){
            inquirer.prompt([
                new promptInput("input","What movie should I look up?","movie","Mr.Nobody")
            ]).then(function(answers){
                request("http://www.omdbapi.com/?type=movie&plot=short&r=json&t=" + answers.movie, function (error, response, body) {
                    var bodyJSON = JSON.parse(body);
                    if(bodyJSON.Title == null){
                        console.log("No Movie was Found!");
                    }
                    else{
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
                    }
                });
            });
        }
        //Initial random.txt command
        else if(answers.action.toLowerCase() === "do-what-it-says"){
            // You generally want to avoid using the synchronous versions of these commands.
            // Doesn't make a huge difference in this implementation, but it does make handling errors
            // more difficult.
            var data = fs.readFileSync("./random.txt", "utf8");
            var randomQuery = data.substring(data.search(",") + 2,data.length - 1);
            spotifyApp(randomQuery);
        }

        //Initialize delete-log command
        else if(answers.action.toLowerCase() === "clear-log"){
            fs.writeFileSync("./log.txt","");
            console.log("Log is Cleared!")
        }

        //else conditional statement if no actions are met
        else{
            console.log("Please use an acceptable command");
            console.log("{my-tweets, spotify-this-song, movie-this, do-what-it-says, clear-log}");
        }

        function spotifyApp(song){   
        // doesn't make a functional difference, but it's common place to define all your dependencies
        // at the top of the file as opposed to right before you use them.
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
