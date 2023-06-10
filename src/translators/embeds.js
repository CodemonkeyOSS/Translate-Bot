const { EmbedBuilder } = require('discord.js');
var iso6391 = require('iso-639-1');
const DetectionService = require('../services/detection');

/**
 * Primary function, handles processing the message and sending back any translations on the original channel id
 */
async function handleMessage(logger, translate, message) {

    const detectionService = new DetectionService(process.env.DL_KEY)

    for (const embed of message.embeds) {
        console.log(embed)
        let supported = ["article", "link", "rich"]
        if (!supported.includes(embed.data.type)) return
        
        logger.info('[EMBED RQ] server='+message.channel.guild.name+', url="'+embed.url+'"')

        let possibleLang = ""
        let missingDescription = false

        try {
            if (embed.description) {
                possibleLang = await detectionService.detectLanguage(embed.description)
            } else if (embed.title) {
                // Sets conditional flags for triggering the msg reply
                possibleLang = await detectionService.detectLanguage(embed.title)
                missingDescription = true
            } else {
                logger.debug('[EMBED] No-op embed detected, returning early.')
                return
            }
            logger.debug(`[EMBED] Language is suspected to be: ${possibleLang}`)
            if (possibleLang == 'en' || possibleLang == 'und') {
                return
            } else if (missingDescription) {
                message.reply({ content: `Sorry friend, but ${embed.title} has no description so there is nothing I can translate here.`})
                return
            }
        } catch (e) {
            if (e == "UNRELIABLE") {
              message.reply({ content: `the language detection was unreliable so I can't do anything here. Please report it if you have concerns.`}).then(msg => {
                msg.delete({timeout: 10000})
              })
              return
            } else if (e == "NO_DETECTION") {
              logger.warn("Translation service did not detect any language, assuming it was a no-op.")
              return
            }
          }

        let title = ''
        if (embed.data.title) {
            title = await checkAndTranslate(detectionService, translate, embed.data.title)
        }
        let description = ''
        if (embed.data.description) {
            description = await checkAndTranslate(detectionService, translate, embed.data.description)
        }

        var replyEmbed = new EmbedBuilder()
            .setColor(0xf542f5)
        if (title.length > 0) { replyEmbed.setTitle(title) }
        replyEmbed.setDescription(description)
        replyEmbed.setFooter({ text: 'Translated from '+iso6391.getName(possibleLang)+' with love by CodeMonkey' })
        if (embed.data.author) {
            replyEmbed.setAuthor({
                name: embed.data.author.name,
                url: embed.data.url
            })
        }
        if (embed.data.url) replyEmbed.url = embed.data.url

        message.reply({ embeds: [replyEmbed]})
        logger.info('[EMBED RESULT] server='+message.channel.guild.name+', source=embed, url='+embed.data.url)
    }
}

async function checkAndTranslate(detectionService, translate, text) {
    let possibleLang = "" 
    if (detectionService.isMaybeEnglishOffline(text)) {
        possibleLang = 'en'
    } else {
        possibleLang = await detectionService.detectLanguage(text)
    }
    if (possibleLang == 'en') {
        return text
    }

    const res = await translate.translate(text, 'en')
    return res[0]
}

//exports.doTelegramLinksExistInContent = doTelegramLinksExistInContent;
exports.handleMessage = handleMessage;
