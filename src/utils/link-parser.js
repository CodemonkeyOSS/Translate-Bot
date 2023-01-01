/*
  Is this just a single link in the tweet?
*/
function containsOnlyLink(text) {
    var regexTwitterShort = /^https:\/\/t\.co\/[a-zA-Z]+$/
    while((matchItem = regexTwitterShort.exec(text)) != null) {
      if ( matchItem[0] === text) return true
    }
  
    var regexOnlyUrl = /^(?<!\>.+)((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/
    while((matchItem = regexOnlyUrl.exec(text)) != null) {
      if ( matchItem[0] === text ) return true
    }
    
    return false
}

function containsAnyLink(text) {
  var regexOnlyUrl = /(?<!\>.+)((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
  while((matchItem = regexOnlyUrl.exec(text)) != null) {
    if ( matchItem[0] ) return true
  }
  return false
}

exports.containsOnlyLink = containsOnlyLink;
exports.containsAnyLink = containsAnyLink;