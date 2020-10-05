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
    }
    return await detectLanguage(text)
}

async function detectLanguage(text) {
    let res = await translate(text, {to: 'en'})
    if ( res.from.language.iso == 'iw') {
        return 'he'
    } else {
        return res.from.language.iso
    }
    
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