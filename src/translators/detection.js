const LanguageDetect = require('languagedetect');
const ISO6391 = require('iso-639-1');
var config = require('../config/config.json');

/**
 * Build language detector object
 */
const lngDetector = new LanguageDetect();
lngDetector.setLanguageType('iso2');

function maybeDetermineSrcLang(logger, text, lang) {
    if ( isTextCloseToEnglish(text) ) {
        logger.debug("Text seems to match english already, so assuming english")
        return 'en'
    } else {
        if (ISO6391.validate(lang)) {
            return lang
        } else if (lang === 'iw') {
            return 'he'
        } else {
            return null
        }
    }
}

function detectLanguage(text) {
    return lngDetector.detect(text, config.translation.numberOfLanguages)
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