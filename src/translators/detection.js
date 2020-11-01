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
}

module.exports = DetectionService;