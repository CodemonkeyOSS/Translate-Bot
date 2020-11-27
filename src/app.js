var Discord = require('discord.js');
var Winston = require('winston');
var config = require('./config/config.json');
var twitterTranslator = require('./translators/twitter');
var embedTranslator = require('./translators/embeds');
const {Translate} = require('@google-cloud/translate').v2;
const linkParser = require("./utils/link-parser");
const RateLimitService = require('./services/rate-limiter');
const { promisify } = require('util')
const sleep = promisify(setTimeout)

/**
 * Setup the logger service so we can get dank loggies
 */
const logger = Winston.createLogger({
  level: config.logger.level,
  format: Winston.format.simple(),
  transports: [
    new Winston.transports.Console({ format: Winston.format.simple() })
  ]
})

/**
 * Create translator instance
 */
const translate = new Translate({
  projectId: '121843099390',
  credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CLIENT_KEY
  }
});

/**
 * Start rate limiter service
 */
const rateLimiter = new RateLimitService(
  config.rateLimit.amount, 
  config.rateLimit.window
);

/**
 * Setup the client and it's event methods.
 * Add handling for whenever we disconnet
 */
const client = new Discord.Client();

// On Fiery Death, log and attempt another login
client.on('disconnect', () => {
  logger.warn(`Terminal disconnect. Attempting reconnection.`)
  client.login(process.env.DISCORD_TRANSLATE_TOKEN);
})

// Attempt initial login to kick things off
client.login(process.env.DISCORD_TRANSLATE_TOKEN)

// On Ready, log out needed info before we begin.
client.on('ready', () => {
  logger.info(`Rate limiter configured for ${config.rateLimit.amount} messages per ${config.rateLimit.window} per channel.`)
  logger.info(`Logged into server as ${client.user.tag}`)
})

// On Message
client.on('message', async function(message) {

  // Ignore myself or another bot
  if (message.author.id === client.id || message.author.bot) return

  processMessageTranslations(message)
})

async function processMessageTranslations(message) {
  
  if (twitterTranslator.doTwitterLinksExistInContent(message) && config.translation.twitter) {

    // Check rate limiter
    let isLimited = rateLimiter.takeAndCheck(message.channel.id)
    if (isLimited) {
      logger.warn(`[RATE_LIMIT] server=${message.channel.guild.name}, channel=${message.channel.name}`)
      message.reply("This channel is cooling off on translations and will resume shortly. Thanks for your patience!")
          .then( msg => { msg.delete({timeout: 5000}) })
    } else {
      twitterTranslator.handleMessage(logger, translate, message);
    }

    return
  }

  if (config.translation.anyEmbed && linkParser.containsAnyLink(message.content)) {

    let updatedMsg = ''
    for (i = 0; i < 12; i++) {
      // Sleep before checking embeds
      await sleep(500)
      logger.debug("Embed checker in loop: "+i)
      // Forcefully check for updated message from API
      updatedMsg = await message.fetch(force=true).then( updatedMsg => { return updatedMsg })
      if (updatedMsg.embeds.length > 0) {
        logger.debug("Finally got out of the loop") 
        break
      }
    }

    if (updatedMsg.embeds.length > 0) {

      // Check rate limiter
      let isLimited = rateLimiter.takeAndCheck(message.channel.id)
      if (isLimited) {
        logger.warn(`[RATE_LIMIT] server=${message.channel.guild.name}, channel=${message.channel.name}`)
        message.reply("This channel is cooling off on translations and will resume shortly. Thanks for your patience!")
            .then( msg => { msg.delete({timeout: 5000}) })
      } else {
        embedTranslator.handleMessage(logger, translate, updatedMsg)
      }

      return
      
    } else logger.debug("[Embeds] No embeds detected")
  }
}


