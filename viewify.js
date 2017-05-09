
Viewifier.prototype.genericHTML = function(genType, parent, transform) {
  var that = this;

  if (!transform) {
    transform = function(v) {
      return v;
    };
  }

  var row = document.createElement("tr");
  var cell = document.createElement("td");
  var label = document.createElement("label");
  label.setAttribute("for", genType.fieldName)
  var labelText = document.createTextNode(genType.fieldName);
  label.appendChild(labelText);
  cell.appendChild(label);
  row.appendChild(cell);

  var valueTable = document.createElement("table");

  var rowGetters = [];
  var removers = [];
  var reset;

  var newRow = function(v) {
    var getFunc;

    var row = document.createElement("tr");
    var cell = document.createElement("td");
    var valueCell = document.createElement("td");
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", genType.fieldType);
    valueCell.appendChild(input);

    if (v && v.type != 'click') {
      input.value = v;
    }

    getFunc = function(v) {
      return input.value;
    }

    rowGetters.push(getFunc);
    
    var rmRow = function() {
      row.remove()
      var index = rowGetters.indexOf(getFunc);
      rowGetters.splice(index, 1);
    }
    if (genType.repeated) {

      removers.push(rmRow);

      var removeBtn = that.templates.removeTemplate(rmRow);
      valueCell.appendChild(removeBtn);
    }

    row.appendChild(valueCell);
    // valueTable.appendChild(row);
    valueTable.insertBefore(row, valueTable.childNodes[valueTable.childNodes.length-1])
    
    return rmRow;
  }
  row.appendChild(valueTable);
  
  parent.appendChild(row);

  if (genType.repeated) {
    var addRow = this.templates.addTemplate(newRow);
    valueTable.appendChild(addRow);
  } else {
    reset = newRow();
  }

  return {
    set: function(value){
      if (genType.repeated) {
        removers.forEach(function(r){
          r();
        });

        value.forEach(function(v){
          newRow(v);
        });

        return
      }

      reset();

      reset = newRow(value);
    },
    get: function() {
      if (genType.repeated) {
        return rowGetters.map(function(x) {
          return transform(x());
        });
      }

      return transform(rowGetters[0]());
    }
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

  return function() {
    return "?";
  }
}

Viewifier.prototype.stringHTML = function(strType, parent) {
  return this.genericHTML(strType, parent);
};

Viewifier.prototype.intHTML = function(intType, parent) {
  var intTransform = function(v) {
    var val = parseInt(v, 10);

    if(isNaN(val)) {
      return 0;
    }

    return val;
  }

  return this.genericHTML(intType, parent, intTransform);
};

Viewifier.prototype.int32HTML = Viewifier.prototype.intHTML;
Viewifier.prototype.int64HTML = Viewifier.prototype.intHTML; 

Viewifier.prototype.enumHTML = function(enumType, parent) {
  var that = this;

  var row = document.createElement("tr");
  var cell = document.createElement("td");
  var label = document.createElement("label");
  label.setAttribute("for", enumType.fieldName);
  var labelText = document.createTextNode(enumType.fieldName);

  label.appendChild(labelText);
  cell.appendChild(label);
  row.appendChild(cell);

  var valueTable = document.createElement("table");


  var rowGetters = [];
  var removers = [];
  var reset;

  var newRow = function(value) {

    var row = document.createElement("tr");
    var cell = document.createElement("td");
    var valueCell = document.createElement("td");
    var select = document.createElement("select");

    enumType.values.forEach(function(v){
      var opt = document.createElement("option"); 
      opt.text = v.display;
      opt.value = v.value;
      select.add(opt);
    });

    if (value && value.type != 'click') {
      select.value = value;
    }
    
    valueCell.appendChild(select);
    row.appendChild(valueCell);

    parent.appendChild(row);

    var getFunc = function(){
      return select.value;
    }

    rowGetters.push(getFunc);

    var rmRow = function() {
      row.remove();
      var index = rowGetters.indexOf(getFunc);
      rowGetters.splice(index, 1);
    }

    if (enumType.repeated) {
      removers.push(rmRow);

      var removeBtn = that.templates.removeTemplate(rmRow);
      valueCell.appendChild(removeBtn);
    }

    valueTable.insertBefore(row, valueTable.childNodes[valueTable.childNodes.length-1])
    return rmRow;
  };

  row.appendChild(valueTable);
  parent.appendChild(row);

  if (enumType.repeated) {
    var addRow = that.templates.addTemplate(newRow);
    valueTable.appendChild(addRow);
  } else {
    reset = newRow();
  }

  return {
    set : function(value){
      if (enumType.repeated) {
        removers.forEach(function(r){
          r();
        })

        value.forEach(function(value){
          newRow(value);
        });

        return
      }

      reset();
      reset = newRow(value);
    },
    get: function() {
      if (enumType.repeated) {
        return rowGetters.map(function(x) {
          return x();
        });
      }

      return rowGetters[0]();
    },
  }
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

  var rowGetters = [];
  var removers = [];

  var v = document.createElement("table");
  var newRow = function(populateValue) {
    var vr = document.createElement("tr");


    var valueTable = document.createElement("table");
    valueTable.classList.add("nested");
    valueTable.classList.add("value");

    var modelHelper = {};
    obj.fieldDef.forEach(function(o) {
      var fName = o.fieldType + "HTML";
      
      // if it doesn't exist use generic renderer?
      if (!that[fName]) {
        console.log("No rendering function found on Viewifier with name", fName);
        that.unknownHTML(o, valueTable);

        return 
      } 

      modelHelper[o.fieldName] = that[fName](o, valueTable);
    });

    if (populateValue) {
      Object.keys(populateValue).forEach(function(k){
        if (!modelHelper[k]) { 
          return; 
        }

        modelHelper[k].set(populateValue[k]);
      });
    }

    var valueCell = document.createElement("td");

    valueCell.appendChild(valueTable);
    vr.appendChild(valueCell);
    v.appendChild(vr);
    row.appendChild(v);

    v.insertBefore(vr, v.childNodes[v.childNodes.length-1])

    var rowGetter = function(){
      var model = {};

      Object.keys(modelHelper).forEach(function(k) {
        model[k] = modelHelper[k].get();
      });

      return model;
    };
    rowGetters.push(rowGetter);

    var rmRow = function() {
      vr.remove();
      var index = rowGetters.indexOf(rowGetter);
      rowGetters.splice(index, 1);
    }

    if (obj.repeated) {
      // add remove button
      var removeBtn = that.templates.removeTemplate(rmRow);
      vr.appendChild(removeBtn);

      removers.push(rmRow);
    }


    return rmRow;
  }
  
  parent.appendChild(row);

  var reset;
  if (obj.repeated) {
    var addRow = this.templates.addTemplate(newRow);
    parent.appendChild(addRow);
  } else {
    reset = newRow();
  }

  return {
    set: function(value){
      if (obj.repeated) {
        removers.forEach(function(r){
          r();
        });

        value.forEach(function(v){
          newRow(v);
        });

        return;
      }

      reset();
      reset = newRow(value);
    },
    get: function() {
      if (obj.repeated) {
        return rowGetters.map(function(x) {
          return x();
        });
      }

      return rowGetters[0]();
    }
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
  var modelHelper = that.objectHTML(that.obj, table, that.model);

  that.modelHelper = modelHelper;

  elmt.appendChild(table);
};

Viewifier.prototype.Model = function() {
  var that = this;
  return that.modelHelper.get();
};

Viewifier.prototype.Load = function(value) {
  var that = this;
  return that.modelHelper.set(value);
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
  this.model = {};
}


function Row() {
}

Row.prototype.getValue = function() {
 console.log("return a value");

 return "some value!";
}

Row.prototype.setValue = function(v) {
  console.log("set a value", v);
}