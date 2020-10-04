var Discord = require('discord.js');
var Winston = require('winston');
var config = require('./config/config.json');
var twitterTranslator = require('./translators/twitter');
var telegramTranslator = require('./translators/telegram');
const InsultCompliment = require("insult-compliment");
const { promisify } = require('util')

const sleep = promisify(setTimeout)

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
client.on('message', async function(message) {
  sleep(2000)

  if (message.author.id === client.id) {
    return
  }

  if (message.mentions.has(client.user)) {
    if (message.author == 251883305362915328) {
      message.reply(InsultCompliment.Compliment());
    } else {
      message.reply(InsultCompliment.Insult());
    }
  } else {
    if (twitterTranslator.doTwitterLinksExistInContent(message) && config.translation.twitter) {
      twitterTranslator.handleMessage(logger, message);
    }
    if (telegramTranslator.doTelegramLinksExistInContent(message) && config.translation.telegram) {
      if (message.embeds.length <= 0) logger.warn("Encountered telegram detection with no embeds, message was:\n" + message)
      telegramTranslator.handleMessage(logger, message);
    }
  }
})

// On Fiery Death, log and attempt another login
client.on('disconnect', () => {
  logger.warn(`Terminal disconnect. Attempting reconnection.`)
  client.login(process.env.DISCORD_TRANSLATE_TOKEN);
})

// Attempt initial login to kick things off
client.login(process.env.DISCORD_TRANSLATE_TOKEN)




