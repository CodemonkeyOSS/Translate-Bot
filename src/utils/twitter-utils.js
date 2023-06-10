
/**
 * isDistinctTwitterLinksInContent is self explanatory. It literally checks a message and if it has a twitter link, it extracts it.
 * 
 * Returns a set of potential matches
 * An empty set is akin to "no results"
 */
//TODO Support multiple links by putting all links into an array
function doTwitterLinksExistInContent(msg) {
    return getDistinctTwitterLinksInContent(msg.content).length > 0
 }

/**
 * getDistinctTwitterLinksInContent is self explanatory. It literally checks a message and if it has a twitter link, it extracts it.
 * 
 * NOTE: The regex is configured to ignore any line that starts with '>', so as to ignore quoted text and reduce translation cost and noise.
 * 
 * Returns a set of potential matches
 * An empty set is akin to "no results"
 */
//TODO Support multiple links by putting all links into an array
function getDistinctTwitterLinksInContent(msgContent) {
    var regex = /^(?!\>).*https:\/\/(?:www\.)?(?:mobile\.)?twitter\.com\/(?<handle>[a-zA-Z0-9_]+)\/status\/(?<status_id>[0-9]+)/gm
    let matches = []
    while((matchItem = regex.exec(msgContent)) != null) {
      matches.push(matchItem.groups)
    }
    matches = [...new Set(matches)]   // Removes any duplicate links if someone is dumb
    return matches
}

exports.doTwitterLinksExistInContent = doTwitterLinksExistInContent;
exports.getDistinctTwitterLinksInContent = getDistinctTwitterLinksInContent;