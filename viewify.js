
Viewifier.prototype.genericHTML = function(genType, parent) {
  var that = this;

  var row = document.createElement("tr");
  var cell = document.createElement("td");
  var label = document.createElement("label");
  label.setAttribute("for", genType.fieldName)
  var labelText = document.createTextNode(genType.fieldName);
  label.appendChild(labelText);
  cell.appendChild(label);
  row.appendChild(cell);

  var valueTable = document.createElement("table");

  var newRow = function() {
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    var valueCell = document.createElement("td");
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", genType.fieldType);
    valueCell.appendChild(input);

    if (genType.repeated) {

      var rmRow = function() {
        row.remove()
      }

      var removeBtn = that.templates.removeTemplate(rmRow);
      valueCell.appendChild(removeBtn);
    }

    row.appendChild(valueCell);
    // valueTable.appendChild(row);
    valueTable.insertBefore(row, valueTable.childNodes[valueTable.childNodes.length-1])
  }
  row.appendChild(valueTable);
  
  parent.appendChild(row);

  if (genType.repeated) {
    var addRow = this.templates.addTemplate(newRow);
    valueTable.appendChild(addRow);
  } else {
    newRow();
  }
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
};

Viewifier.prototype.objectHTML = function(obj, parent) {
  if (!parent) {
    console.log("no parent element");
    return
  }

  var that = this;

  var fieldTable = document.createElement("table");
  var fieldRow = document.createElement("tr");
  var fieldCell = document.createElement("td");

  var msgType = obj.typeName;
  if (obj.repeated) {
    msgType = "[]" + msgType
  }

  var nameText = document.createTextNode(obj.fieldName);

  var typeRow = document.createElement("tr");
  var typeCell = document.createElement("td");
  var typeText = document.createTextNode(msgType);
  typeCell.classList.add("message-type")

  typeCell.appendChild(typeText);
  typeRow.appendChild(typeCell);
  
  fieldCell.appendChild(nameText);
  fieldRow.appendChild(fieldCell);
  fieldTable.appendChild(fieldRow);

  fieldTable.appendChild(typeRow);

  var row = document.createElement("tr");
  var nameCell = document.createElement("td");

  nameCell.appendChild(fieldTable);
  row.appendChild(nameCell);

  var v = document.createElement("table");
  var newRow = function() {
    var vr = document.createElement("tr");

    if (obj.repeated) {
      // add remove button
      var rmRow = function() {
        vr.remove();
      }

      var removeBtn = that.templates.removeTemplate(rmRow);
      vr.appendChild(removeBtn);
    }

    var valueTable = document.createElement("table");
    valueTable.classList.add("nested");
    valueTable.classList.add("value");

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

    valueCell.appendChild(valueTable);
    vr.appendChild(valueCell);
    v.appendChild(vr);
    row.appendChild(v);

    v.insertBefore(vr, v.childNodes[v.childNodes.length-1])
  }
  
  parent.appendChild(row);

  if (obj.repeated) {
    var addRow = this.templates.addTemplate(newRow);
    parent.appendChild(addRow);
  } else {
    newRow();
  }

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
  removeTemplate: function(rmFn){ 
    var input = document.createElement("input");
    input.setAttribute("type", "button");
    input.setAttribute("value", "X");
    input.addEventListener("click", rmFn);
    return input;
  },
  addTemplate: function(addFn) {
    var input = document.createElement("input");
    input.setAttribute("type", "button");
    input.setAttribute("value", "Add");
    input.addEventListener("click", addFn);

    var cell = document.createElement("td");
    var row = document.createElement("tr");

    cell.appendChild(input);
    row.appendChild(cell);

    return row;
  },
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
