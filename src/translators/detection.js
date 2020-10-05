const translate = require('@vitalets/google-translate-api');

async function detectLanguage(text) {
    let res = await translate(text, {to: 'en'})
    if ( res.from.language.iso == 'iw') {
        return 'he'
    } else {
        return res.from.language.iso
    }
    
}

exports.detectLanguage = detectLanguage;