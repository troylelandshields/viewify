
// Viewifier.prototype.genericHTML = function(genType) {
//   var label = this.templates.genericTemplate.labelTemplate.replace(/{{name}}/g, genType.fieldName);
//   var value = this.templates.genericTemplate.valueTemplate.replace(/{{type}}/g, genType.fieldType);

//   if (genType.repeated) {
//     value = value.replace(/{{add}}/g, this.templates.addTemplate).replace(/{{remove}}/g, this.templates.removeTemplate);
//   } else {
//     value = value.replace(/{{add}}/g, "").replace(/{{remove}}/g, "");
//   }

//   // need add button to add control

//   return label+value;
// }

Viewifier.prototype.unknownHTML = function(unknownType, parent) {
  var row = document.createElement("tr");
  var cell = document.createElement("td");
  var label = document.createElement("label");
  var labelText = document.createTextNode(unknownType.fieldName);

  label.appendChild(labelText);
  cell.appendChild(label);
  row.appendChild(cell);


  var valueCell = document.createElement("td");
  var valueText = document.createTextNode("Unsupported type: " + unknownType.fieldType);
  valueCell.appendChild(valueText);
  row.appendChild(valueCell);

  parent.appendChild(row);
}

// Viewifier.prototype.stringHTML = function(strType) {
//   if (!this.templates.stringTemplate) {
//     return this.genericHTML(strType);
//   }

//   return this.templates.stringTemplate.replace(/{{name}}/g, strType.fieldName).replace(/{{type}}/g, strType.fieldType);
// };

// Viewifier.prototype.intHTML = function(intType) {
//   if (!this.templates.stringTemplate) {
//     return this.genericHTML(intType);
//   }

//   return this.templates.intTemplate.replace(/{{name}}/g, intType.fieldName).replace(/{{type}}/g, intType.fieldType);
// };

Viewifier.prototype.enumHTML = function(enumType) {

  var label = this.templates.enumTemplate.labelTemplate.replace(/{{name}}/g, enumType.fieldName);
  var value = this.templates.enumTemplate.valueTemplate.replace(/{{type}}/g, enumType.fieldType);

  if (enumType.repeated) {
    value = value.replace(/{{add}}/g, this.templates.addTemplate).replace(/{{remove}}/g, this.templates.removeTemplate);
  } else {
    value = value.replace(/{{add}}/g, "").replace(/{{remove}}/g, "");
  }

  return label+value;
};

Viewifier.prototype.objectHTML = function(obj, parent) {
  if (!parent) {
    console.log("no parent element");
    return
  }

  var that = this;

  //   nestingTemplate: {
  //   labelTemplate: "<table class='object value'><tr><td>{{name}}</td>",
  //   valueTemplate: "<td><table class='value nested {{type}}Value'><tr><td>{{typeName}}</td><td>{{remove}}</td></tr>{{nested}}</table></td></tr>{{add}}</table>"
  // },

  var table = document.createElement("table");
  table.classList.add("value");
  table.classList.add("object");
  
  var row = document.createElement("tr");
  var nameCell = document.createElement("td");
  var nameText = document.createTextNode(obj.fieldName);

  nameCell.appendChild(nameText);
  row.appendChild(nameCell);


  var valueCell = document.createElement("td");
  var valueTable = document.createElement("table")
  valueTable.classList.add("nested");
  valueTable.classList.add("value");

  // var valueRow = document.createElement("tr")


  obj.fieldDef.forEach(function(o) {
    var fName = o.fieldType + "HTML";
    
    // if it doesn't exist use generic renderer?
    if (!that[fName]) {
      console.log("No rendering function found on Viewifier with name", fName);

      that.unknownHTML(o, valueTable);

      return 
    } 

    that[fName](o, valueTable);
  });

  valueCell.appendChild(valueTable)
  row.appendChild(valueCell);
  table.appendChild(row);

  parent.appendChild(table);

  // var label = this.templates.nestingTemplate.labelTemplate.replace(/{{name}}/g, obj.fieldName);
  // var value = this.templates.nestingTemplate.valueTemplate.replace(/{{nested}}/g, eHTML).replace(/{{type}}/g, obj.fieldType).replace(/{{typeName}}/g, obj.typeName);

  // if (obj.repeated) {
  //   value = value.replace(/{{add}}/g, this.templates.addTemplate).replace(/{{remove}}/g, this.templates.removeTemplate);
  // } else {
  //   value = value.replace(/{{add}}/g, "").replace(/{{remove}}/g, "");;
  // }

};

Viewifier.prototype.show = function(elmtID) {
  var that = this;
  elmt = document.getElementById(elmtID);
  console.log(elmtID, elmt);

  // convert each element in the array into html
  that.objectHTML(that.obj, elmt);

  // elmt.innerHTML = h;
};

Viewifier.prototype.toJSON = function() {
  // somehow convert all the input fields back into a JSON object
};

Viewifier.prototype.templates = {
  genericTemplate: {
    labelTemplate: "<tr><td><label for='{{name}}'>{{name}}</label></td>",
    valueTemplate: "<td><table class='{{type}}Value value'><tr><td><input placeholder='{{type}}' type='text'></input>{{remove}}</td></tr>{{add}}</table></td></tr>"
  },
  removeTemplate: "<input type='button' value='X'></input>",
  addTemplate: "<tr><td><input type='button' value='Add'></input></td></tr>",
  nestingTemplate: {
    labelTemplate: "<table class='object value'><tr><td>{{name}}</td>",
    valueTemplate: "<td><table class='value nested {{type}}Value'><tr><td>{{typeName}}</td><td>{{remove}}</td></tr>{{nested}}</table></td></tr>{{add}}</table>"
  },
  unknownTemplate: {
    labelTemplate: "<tr><td><label for='{{name}}'>{{name}}</label></td>",
    valueTemplate: "<td><table class='{{type}}Value value'><tr><td>Unsupported type: {{type}}{{remove}}</td></tr>{{add}}</table></td></tr>"
  },
  enumTemplate : {
    labelTemplate: "<tr><td><label for='{{name}}'>{{name}}</label></td>",
    valueTemplate: "<td><table class='{{type}}Value value'><tr><td><select id='{{name}}></select>{{remove}}</td></tr>{{add}}</table></td></tr>"
  }
}
function Viewifier (obj) {
  this.obj = obj;

}
