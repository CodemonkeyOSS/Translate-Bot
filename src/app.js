var Discord = require('discord.js');
var Winston = require('winston');
var config = require('./config/config.json')
var Twitter = require('twitter');
const ISO6391 = require('iso-639-1');
const LanguageDetect = require('languagedetect');
const utils = require('./utils')
const translate = require('translate');

/**
 * Setup the logger service so we can get dank loggies
 */
const logger = Winston.createLogger({
  level: config.logger.level,
  format: Winston.format.simple(),
  transports: [
    new Winston.transports.File({ filename: config.logger.file })
  ]
})

if (process.env.HEROKU == 'enabled'){
  logger.add(new Winston.transports.Console({
    format: Winston.format.simple()
  }))
}

/**
 * Setup the client and it's event methods.
 * Add handling for whenever we disconnet
 */
const client = new Discord.Client();

// On Ready
client.on('ready', () => {
  logger.info(`Logged into server as ${client.user.tag}`)
})

// On Message
client.on('message', function(message) {
  handleMessage(message);
})

// On Fiery Death, log and attempt another login
client.on('disconnect', () => {
  logger.warn(`Terminal disconnect. Attempting reconnection.`)
  client.login(process.env.DISCORD_TRANSLATE_TOKEN);
})

// Attempt initial login to kick things off
client.login(process.env.DISCORD_TRANSLATE_TOKEN)

/**
 * Setup twitter client so we can talk to twitter API
 */
const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_SECRET_KEY,
  bearer_token: process.env.TWITTER_BEARER_TOKEN
})

/**
 * Build language detector object
 */
const lngDetector = new LanguageDetect();
lngDetector.setLanguageType('iso2');

/**
 * Primary function, handles processing the message and sending back any translations on the original channel id
 * 
 * @param {Discord.message} message 
 */
function handleMessage(message) {
  if (message.author.id === client.id) {
    return
  }
  var twitterLinks = getDistinctTwitterLinksInContent(message.content)
  if (twitterLinks.length > 0) {
    twitterLinks.forEach( data => {
      translateAndSend(message, data)
    })
  } else {
    return
  }
}

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

/*
  Language processing functions
*/

function isTextCloseToEnglish(text) {
  let topMatches = lngDetector.detect(text, config.translation.numberOfLanguages)
  for (const item of topMatches) {
    if ( item[0] === 'en' ) {
      logger.debug(`Text matched english with a score of ${item[1]}`)
      return true
    }
  }
  return false
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

function maybeDetermineSrcLang(text, lang) {
  if ( isTextCloseToEnglish(text) ) {
    logger.debug("Text seems to match english already, so assuming english")
    return 'en'
  } else {
    if (ISO6391.validate(lang)) {
      return lang
    } else if (lang === 'iw') {
      return 'he'
    } else {
      if ( isTweetCompletelyFuckingUseless(text) ) {
        logger.debug("This tweet is literally useless, let's trash it and see who yells")
        return
      }
      return null
    }
  }
}

/*
  Is this just a single link in the tweet?
*/
function containsOnlyLink(text) {
  var regexTwitterShort = /^https:\/\/t\.co\/[a-zA-Z]+$/
  while((matchItem = regexTwitterShort.exec(text)) != null) {
    if ( matchItem[0] === text) return true
  }

  var regexOnlyUrl = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/
  while((matchItem = regexOnlyUrl.exec(text)) != null) {
    if ( matchItem[0] === text ) return true
  }
  
  return false
}

/*
  Meat and taters function
*/

function translateAndSend(message, data) {
  twitter.get(`statuses/show.json?id=` + data.status_id, { tweet_mode:"extended"}, function(error, tweets, response) {
    if(error) {
      logger.error("Error communicating with twitter: "+error);
     } else {
      
      var jsonResponse = tweets

      if ( containsOnlyLink(jsonResponse.full_text) ) {
        logger.debug("Tweet contains only a link, ignoring.")
        return
      }

      //console.log(jsonResponse)

      // Process language metadata and decide on source language
      let possibleLang = maybeDetermineSrcLang(jsonResponse.full_text, jsonResponse.lang)
      logger.debug(`Language is suspected to be: ${possibleLang}`)
      if (possibleLang == 'en') {
        return
      }
      let params = {
        from: possibleLang,
        to: 'en',
        key: process.env.GOOGLE_TRANSLATE_KEY
      }

      //console.log(jsonResponse)
      
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
              utils.prettyPrintDate(jsonResponse.created_at)
            )
            .setFooter(`Translated From Twitter Using Google Cloud Translate`)
        }
        message.reply(replyMessage)
      })
     }
  })
}