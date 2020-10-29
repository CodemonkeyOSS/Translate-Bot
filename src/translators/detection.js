const {Translate} = require('@google-cloud/translate').v2;
const { Message } = require('discord.js');
var langdetect = require('langdetect');

const projectId = '121843099390';

const translate = new Translate({projectId});

function isMaybeEnglish(text) {
    return langdetect.detectOne(text) == 'en'
}

async function detectLanguage(text) {
    let res = await translate.detect(text)
    let possibleLang = res[0].language
    if ( possibleLang == 'iw') {
        return 'he'
    } else {
        return possibleLang
    }
}

exports.isMaybeEnligh = isMaybeEnglish;
exports.detectLanguage = detectLanguage;