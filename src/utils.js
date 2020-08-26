var dateFormat = require('dateformat')

function prettyPrintDate(dateString) {
  let date = new Date(dateString)
  let formattedDate = dateFormat(date, "m/d/yyyy")
  let formattedTime = dateFormat(date, "h:M:ss TT")
  return `${formattedDate} at ${formattedTime}`
}

function CheckMedia (json){
  var mediaCount = 0;


  if(json.entities.hasProperties){
      console.log('has properties');
      json.entities.media.forEach(element => {
        console.log(element.type);
        if(element.type != null){
          mediaCount += 1;
        }
      });
    }
    else{
      console.log('no properties');
      var ee = false;
      "extended_entities" in json ? ee=true : ee=false;
      if(ee){
      if(json.extended_entities.hasProperties){
      json.extended_entities.media.forEach(element => {
      console.log(element.type);
      if(element.type != null){
        mediaCount += 1;
      }
    });
      }
      }
    }
    
return mediaCount;
}

exports.prettyPrintDate = prettyPrintDate;
exports.CheckMedia = CheckMedia;