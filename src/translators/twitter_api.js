const { TwitterApi } = require('twitter-api-v2');
const util = require('util');
var dateUtils = require('../utils/date-utils');
var linkParser = require('../utils/link-parser');
var twitterUtils = require('../utils/twitter-utils');
var iso6391 = require('iso-639-1');
const { EmbedBuilder } = require('discord.js');
const DetectionService = require('../services/detection');

/**
 * NOTE: This part of the code should be unused presently, due to Twitter's API shenanigans.
 * Alas, I am a man of self-inflicted undue hope, and so I am retaining this path should
 * the option become viable again in the future to use this.
 */

/**
 * Setup twitter client so we can talk to twitter API
 */
const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

/**
 * Primary function, handles processing the message and sending back any translations on the original channel id
 */
function handleMessage(logger, translate, message) {
  logger.debug("text is:\n\n"+message.content+"\n\n")
  var twitterLinks = twitterUtils.getDistinctTwitterLinksInContent(message.content)
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
  console.log(data.status_id)

  const response = await twitter.v2.singleTweet(data.status_id, {
    'expansions': [
      'author_id'
    ],
    'user.fields': [
      'name',
      'profile_image_url'
    ],
    'tweet.fields': [
      'created_at',
      'lang'
    ]
  });
  //console.log(util.inspect(response, {depth: null}))

  const tweetData = response.data
  const userData = response.includes.users[0]

  const tweetText = tweetData.text

  if ( linkParser.containsOnlyLink(tweetText) ) {
    logger.debug("Tweet contains only a link, ignoring.")
    return
  }

  const detectionService = new DetectionService(process.env.DL_KEY)

  /**
  // Process language metadata and decide on source language
  let possibleLang = tweetData.lang
  try {
    if (detectionService.isMaybeEnglishOffline(tweetText)) {
      possibleLang = 'en'
    } else {
      possibleLang = await detectionService.detectLanguage(tweetText)
    }
    logger.debug(`[TWITTER] Language is suspected to be: ${possibleLang}`)
    
    // und seems to mean the service couldn't quite figure itself out. We will black hole these along with ignoring english.
    if (possibleLang == 'en' || possibleLang == 'und') {
      return
    }
  } catch (e) {
    if (e == "UNRELIABLE") {
      message.reply({ content: `the language detection was unreliable so I can't do anything here. Please report it if you have concerns.`}).then(msg => {
        setTimeout(() => msg.delete(), 10000)
      })
      return
    } else if (e == "NO_DETECTION") {
      logger.warn("Translation service did not detect any language, assuming it was a no-op.")
      return
    }
  }
  */

  // WIP - New guard clause to remove english tweets
  if (tweetData.lang == 'en') { return }

  translate.translate(tweetText, 'en').then(res => {
    var translated = res[1].data.translations[0]

    if (translated.detectedSourceLanguage == 'en') {
      logger.error("GCT thinks this is already English, so we wasted a translation.")
      return
    }

    var language = iso6391.getName(translated.detectedSourceLanguage)
    // If Google doesn't give us an discernible iso code (ex - iw is no longer used), fallback to what twitter might tell us.
    if (language == "") {
      language = iso6391.getName(tweetData.lang)
    }

    const embed = new EmbedBuilder()
      .setColor(0x00afff)
      .setAuthor({
        name: userData.name + " (@" + userData.username + ")",
        iconURL: userData.profile_image_url,
        url: "https://twitter.com/" + userData.username + "/status/" + tweetData.id
      })
      .setDescription(translated.translatedText)
      .addFields(
        { name: "Published On", value: dateUtils.prettyPrintDate(tweetData.created_at) }
      )
      .setFooter({ text: 'Translated from '+language+' with love by CodeMonkey'})

    message.reply({ embeds: [embed]})
    logger.info('[TRANSLATION] server='+message.channel.guild.name+', source=twitter, srcLanguage='+language+', user='+userData.username+', id='+tweetData.id)
  })
}

exports.handleMessage = handleMessage;
