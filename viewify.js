
Viewifier.prototype.genericHTML = function(genType, parent) {
  var row = document.createElement("tr");
  var cell = document.createElement("td");
  var label = document.createElement("label");
  label.setAttribute("for", genType.fieldName)
  var labelText = document.createTextNode(genType.fieldName);

  label.appendChild(labelText);
  cell.appendChild(label);
  row.appendChild(cell);


  var valueCell = document.createElement("td");
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("placeholder", genType.fieldType);
  valueCell.appendChild(input);
  row.appendChild(valueCell);

  parent.appendChild(row);
}

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

Viewifier.prototype.stringHTML = function(strType, parent) {
  return this.genericHTML(strType, parent);
};

Viewifier.prototype.intHTML = function(intType, parent) {
  return this.genericHTML(intType, parent);
};

Viewifier.prototype.enumHTML = function(enumType, parent) {

  // enumTemplate : {
  //   labelTemplate: "<tr><td><label for='{{name}}'>{{name}}</label></td>",
  //   valueTemplate: "<td><table class='{{type}}Value value'><tr><td><select id='{{name}}></select>{{remove}}</td></tr>{{add}}</table></td></tr>"
  // }

  var row = document.createElement("tr");
  var cell = document.createElement("td");
  var label = document.createElement("label");
  label.setAttribute("for", enumType.fieldName);
  var labelText = document.createTextNode(enumType.fieldName);

  label.appendChild(labelText);
  cell.appendChild(label);
  row.appendChild(cell);


  var valueCell = document.createElement("td");
  var select = document.createElement("select");

  enumType.values.forEach(function(v){
    var opt = document.createElement("option"); 
    opt.text = v.display;
    opt.value = v.value;
    select.add(opt);
  });
  
  valueCell.appendChild(select);
  row.appendChild(valueCell);

  parent.appendChild(row);


  // var label = this.templates.enumTemplate.labelTemplate.replace(/{{name}}/g, enumType.fieldName);
  // var value = this.templates.enumTemplate.valueTemplate.replace(/{{type}}/g, enumType.fieldType);

  // if (enumType.repeated) {
  //   value = value.replace(/{{add}}/g, this.templates.addTemplate).replace(/{{remove}}/g, this.templates.removeTemplate);
  // } else {
  //   value = value.replace(/{{add}}/g, "").replace(/{{remove}}/g, "");
  // }

  // return label+value;
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

  var row = document.createElement("tr");
  var nameCell = document.createElement("td");
  var nameText = document.createTextNode(obj.fieldName);

  nameCell.appendChild(nameText);
  row.appendChild(nameCell);

  var valueTable = document.createElement("table");
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


  var valueCell = document.createElement("td");

  valueCell.appendChild(valueTable)
  row.appendChild(valueCell);
  parent.appendChild(row);


  // var label = this.templates.nestingTemplate.labelTemplate.replace(/{{name}}/g, obj.fieldName);
  // var value = this.templates.nestingTemplate.valueTemplate.replace(/{{nested}}/g, eHTML).replace(/{{type}}/g, obj.fieldType).replace(/{{typeName}}/g, obj.typeName);

  // if (obj.repeated) {
  //   value = value.replace(/{{add}}/g, this.templates.addTemplate).replace(/{{remove}}/g, this.templates.removeTemplate);
  // } else {
  //   value = value.replace(/{{add}}/g, "").replace(/{{remove}}/g, "");;
  // }

};


// should alawys pass in the table to which you need to add your row
Viewifier.prototype.show = function(elmtID) {
  var that = this;
  elmt = document.getElementById(elmtID);
  console.log(elmtID, elmt);


  var table = document.createElement("table");
  table.classList.add("value");
  table.classList.add("object");
  

  // convert each element in the array into html
  that.objectHTML(that.obj, table);

  elmt.appendChild(table);
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
