var langdetect = require('langdetect');
var DetectLanguage = require('detectlanguage');

class DetectionService {
    constructor(dl_key) {
        this.detectLang = new DetectLanguage(dl_key);
    }

    async detectLanguage(text) {
        let res = await this.detectLang.detect(text)
        let lang = res[0].language
        if ( lang == 'iw') {
            return 'he'
        } else if (lang == 'la') {
            // This is weird, but the detection service returns latin on '@' handles and emoji rich tweets. Let's black hole this until later.
            return 'en'
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