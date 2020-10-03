var dateFormat = require('dateformat')

function prettyPrintDate(dateString) {
  let date = new Date(dateString)
  let formattedDate = dateFormat(date, "m/d/yyyy")
  let formattedTime = dateFormat(date, "h:M:ss TT")
  return `${formattedDate} at ${formattedTime}`
}

exports.prettyPrintDate = prettyPrintDate;