var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var Twitter = require('twitter');
const translate = require('@vitalets/google-translate-api');

const { Client, Attachment } = require('discord.js');
const client = new Client();
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
/*var googleTranslate = require("google-translate")(
    "xxxxxxx"
  );*/
  process.on('uncaughtException', function (exception) {
    console.log(exception); 
  });
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

// CodeMonkey added this bit to reconnect on a silent fail
bot.on('disconnect', function(msg, code) {
  if (code === 0) return console.error(msg);
  logger.warn("Disconnected...re-establishing connection now.")
  bot.connect();
});

bot.on('message', function (user, userID, channelID, message, evt) {
    logger.info(message);
    if(user != bot.username){

        if(message.indexOf('twitter.com/') <= 0){
          console.log("|||NOT TWITTER|||");


        }
        else{
          console.log("starting translation on " + message.text);
          var matches = message.match(/\bhttps?:\/\/\S+/gi);
          if(message.indexOf("twitter.com") >= 1){
              console.log('twitter');
              var n = message.indexOf('status/') + 7;
              var l = message.length;
              var i = (l-n)-1;
              var status_id = message.substring(n, l);
            console.log(status_id);
          //This is a tweet

          var client = new Twitter({
            consumer_key: "xxxxx",
            consumer_secret: "xxxx",
            bearer_token: "xxxxx"
          });


          console.log('got here');
            var params = {screen_name: 'nodejs'};
            function formatDate(date) {
                var d = new Date(date);
                var hh = d.getHours();
                var m = d.getMinutes();
                var s = d.getSeconds();
                var dd = "AM";
                var h = hh;
                if (h >= 12) {
                  h = hh - 12;
                  dd = "PM";
                }
                if (h == 0) {
                  h = 12;
                }
                m = m < 10 ? "0" + m : m;
              
                s = s < 10 ? "0" + s : s;
              
                /* if you want 2 digit hours:
                h = h<10?"0"+h:h; */
              
                var pattern = new RegExp("0?" + hh + ":" + m + ":" + s);
              
                var replacement = h + ":" + m;
                /* if you want to add seconds
                replacement += ":"+s;  */
                replacement += " " + dd;
              
                return date.replace(pattern, replacement);
              }
            client.get('statuses/show.json?id=' + status_id, { tweet_mode:'extended' }, function(error, tweets, response) {
              console.log("status x");
              var translated;
              if(error) {
               console.log(error);
              }
                if (!error) {
                  
                //  logger.info(tweets);
                    var jsonResponse = tweets;
                    console.log("status xx");
                    logger.info('PROPS ||||||||||||| ' + CheckMedia(jsonResponse));

                    if(jsonResponse.lang!='en'){
                      
                        logger.info(tweets);
                        console.log("tweets");


                        translate(jsonResponse.full_text, {to: 'en'}).then(res => {
                          console.log(res.text);
                          translated = res.text;
                          console.log('**************' + translated);
                          //=> I speak English
                          logger.info('translated: ' + translated);
                          var mediaCount = '';
                          if(jsonResponse.hasOwnProperty(jsonResponse.entities.media) == false){
                              console.log('MEDIA NONE - ');
                              bot.sendMessage({
                                  to: channelID,
                                  //message: embed
                                  /*message: 'tweet detected',*/
                                  embed: {
                                      author: {
                                          name: jsonResponse.user.name + "(@" + jsonResponse.user.screen_name + ")",
                                          url: "https://twitter.com/" + jsonResponse.user.screen_name + "/status/" + jsonResponse.id_str,
                                          icon_url: jsonResponse.user.profile_image_url
                                      },
                                      color: 0x00afff,
                                      description: translated,
                                      fields: [{
                                          name: "____________________",
                                          value: new Date(jsonResponse.created_at).toLocaleDateString('en-US') + ' at ' + formatDate(new Date(jsonResponse.created_at).toLocaleTimeString('en-US'))
                                        }
                                  
                                      ],
                                      footer: { 
                                      text: 'Translated From Twitter Using Google Translate'
                                      },
                                  // title: jsonResponse.user.screen_name,
                                  }
  
                              });
                            
                          }
                          else{
                              console.log('MEDIA YES - ' + Object.keys(jsonResponse.entities.media).length);

                              bot.sendMessage({
                                  to: channelID,
                                  //message: embed
                                  embed: {                                       
                                          description: translated,
                                          url: "https://twitter.com/" + jsonResponse.user.screen_name + "/status/" + jsonResponse.id_str,
                                          color: 11593410,
                                          footer: {
                                            icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
                                            text: "Translated From Twitter Using Google Translate"
                                          },
                                          thumbnail: {
                                            url: "https://cdn3.iconfinder.com/data/icons/tango-icon-library/48/mail-attachment-512.png"
                                          },
                                          author: {
                                            name: jsonResponse.user.name + "(@" + jsonResponse.user.screen_name + ")",
                                            icon_url: jsonResponse.user.profile_image_url
                                                    },
                                          fields: [
                                            {
                                              name: "This tweet contains media attached.",
                                              value: "Click the tweet to view the original images or video."
                                            }
                                          ]                                        
                                  }
  
                              });
                          }
                          console.log(res.from.language.iso);
                          //=> nl
                      }).catch(err => {
                          console.error(err);
                      });


                            //this.setState.finalText = translation.translatedText;
                     

                            
                            /*jsonResponse.extended_entities.media.forEach(element => {
                                bot.sendMessage({
                                    to: channelID,
                                    embed:{
                                        "color": 9936031,
                                        "thumbnail": {
                                          "url": element.media_url
                                        },
                                        "video":{
                                            "url": "https://video.twimg.com/amplify_video/1091956919504457728/vid/848x480/Q02rQ2zIIhy124EY.mp4"
                                        }
                                    }
                                });

                            });*/


                            //console.log("translated" + tt.response);
                           
                          /*  jsonResponse.extended_entities.media.forEach(element => {
                                var interval = setInterval (function (){
                                bot.sendMessage({
                                    to: channelID,
                                    embed:{
                                        "color": 11999623,
                                        "thumbnail": {
                                          "url": element.media_url
                                        }
                                    }
                                });
                            }, 1000); // time between each interval in milliseconds
                            });*/
                        




                    }
                    /*let storeData = ({text, created_at}) => logger.info(`${name} has a tweet volume of ${volume}`);

                    JSON.parse(jsonResponse)[0]["user"].forEach( n => {
                    storeData({name: n.name, volume: n.screen_name});
                    });*/

                    logger.info('over');
                }

            });
        //logger.info(rateLimits);
    }
}
}
   
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
   /* if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;
            // Just add any case commands if you want to..
         }
     }*/
});

function CheckMedia (json){
    var mediaCount = 0;


    if(json.entities.hasProperties){
        console.log('has properties');
        json.entities.media.forEach(element => {
          console.log(element.type);
          if(element.type != null){
            mediaCount += 1;
          }
        });
      }
      else{
        console.log('no properties');
        var ee = false;
        "extended_entities" in json ? ee=true : ee=false;
        if(ee){
        if(json.extended_entities.hasProperties){
        json.extended_entities.media.forEach(element => {
        console.log(element.type);
        if(element.type != null){
          mediaCount += 1;
        }
      });
        }
        }
      }
      
 return mediaCount;
}
  