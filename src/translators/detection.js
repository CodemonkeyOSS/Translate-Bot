const translate = require('@vitalets/google-translate-api');
var langdetect = require('langdetect');

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