var Twitter = require('twitter');
var dateUtils = require('../utils/date-utils');
var linkParser = require('../utils/link-parser');
var iso6391 = require('iso-639-1');
const { EmbedBuilder } = require('discord.js');
const DetectionService = require('../services/detection');

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
 * NOTE: The regex is configured to ignore any line that starts with '>', so as to ignore quoted text and reduce translation cost and noise.
 * 
 * Returns a set of potential matches
 * An empty set is akin to "no results"
 */
//TODO Support multiple links by putting all links into an array
function getDistinctTwitterLinksInContent(msgContent) {
    var regex = /^(?!\>).*https:\/\/(?:www\.)?(?:mobile\.)?twitter\.com\/(?<handle>[a-zA-Z0-9_]+)\/status\/(?<status_id>[0-9]+)/gm
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

/**
 * Primary function, handles processing the message and sending back any translations on the original channel id
 */
function handleMessage(logger, translate, message) {
  logger.debug("text is:\n\n"+message.content+"\n\n")
  var twitterLinks = getDistinctTwitterLinksInContent(message.content)
  if (twitterLinks.length > 0) {
      twitterLinks.forEach( data => {
        logger.debug('[TWITTER RQ] server='+message.channel.guild.name+', source=twitter, user='+data.handle+', id='+data.status_id)
        translateAndSend(logger, translate, message, data)
      })
  } else {
      return
  }
}

/*
  Meat and taters function
*/
async function translateAndSend(logger, translate, message, data) {
    twitter.get(`statuses/show.json?id=` + data.status_id, { tweet_mode:"extended"}, async function(error, tweets, response) {
      if(error) {
        logger.error("Error communicating with twitter: "+error);
       } else {
        
        var jsonResponse = tweets
  
        if ( linkParser.containsOnlyLink(jsonResponse.full_text) ) {
          logger.debug("Tweet contains only a link, ignoring.")
          return
        }

        const detectionService = new DetectionService(process.env.DL_KEY)

        // Process language metadata and decide on source language
        let possibleLang = null 
        try {
          if (detectionService.isMaybeEnglishOffline(jsonResponse.full_text)) {
            possibleLang = 'en'
          } else {
            possibleLang = await detectionService.detectLanguage(jsonResponse.full_text)
          }
          logger.debug(`[TWITTER] Language is suspected to be: ${possibleLang}`)
          
          // und seems to mean the service couldn't quite figure itself out. We will black hole these along with ignoring english.
          if (possibleLang == 'en' || possibleLang == 'und') {
            return
          }
        } catch (e) {
          if (e == "UNRELIABLE") {
            message.reply({ content: `the language detection was unreliable so I can't do anything here. Please report it if you have concerns.`}).then(msg => {
              msg.delete({timeout: 10000})
            })
            return
          } else if (e == "NO_DETECTION") {
            logger.warn("Translation service did not detect any language, assuming it was a no-op.")
            return
          }
        }
        
        translate.translate(tweets.full_text, 'en').then(res => {
          var translated = res[1].data.translations[0]

          if (translated.detectedSourceLanguage == 'en') {
            logger.error("GCT thinks this is already English, so we wasted a translation.")
            return
          }

          var language = iso6391.getName(translated.detectedSourceLanguage)
          // If Google doesn't give us an discernible iso code (ex - iw is no longer used), fallback to what twitter might tell us.
          if (language == "") {
            language = iso6391.getName(possibleLang)
          }

          const embed = new EmbedBuilder()
            .setColor(0x00afff)
            .setAuthor({
              name: jsonResponse.user.name + " (@" + jsonResponse.user.screen_name + ")",
              iconURL: jsonResponse.user.profile_image_url,
              url: "https://twitter.com/" + jsonResponse.user.screen_name + "/status/" + jsonResponse.id_str
            })
            .setDescription(translated.translatedText)
            .addFields(
              { name: "Published On", value: dateUtils.prettyPrintDate(jsonResponse.created_at) }
            )
            .setFooter({ text: 'Translated from '+language+' with love by CodeMonkey'})

          message.reply({ embeds: [embed]})
          logger.info('[TRANSLATION] server='+message.channel.guild.name+', source=twitter, srcLanguage='+language+', user='+jsonResponse.user.screen_name+', id='+jsonResponse.id_str)
        })
       }
    })
  }

exports.doTwitterLinksExistInContent = doTwitterLinksExistInContent;
exports.getDistinctTwitterLinksInContent = getDistinctTwitterLinksInContent;
exports.handleMessage = handleMessage;
