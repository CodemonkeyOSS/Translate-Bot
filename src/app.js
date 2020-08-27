var Discord = require('discord.js');
var Winston = require('winston');
var config = require('./config/config.json')
var Twitter = require('twitter');
const ISO6391 = require('iso-639-1');
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
 * Primary function, handles processing the message and sending back any translations on the original channel id
 * 
 * @param {Discord.message} message 
 */
function handleMessage(message) {
  if (message.author.id === client.id) {
    logger.debug("Discarding message from myself")
    return
  }
  var twitterLinks = getDistinctTwitterLinksInContent(message.content)
  if (twitterLinks.length > 0) {
    logger.debug(`Discovered ${twitterLinks.length} links in this message`)
    twitterLinks.forEach( data => {
      translateAndSend(message, data)
    })
  } else {
    logger.debug(`Discovered no twitter links in this message, discarding.`)
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
  var regex = /https:\/\/(?:www\.)?twitter\.com\/(?<handle>[a-zA-Z0-9_]+)\/status\/(?<status_id>[0-9]+)/g
  let matches = []
  while((matchItem = regex.exec(msgContent)) != null) {
    matches.push(matchItem.groups)
  }
  matches = [...new Set(matches)]   // Removes any duplicate links if someone is dumb
  return matches
}

function translateAndSend(message, data) {
  logger.debug(`Generating metadata for handle: \"${data.handle}\", status_id: ${data.status_id}`)
  twitter.get(`statuses/show.json?id=` + data.status_id, { tweet_mode:"extended"}, function(error, tweets, response) {
    if(error) {
      logger.error("Error communicating with twitter: "+error);
     } else {
      
      var jsonResponse = tweets
      if (jsonResponse.lang == 'en') {
        logger.debug("Tweet is already classified as english/en, skipping.")
        return
      }
      if (!ISO6391.validate(tweets.lang)) {
        logger.error(`'${tweets.lang} is not a valid ISO-369.1 code. Skipping.'`)
        return
      }

      logger.debug(`Preparing to translate text: ${jsonResponse.full_text}`)
      params = {
        from: tweets.lang, 
        to: 'en',
        key: process.env.GOOGLE_TRANSLATE_KEY
      }
      translate(tweets.full_text, params).then(res => { 
        var translated = res
        var mediaCount = '';
        if (jsonResponse.hasOwnProperty(jsonResponse.entities.media) == false) {
          logger.debug(`translated text: `+res)
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
            .setFooter("Translated From Twitter Using Google Cloud Translate")
        }
        message.reply(replyMessage)
      })
     }
  })
}