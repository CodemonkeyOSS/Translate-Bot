const LanguageDetect = require('languagedetect');
const translate = require('@vitalets/google-translate-api');
const ISO6391 = require('iso-639-1');
var config = require('../config/config.json');

/**
 * Build language detector object
 */
const lngDetector = new LanguageDetect();
lngDetector.setLanguageType('iso2');

async function maybeDetermineSrcLang(logger, text, lang) {
    if ( isTextCloseToEnglish(text) ) {
        logger.debug("Text seems to match english already, so assuming english")
        return 'en'
    } else {
        var secondaryLang = await detectLanguage(text)

        if (ISO6391.validate(lang)) return lang
        else if (lang === 'iw') return 'he'
        else if (secondaryLang != null) return secondaryLang
        else return null
    }
}

async function detectLanguage(text) {
    let lang = ''
    await translate(text, {to: 'en'}).then(res => {
        if ( res.from.language.iso == 'iw') {
            lang = 'he'
        } else {
            lang = res.from.language.iso
        }
    })
    return lang
}

function isTextCloseToEnglish(text) {
    let topMatches = lngDetector.detect(text, config.translation.numberOfLanguages)
    for (const item of topMatches) {
      if ( item[0] === 'en' ) {
        return true
      }
    }
    return false
  }

exports.maybeDetermineSrcLang = maybeDetermineSrcLang;
exports.detectLanguage = detectLanguage;
exports.isTextCloseToEnglish = isTextCloseToEnglish;