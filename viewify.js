
Viewifier.prototype.genericHTML = function(genType) {
  var label = this.templates.genericTemplate.labelTemplate.replace(/{{name}}/g, genType.fieldName);
  var value = this.templates.genericTemplate.valueTemplate.replace(/{{type}}/g, genType.fieldType);

  if (genType.repeated) {
    value = value.replace(/{{add}}/g, this.templates.addTemplate);
  } else {
    value = value.replace(/{{add}}/g, "");
  }

  // need add button to add control

  return label+value;
}

Viewifier.prototype.unknownHTML = function(unknownTyoe) {
  var label = this.templates.unknownTemplate.labelTemplate.replace(/{{name}}/g, unknownTyoe.fieldName);
  var value = this.templates.unknownTemplate.valueTemplate.replace(/{{type}}/g, unknownTyoe.fieldType);
  value = value.replace(/{{add}}/g, "");

  return label+value;
}

Viewifier.prototype.stringHTML = function(strType) {
  if (!this.templates.stringTemplate) {
    return this.genericHTML(strType);
  }

  return this.templates.stringTemplate.replace(/{{name}}/g, strType.fieldName).replace(/{{type}}/g, strType.fieldType);
};

Viewifier.prototype.intHTML = function(intType) {
  if (!this.templates.stringTemplate) {
    return this.genericHTML(intType);
  }

  return this.templates.intTemplate.replace(/{{name}}/g, intType.fieldName).replace(/{{type}}/g, intType.fieldType);
};

Viewifier.prototype.objectHTML = function(obj) {
  var that = this;

  var eHTML = "";

  obj.fieldDef.forEach(function(o) {
    var fName = o.fieldType + "HTML";
    
    // if it doesn't exist use generic renderer?
    if (!that[fName]) {
      console.log("No rendering function found on Viewifier with name", fName);
      eHTML += that.unknownHTML(o);
      return 
    } 

    eHTML += that[fName](o);
  });

  var label = this.templates.nestingTemplate.labelTemplate.replace(/{{name}}/g, obj.fieldName);
  var value = this.templates.nestingTemplate.valueTemplate.replace(/{{nested}}/g, eHTML).replace(/{{type}}/g, obj.fieldType);

  return label+value;
};

Viewifier.prototype.show = function(elmtID) {
  var that = this;
  elmt = document.getElementById(elmtID);

  // convert each element in the array into html
  var h = that.objectHTML(that.obj);

  elmt.innerHTML = h;
};

Viewifier.prototype.toJSON = function() {
  // somehow convert all the input fields back into a JSON object
};

Viewifier.prototype.templates = {
  genericTemplate: {
    labelTemplate: "<tr><td><label for='{{name}}'>{{name}}</label></td>",
    valueTemplate: "<td><table class='{{type}}Value value'><tr><td><input placeholder='{{type}}' type='text'></input></td></tr>{{add}}</table></td></tr>"
  },
  addTemplate: "<tr><td><input type='button' value='Add'></input></td></tr>",
  nestingTemplate: {
    labelTemplate: "<table class='object value'><tr><td>{{name}}</td>",
    valueTemplate: "<td><table class='value nested {{type}}Value'>{{nested}}</table></td></tr></table>"
  },
  unknownTemplate: {
    labelTemplate: "<tr><td><label for='{{name}}'>{{name}}</label></td>",
    valueTemplate: "<td><table class='{{type}}Value value'><tr><td>Unsupported type: {{type}}</td></tr>{{add}}</table></td></tr>"
  }
}
function Viewifier (obj) {
  this.obj = obj;

}
