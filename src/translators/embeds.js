var dateUtils = require('../utils/date-utils');
var linkParser = require('../utils/link-parser');
var detection = require('./detection');
var Discord = require('discord.js');
const translate = require('translate');

/**
 * NOT CURRENTLY IN USE
function (msgContent) {
    var regex = /https:\/\/(?:www\.)?t\.me\/(?<channel>[a-zA-Z0-9_]+)\/(?<messageId>[0-9]+)/g
    let matches = []
    while((matchItem = regex.exec(msgContent)) != null) {
      matches.push(matchItem.groups)
    }
    matches = [...new Set(matches)]   // Removes any duplicate links if someone is dumb
    console.log(matches)
    return matches
}

function doTelegramLinksExistInContent(msg) {
    return getDistinctTelegramLinksInContent(msg.content).length > 0
}

function parseHandleAndIdFromLink(url) {
    var regex = /https:\/\/(?:www\.)?t\.me\/(?<channel>[a-zA-Z0-9_]+)\/(?<messageId>[0-9]+)/g
    return regex.exec(url).groups
}
*/

/**
 * Primary function, handles processing the message and sending back any translations on the original channel id
 */
async function handleMessage(logger, message) {

    for (const embed of message.embeds) {
        if (embed.type != 'article' && embed.type != 'link') return
        
        //console.log(embed)
        logger.info('[EMBED RQ] server='+message.channel.guild.name+', url="'+embed.url+'"')
        let possibleLang = await detection.detectLanguage(embed.description)

        logger.debug(`[EMBED] Language is suspected to be: ${possibleLang}`)
        if (possibleLang == 'en') {
            return
        }

        let title = ''
        if (embed.title) {
            title = await checkAndTranslate(embed.title)
        }
        let description = ''
        if (embed.description) {
            description = await checkAndTranslate(embed.description)
        }

        var replyMessage = new Discord.MessageEmbed()
            .setColor(0xf542f5)
            .setTitle(title)
            .setDescription(description)
            .setFooter('Translated from '+possibleLang+' with love by CodeMonkey')
        if (embed.author) {
            replyMessage.setAuthor(
                embed.author.name,
                embed.thumbnail.url,
                embed.url
            )
        } else if (embed.provider && embed.provider.name) {
            replyMessage.setAuthor(embed.provider.name)
        }
        if (embed.url) replyMessage.url = embed.url
        if (embed.thumbnail) replyMessage.image = embed.thumbnail

        //console.log(replyMessage)

        message.reply(replyMessage)
        logger.info('[EMBED RESULT] server='+message.channel.guild.name+', source=embed, url='+embed.url)
    }
}

async function checkAndTranslate(text) {
    let possibleLang = await detection.detectLanguage(text)
    if (possibleLang == 'en') {
        return text
    }
    
    let params = {
        from: possibleLang,
        to: 'en',
        key: process.env.GOOGLE_TRANSLATE_KEY
    }

    return await translate(text, params)
}

//exports.doTelegramLinksExistInContent = doTelegramLinksExistInContent;
exports.handleMessage = handleMessage;