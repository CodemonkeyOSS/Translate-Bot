var Discord = require('discord.js');
var Winston = require('winston');
var config = require('./config/config.json');
var twitterTranslator = require('./translators/twitter');
var telegramTranslator = require('./translators/telegram');
var messageUtils = require('./utils/message-utils');
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

  if (message.author.id === client.id) return

  if (message.mentions.has(client.user)) {
    if (message.author == 251883305362915328) {
      message.reply(InsultCompliment.Compliment());
    } else {
      message.reply(InsultCompliment.Insult());
    }
  } else {   
      if (twitterTranslator.doTwitterLinksExistInContent(updatedMsg) && config.translation.twitter) {
        twitterTranslator.handleMessage(logger, updatedMsg);
      } else {
        // Sleep before checking embeds
        await sleep(2000)
        // Forcefully check for updated message from API
        message.fetch(force=true).then( updatedMsg => {
          if (telegramTranslator.doTelegramLinksExistInContent(updatedMsg) && config.translation.telegram) {
            if ( updatedMsg.embeds.length <= 0) {
              logger.info("Still didn't get embeds for telegram after sleeping. Consider increasing delay?")
            }
            telegramTranslator.handleMessage(logger, updatedMsg);
          }
        })
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




