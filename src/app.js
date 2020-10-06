var Discord = require('discord.js');
var Winston = require('winston');
var config = require('./config/config.json');
var twitterTranslator = require('./translators/twitter');
var embedTranslator = require('./translators/embeds');
var messageUtils = require('./utils/message-utils');
const InsultCompliment = require("insult-compliment");
const linkParser = require("./utils/link-parser");

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
      if (twitterTranslator.doTwitterLinksExistInContent(message) && config.translation.twitter) {
        twitterTranslator.handleMessage(logger, message);
        // TODO: Improve
        return
      }
      if (linkParser.containsAnyLink(message.content)) {
        let updatedMsg = ''
        for (i = 0; i < 12; i++) {
          // Sleep before checking embeds
          await sleep(500)
          logger.debug("Embed checker in loop: "+i)
          // Forcefully check for updated message from API
          updatedMsg = await message.fetch(force=true).then( updatedMsg => { return updatedMsg })
          if (updatedMsg.embeds.length > 0) {
            logger.info("Finally got out of the loop") 
            break
          }
        }
        if (config.translation.anyEmbed) {
          await embedTranslator.handleMessage(logger, updatedMsg);
        }
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

// On Message
client.on('message', async function(message) {

  // Ignore myself or another bot
  if (message.author.id === client.id || message.author.bot) return

  if (message.mentions.has(client.user)) {
    insultOrComplimentCommand(message)
  } else {
    processMessageTranslations(message)
  }
})

function insultOrComplimentCommand(message) {
  if (message.author == 251883305362915328) {
    message.reply(InsultCompliment.Compliment());
  } else {
    message.reply(InsultCompliment.Insult());
  }
}

async function processMessageTranslations(message) {
  if (twitterTranslator.doTwitterLinksExistInContent(message) && config.translation.twitter) {
    twitterTranslator.handleMessage(logger, message);
  }
  if (embedTranslator.doTelegramLinksExistInContent(message)) {
    let updatedMsg = ''
    for (i = 0; i < 12; i++) {
      // Sleep before checking embeds
      await sleep(500)
      logger.debug("Embed checker in loop: "+i)
      // Forcefully check for updated message from API
      updatedMsg = await message.fetch(force=true).then( updatedMsg => { return updatedMsg })
      if (updatedMsg.embeds.length > 0) {
        logger.info("Finally got out of the loop") 
        break
      }
    }
    if (config.translation.telegram) {
      await embedTranslator.handleMessage(logger, updatedMsg);
    }
  }
}


