var langdetect = require('langdetect');

class DetectionService {
    constructor({ translate }) {
        this.translate = translate;
    }

    async detectLanguage(text) {
        // Hold on detecting with GCP for now
        //let res = await this.translate.detect(text)
        let res = langdetect.detect(text)
        let lang = res[0].lang
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