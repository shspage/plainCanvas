/*
    optionManager
    v.1.1

    // ----------------------
    // functions for UI and optional values
    // ----------------------
    setupOptionsUI(titles, options)
    ... titles: titles for input text boxes, an array of string. max = 5
        options: an object which has properties with a name of each title.
                 each value must be a number.
        ex.  setupOptionsUI(["item1", "item2", "item3"], options)
                 -> 4th and 5th text boxes are hidden.
                 -> options = { "item1":0, "item2":1, ... }
    ... sets up option UI.  maximum number of text boxes is 5.
    ... "options" can be an array of number. if you want to use a title
        different from the property name of "options", use this style.
  
    getOptionsFromUI(options)
    ... options: an object
    ... gets values from option UI, and set as properties of options
        with a name of the title of the each input text box.
        if there's a invalid value, shows an alert and return 0.
        otherwise return 1.
    ... if "options" is undefined, returns an array of values.
        ( on error, returns null )
  
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
    // functions for UI and optional values
    // ----------------------
    var setupOptionsUI = function(titles, options) {
        if(options instanceof Array){
            // obsolete style
            // ex. titles:["item1","item2","item3"], options:[1,2,3]
            _setupOptionsUI_main(titles, options);
            return;
        }
        
        var values = [];
        for(var i = 0; i < titles.length; i++){
            values.push(options[titles[i]]);
        }
        _setupOptionsUI_main(titles, values);
    }
    
    var _setupOptionsUI_main = function(titles, values) {
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
    var getOptionsFromUI = function(options) {
        if(!options){
            return _getOptionsFromUI_returnArray();
        }
        
        for(var i = 1; i <= OPTION_COUNT; i++){
            try{
                var title = document.getElementById("td" + i).innerText;
                if(title != ""){
                    var v = document.getElementById("input" + i).value;
                    v = eval(v) - 0;
                    options[title] = v;
                }
            } catch(e){
                alert(e);
                return 0;
            }
        }
        return 1;
    }
    // ----
    // reset the status of the UIs for option
    var resetOptions = function() {
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
    // obsolete
    var _getOptionsFromUI_returnArray = function() {
        var optionalValues = [];
        
        for(var i = 1; i <= OPTION_COUNT; i++){
            try{
                var v = document.getElementById("input" + i).value;
                v = eval(v) - 0;
                optionalValues.push(v);
            } catch(e){
                alert(e);
                return null;
            }
        }
        
        return optionalValues;
    }
    
  
    // ------------------------------------
    return {
        setupOptionsUI : setupOptionsUI,
        getOptionsFromUI : getOptionsFromUI,
        resetOptions : resetOptions,
        noOption : noOption
        }
})();
