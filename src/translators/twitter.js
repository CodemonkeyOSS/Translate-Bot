var Twitter = require('twitter');
var dateUtils = require('../utils/date-utils');
var linkParser = require('../utils/link-parser');
var detection = require('./detection');
var Discord = require('discord.js');
const translate = require('translate');

/**
 * Setup twitter client so we can talk to twitter API
 */
const twitter = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_SECRET_KEY,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
})
  
/**
 * getDistinctTwitterLinksInContent is self explanatory. It literally checks a message and if it has a twitter link, it extracts it.
 * 
 * Returns a set of potential matches
 * An empty set is akin to "no results"
 */
//TODO Support multiple links by putting all links into an array
function getDistinctTwitterLinksInContent(msgContent) {
    var regex = /https:\/\/(?:www\.)?(?:mobile\.)?twitter\.com\/(?<handle>[a-zA-Z0-9_]+)\/status\/(?<status_id>[0-9]+)/g
    let matches = []
    while((matchItem = regex.exec(msgContent)) != null) {
      matches.push(matchItem.groups)
    }
    matches = [...new Set(matches)]   // Removes any duplicate links if someone is dumb
    return matches
}

/**
 * isDistinctTwitterLinksInContent is self explanatory. It literally checks a message and if it has a twitter link, it extracts it.
 * 
 * Returns a set of potential matches
 * An empty set is akin to "no results"
 */
//TODO Support multiple links by putting all links into an array
function doTwitterLinksExistInContent(msg) {
   return getDistinctTwitterLinksInContent(msg.content).length > 0
}

function isTweetCompletelyFuckingUseless(text) {
    let topMatches = lngDetector.detect(text, 2)
    //logger.debug(topMatches)
    for (const item of topMatches) {
      if ( item[0] === null ) {
        return true
      }
    }
    return false
  }

/**
 * Primary function, handles processing the message and sending back any translations on the original channel id
 */
function handleMessage(logger, message) {
  var twitterLinks = getDistinctTwitterLinksInContent(message.content)
  if (twitterLinks.length > 0) {
      twitterLinks.forEach( data => {
          translateAndSend(logger, message, data)
      })
  } else {
      return
  }
}

/*
  Meat and taters function
*/
function translateAndSend(logger, message, data) {
    twitter.get(`statuses/show.json?id=` + data.status_id, { tweet_mode:"extended"}, function(error, tweets, response) {
      if(error) {
        logger.error("Error communicating with twitter: "+error);
       } else {
        
        var jsonResponse = tweets
  
        if ( linkParser.containsOnlyLink(jsonResponse.full_text) ) {
          logger.debug("Tweet contains only a link, ignoring.")
          return
        }
  
        // Process language metadata and decide on source language
        let possibleLang = detection.maybeDetermineSrcLang(logger, jsonResponse.full_text, jsonResponse.lang)
        logger.debug(`Language is suspected to be: ${possibleLang}`)
        if (possibleLang == 'en') {
          return
        }
        let params = {
          from: possibleLang,
          to: 'en',
          key: process.env.GOOGLE_TRANSLATE_KEY
        }
        
        translate(tweets.full_text, params).then(res => {
          var translated = res
          if (jsonResponse.hasOwnProperty(jsonResponse.entities.media) == false) {
            var replyMessage = new Discord.MessageEmbed()
              .setColor(0x00afff)
              .setAuthor(
                jsonResponse.user.name + " (@" + jsonResponse.user.screen_name + ")",
                jsonResponse.user.profile_image_url,
                "https://twitter.com/" + jsonResponse.user.screen_name + "/status/" + jsonResponse.id_str
              )
              .setDescription(translated)
              .addField(
                "____________________",
                dateUtils.prettyPrintDate(jsonResponse.created_at)
              )
              .setFooter(`**Translated From Twitter Using Google Cloud Translate**`)
          }
          message.reply(replyMessage)
        })
       }
    })
  }

exports.doTwitterLinksExistInContent = doTwitterLinksExistInContent;
exports.handleMessage = handleMessage;