/*
    optionManager

    // ----------------------
    // functions for CMYK colors
    // ----------------------
    registCmykColor(id, cmykSpec, is_fill)
    ... keeps the color information of the paper object in memory.
    ... id: id of the paper object
        cmykSpec: a comma separated string which
            represents C,M,Y,K values. ex:"50.5,20,0,100"
        is_fill: true if the color is fillColor
  
    getRegistedColor(id, is_fill)
    ... takes the color information of the paper object out of memory.
        returns cmykSpec (see registCmykColor).
        if "id" is not in memory, returns "".
    ... id: id of the paper object
        is_fill: true if the color is fillColor
  
    // ----------------------
    // functions for UI and optional values
    // ----------------------
    setupOptionsUI(titles, values)
    ... sets up option UI.  maximum number of text boxes is 5.
    ... titles: titles for input text boxes, an array of string. max = 5
        values: default values for input text boxes, an array of numbers. max = 5
        ex.  setupOptionsUI(["item1", "item2", "item3"], [1, 2, 3])
                 -> 4th and 5th text boxes are hidden.
  
    getOptionsFromUI()
    ... gets values from option UI
        if there's a invalid value, shows an alert and return null.
  
    resetOptions()
    ... resets option UI to default status

    noOption()
    ... hides the UIs for option
    // ----------------------
*/

var optionManager = (function() {
    'use strict';

    var OPTION_COUNT = 5;

    // ----------------------
    // functions for CMYK colors
    // ----------------------
    // Since paper.js can't handle CMYK colors, these functions
    // keep values of them in "_ids" object, associated with
    // id of paper.Item.
  
    // _ids
    // key: id of paper.Item
    // value: CMYK instance
    var _ids = {};

    var CMYK = function(){
        // each value is comma separated cmyk values. ex:"50.5,20,0,100"
        this.fill;
        this.stroke;
    }
    // ----
    var registCmykColor = function(id, cmykSpec, is_fill){
        if(!(id in _ids)) _ids[id] = new CMYK();
        
        if(is_fill){
            _ids[id].fill = cmykSpec;  // ex:"50.5,20,0,100"
        } else {
            _ids[id].stroke = cmykSpec;
        }
    }
    // ----
    var getRegistedColor = function(id, is_fill){
      if(id in _ids){
          if(is_fill){
              if(_ids[id].fill) return "," + _ids[id].fill;
          } else {
              if(_ids[id].stroke) return "," + _ids[id].stroke;
          }
      }
      return "";
    }
    
    // ----------------------
    // functions for UI and optional values
    // ----------------------
    var setupOptionsUI = function(titles, values) {
        if(!titles || titles.length < 1){
            document.getElementById("div_no_option").style.display = "block";
            document.getElementById("div_options").style.display = "none";
        } else {
            document.getElementById("div_no_option").style.display = "none";
            for(var i = 1; i <= OPTION_COUNT; i++){
                if(i > titles.length){
                    document.getElementById("td" + i).innerText = "";
                    document.getElementById("input" + i).style.display = "none";
                } else {
                    document.getElementById("td" + i).innerText = titles[i-1];
                    document.getElementById("input" + i).value = values[i-1];
                }
            }
        }
    }
    // ----
    var getOptionsFromUI = function() {
        var options = [];
        
        for(var i = 1; i <= OPTION_COUNT; i++){
            try{
                var v = document.getElementById("input" + i).value;
                v = eval(v) - 0;
                options.push(v);
            } catch(e){
                alert(e);
                return null;
            }
        }
        
        return options;
    }
    // ----
    // reset the status of the UIs for option
    var resetOptions = function() {
        _ids = {};
      
        document.getElementById("table_options").style.display = "block";
        for(var i = 1; i <= OPTION_COUNT; i++){
            document.getElementById("td" + i).innerText = "item" + i;
            document.getElementById("input" + i).style.display = "block";
            document.getElementById("input" + i).value = 0;
        }
        
        document.getElementById("div_no_option").style.display = "none";
    }

    // ----
    // hides the UIs for option
    var noOption = function(){
        document.getElementById("table_options").style.display = "none";
        document.getElementById("div_no_option").style.display = "block";
    }
  
    // ------------------------------------
    return {
        registCmykColor : registCmykColor,
        getRegistedColor : getRegistedColor,
        setupOptionsUI : setupOptionsUI,
        getOptionsFromUI : getOptionsFromUI,
        resetOptions : resetOptions,
        noOption : noOption
        }
})();
