var langdetect = require('langdetect');

class DetectionService {
    constructor({ translate }) {
        this.translate = translate;
    }

    async detectLanguage(text) {
        let res = await this.translate.detect(text)
        let lang = res[0].language
        if ( lang == 'iw') {
            return 'he'
        } else {
            return lang
        }
    }

    isMaybeEnglishOffline(text) {
        let result = langdetect.detect(text)
        for (var lang in result) {
            if (lang.lang == 'en') return true
        }
        return false
    }
}

module.exports = DetectionService;