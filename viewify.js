

Viewifier.prototype.stringHTML = function(strType) {
  return "<h1>" + strType.fieldName + "</h1>";
}

Viewifier.prototype.objectHTML = function(obj) {
  var that = this;

  var eHTML = "";

  eHTML += "<div>"
  obj.fieldDef.forEach(function(o) {
    var fName = o.fieldType + "HTML";
    if (!that[fName]) {
      console.log("No rendering function found on Viewifier with name", fName);
      return 
    } 

    eHTML += that[fName](o);
  });
  eHTML += "</div>"

  return eHTML
}

Viewifier.prototype.show = function(elmtID) {
  var that = this;
  elmt = document.getElementById(elmtID);

  // convert each element in the array into html
  var h = that.objectHTML(that.obj);

  elmt.innerHTML = h;
}

function Viewifier (obj) {
  this.obj = obj;
}
