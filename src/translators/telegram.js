var dateUtils = require('../utils/date-utils');
var linkParser = require('../utils/link-parser');
var detection = require('./detection');
var Discord = require('discord.js');
const translate = require('translate');

function getDistinctTelegramLinksInContent(msgContent) {
    var regex = /https:\/\/(?:www\.)?t\.me\/(?<channel>[a-zA-Z0-9_]+)\/(?<messageId>[0-9]+)/g
    let matches = []
    while((matchItem = regex.exec(msgContent)) != null) {
      matches.push(matchItem.groups)
    }
    matches = [...new Set(matches)]   // Removes any duplicate links if someone is dumb
    return matches
}

function doTelegramLinksExistInContent(msg) {
    return getDistinctTelegramLinksInContent(msg.content).length > 0
}

function parseHandleAndIdFromLink(url) {
    var regex = /https:\/\/(?:www\.)?t\.me\/(?<channel>[a-zA-Z0-9_]+)\/(?<messageId>[0-9]+)/g
    return regex.exec(url).groups
}

/**
 * Primary function, handles processing the message and sending back any translations on the original channel id
 */
function handleMessage(logger, message) {

    message.embeds.forEach(embed => {
        let possibleLang = detection.detectLanguage(embed.description)

        logger.debug(`[TELEGRAM] Language is suspected to be: ${possibleLang}`)
        if (possibleLang == 'en') {
            return
        }
        
        let params = {
            from: possibleLang,
            to: 'en',
            key: process.env.GOOGLE_TRANSLATE_KEY
        }

        let translated = translate(embed.description, params)
        var data = parseHandleAndIdFromLink(embed.url)
        var replyMessage = new Discord.MessageEmbed()
            .setColor(0x3489eb)
            .setAuthor(
                data.channel,
                embed.thumbnail.url,
                embed.url
            )
            .setDescription(translated)
            .addField(
                "____________________",
                "**Timestamp not provided, please ensure recency of message.**"
            )
            .setFooter(`Translated From Telegram Using Google Cloud Translate with Love from CodeMonkey`)

        message.reply(replyMessage)
    });
}

exports.doTelegramLinksExistInContent = doTelegramLinksExistInContent;
exports.handleMessage = handleMessage;