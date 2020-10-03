var { MTProto } = require('@mtproto/core');
var dateUtils = require('../utils/date-utils');
var linkParser = require('../utils/link-parser');
var detection = require('./detection');
var Discord = require('discord.js');
const translate = require('translate');

var tg = new MTProto({ 
    api_id: process.env.TG_APP_ID, 
    api_hash: process.env.TG_API_HASH
})

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
        
        if (detection.isTextCloseToEnglish(embed.description)) return

        // Let Translate figure out the source, as we don't have a way to get the src lang from embeds
        let params = {
            from: detection.detectLanguage(embed.description),
            to: 'en',
            key: process.env.GOOGLE_TRANSLATE_KEY
        }
        
        translate(embed.description, params).then(res => {
            var translated = res
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
        })
    });
}

exports.doTelegramLinksExistInContent = doTelegramLinksExistInContent;
exports.handleMessage = handleMessage;