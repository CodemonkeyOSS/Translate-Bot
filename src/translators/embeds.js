var Discord = require('discord.js');
var iso6391 = require('iso-639-1');
const DetectionService = require('../services/detection');

/**
 * Primary function, handles processing the message and sending back any translations on the original channel id
 */
async function handleMessage(logger, translate, message) {

    for (const embed of message.embeds) {
        if (embed.type != 'article' && embed.type != 'link') return
        
        const detectionService = new DetectionService({translate})

        logger.info('[EMBED RQ] server='+message.channel.guild.name+', url="'+embed.url+'"')
        let possibleLang = await detectionService.detectLanguage(embed.description)

        logger.debug(`[EMBED] Language is suspected to be: ${possibleLang}`)
        if (possibleLang == 'en' || possibleLang == 'und') {
            return
        }

        let title = ''
        if (embed.title) {
            title = await checkAndTranslate(detectionService, translate, embed.title)
        }
        let description = ''
        if (embed.description) {
            description = await checkAndTranslate(detectionService, translate, embed.description)
        }

        var replyMessage = new Discord.MessageEmbed()
            .setColor(0xf542f5)
            .setTitle(title)
            .setDescription(description)
            .setFooter('Translated from '+iso6391.getName(possibleLang)+' with love by CodeMonkey')
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

async function checkAndTranslate(detectionService, translate, text) {
    let possibleLang = await detectionService.detectLanguage(text)
    if (possibleLang == 'en') {
        return text
    }

    const res = await translate.translate(text, 'en')
    return res[0]
}

//exports.doTelegramLinksExistInContent = doTelegramLinksExistInContent;
exports.handleMessage = handleMessage;
