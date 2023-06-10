const assert = require('assert');
const links = require('./links.json')
const twitterUtils = require('../src/utils/twitter-utils')
const twitterTranslator = require('../src/translators/twitter_api')

describe('Verify twitter url cases', function() {
    describe('Single link behavior', function() {
        describe('single twitter link alone', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `${links.Arabic1.url}`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Single match object', function() {
                assert.strictEqual(matches.length, 1)
                assert.strictEqual(matches[0].handle, links.Arabic1.handle)
                assert.strictEqual(matches[0].status_id, links.Arabic1.msg_id)
            })
        })
        describe('Single twitter link in discord quote', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `> ${links.Arabic1.url}`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Single match object', function() {
                assert.strictEqual(matches.length, 0)
            })
        })
        describe('Single twitter link with text before', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `Have you seen this tweet?: ${links.Arabic1.url}`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Single match object', function() {
                assert.strictEqual(matches.length, 1)
                assert.strictEqual(matches[0].handle, links.Arabic1.handle)
                assert.strictEqual(matches[0].status_id, links.Arabic1.msg_id)
            })
        })
        describe('Single twitter link with text after', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `${links.Arabic1.url} Can you believe this tweet?`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Single match object', function() {
                assert.strictEqual(matches.length, 1)
                assert.strictEqual(matches[0].handle, links.Arabic1.handle)
                assert.strictEqual(matches[0].status_id, links.Arabic1.msg_id)
            })
        })
        describe('Single twitter link with text before and after', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `${links.Arabic1.url} Can you believe this tweet?`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Single match object', function() {
                assert.strictEqual(matches.length, 1)
                assert.strictEqual(matches[0].handle, links.Arabic1.handle)
                assert.strictEqual(matches[0].status_id, links.Arabic1.msg_id)
            })
        })
    })

    describe('Multiple link behavior', function() {
        describe('Two twitter links on same line', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `${links.Arabic1.url} ${links.Sindhi1.url}`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Only matches last link', function() {
                assert.strictEqual(matches.length, 1)
                assert.strictEqual(matches[0].handle, links.Sindhi1.handle)
                assert.strictEqual(matches[0].status_id, links.Sindhi1.msg_id)
            })
        })
        describe('Two twitter links in discord quote', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `> ${links.Arabic1.url} ${links.Sindhi1.url}`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Single match object', function() {
                assert.strictEqual(matches.length, 0)
            })
        })
        describe('Two twitter links on different lines', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `${links.Arabic1.url}\n${links.Sindhi1.url}`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Two match objects', function() {
                assert.strictEqual(matches.length, 2)
                assert.strictEqual(matches[0].handle, links.Arabic1.handle)
                assert.strictEqual(matches[0].status_id, links.Arabic1.msg_id)
                assert.strictEqual(matches[1].handle, links.Sindhi1.handle)
                assert.strictEqual(matches[1].status_id, links.Sindhi1.msg_id)
            })
        })
        describe('Two twitter links on separate lines with text before', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `Have you seen?: ${links.Arabic1.url}\nAnd also: ${links.Sindhi1.url}`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Two match objects', function() {
                assert.strictEqual(matches.length, 2)
                assert.strictEqual(matches[0].handle, links.Arabic1.handle)
                assert.strictEqual(matches[0].status_id, links.Arabic1.msg_id)
                assert.strictEqual(matches[1].handle, links.Sindhi1.handle)
                assert.strictEqual(matches[1].status_id, links.Sindhi1.msg_id)
            })
        })
        describe('Two twitter links on separate lines with text after', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `${links.Arabic1.url} Can you believe this tweet?\nWhat about this: ${links.Sindhi1.url}`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Two match objects', function() {
                assert.strictEqual(matches.length, 2)
                assert.strictEqual(matches[0].handle, links.Arabic1.handle)
                assert.strictEqual(matches[0].status_id, links.Arabic1.msg_id)
                assert.strictEqual(matches[1].handle, links.Sindhi1.handle)
                assert.strictEqual(matches[1].status_id, links.Sindhi1.msg_id)
            })
        })
        describe('Two twitter links on separate lines with text before and after', function() {
            let matches = {}
            beforeEach(function() {
                const testContent = `OMG: ${links.Arabic1.url} Can you believe this tweet?\n And I cant believe this ${links.Sindhi1.url} was said!`
                matches = twitterUtils.getDistinctTwitterLinksInContent(testContent)
            })
            it('Two match objects', function() {
                assert.strictEqual(matches.length, 2)
                assert.strictEqual(matches[0].handle, links.Arabic1.handle)
                assert.strictEqual(matches[0].status_id, links.Arabic1.msg_id)
                assert.strictEqual(matches[1].handle, links.Sindhi1.handle)
                assert.strictEqual(matches[1].status_id, links.Sindhi1.msg_id)
            })
        })
    })
})