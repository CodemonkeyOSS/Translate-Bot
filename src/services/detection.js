var langdetect = require('langdetect');
var DetectLanguage = require('detectlanguage');

class DetectionService {
    constructor(dl_key) {
        this.detectLang = new DetectLanguage(dl_key);
    }

    async detectLanguage(text) {
        let res = await this.detectLang.detect(text)
        console.log(res)

        let lang = ''
        if (res[0].confidence < 10) {
            // Check if english is in top three since first result wasn't very confident.
            if (this.isEnglishTopThree(res)) {
                lang = 'en'
            } else { 
                lang = res[0].language
            }
        } else {
            if (lang == '' && res[0].isReliable) {
                lang = res[0].language
            } else {
                throw "unreliable"
            }
        }
        
        if ( lang == 'iw') {
            return 'he'
        } else if (lang == 'la') {
            // This is weird, but the detection service returns latin on '@' handles and emoji rich tweets. Let's black hole this until later.
            return 'en'
        } else {
            return lang
        }
    }

    isEnglishTopThree(detections) {
        var i;
        var limit = Math.min(3, detections.length)
        for (i = 0; i < limit; i++) {
            if (detections[i].language == 'en') return true
        }
        return false
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