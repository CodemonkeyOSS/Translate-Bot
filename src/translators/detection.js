const {Translate} = require('@google-cloud/translate').v2;
const {Message} = require('discord.js');
var langdetect = require('langdetect');

let options = {
    projectId: '121843099390',
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLIENT_KEY
    }
}
const translate = new Translate(options);

function isMaybeEnglish(text) {
    return langdetect.detectOne(text) == 'en'
}

async function detectLanguage(text) {
    let res = await translate(text, {to: 'en'})
    if ( res.from.language.iso == 'iw') {
        return 'he'
    } else {
        return res.from.language.iso
    }
}

exports.isMaybeEnligh = isMaybeEnglish;
exports.detectLanguage = detectLanguage;