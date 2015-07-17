/*
  undoManager
  

    undoManager.keep(item);
    ... regist an item as a target of undo/redo

    undoManager.undo();
    ... perform undo
        (it just makes the last item kept invisible)
    
    undoManager.redo();
    ... preform redo
        (it makes the last item undoed visible)
    
    undoManager.clearHistory();
    ... clears undo/redo storage.
        (also removes invisible items in the history)

  
    undoManager.keep([item, item, item...], "dd");
    ... regist items as targets of undo/redo
    
    undoManager.keep(item, "m");
    ... regist a translation of an item as a target of undo/redo
*/

var undoManager = (function() {
  'use strict';
  
  var _UNDO_LIMIT = 200;

  var _MODE_DRAW = "d";
  var _MODE_DRAW_ITEMS = "dd";
  var _MODE_MOVE = "m";

  
  var _undoRedoSystemArray = function( name ){
    this.name = name;
    this.r = [];
  };
  _undoRedoSystemArray.prototype = {
    clear : function(limit, remove_visible_item){
      if(!limit) limit = 0;
      if(!remove_visible_item) remove_visible_item = false;
      
      var arr;
      var typ;
      var itm;
      
      while(this.r.length > limit){
        arr = this.r.shift();
        typ = arr[0];
        itm = arr[1];
        if(typ == _MODE_DRAW_ITEMS){
          if(itm){
            for(var i = itm.length - 1; i >= 0; i--){
              if(itm[i] && (remove_visible_item || !itm[i].visible)){
                itm[i].remove();
              }
            }
          }
        } else {
          if(itm && (remove_visible_item || !itm.visible)){
            itm.remove();
          }
        }
      }
    },
      
    store : function(arr){
      this.r.push(arr);
      if(_UNDO_LIMIT > 0 && this.name == "undo"){
        this.clear(_UNDO_LIMIT, true);
      }
    }
  };
 
  var undoArray = new _undoRedoSystemArray("undo");
  var redoArray  = new _undoRedoSystemArray("redo");
  
  var _perform = function( arr, is_undo ){
    var itm = arr[1];
    if(arr[0] == _MODE_DRAW){
      if(itm){
        itm.visible = ! itm.visible;
      }
      
    } else if(arr[0] == _MODE_DRAW_ITEMS){
      // itm = [item, item,...
      for(var i = itm.length - 1; i >= 0; i--){
        if(itm[i]){
          itm[i].visible = ! itm[i].visible;
        }
      }
      
    } else if(arr[0] == _MODE_MOVE){
      itm.translate(is_undo ? arr[2] : arr[3]);
    }
  }
  
  var undo = function(){
    if(undoArray.r.length > 0){
      var arr = undoArray.r.pop();
      _perform( arr, true );
      redoArray.store( arr );
    }
  }
  
  var redo = function(){
    if(redoArray.r.length > 0){
      var arr = redoArray.r.pop();
      _perform( arr, false );
      undoArray.store( arr );
    }
  }
  
  var keep = function(item, mode){
    if(!mode) mode = _MODE_DRAW;
    undoArray.store([mode, item]);
    redoArray.clear();
  }

  var clearHistory = function(){
    undoArray.clear();
    redoArray.clear();
  }
  
  return {
      undo : undo,
      redo : redo,
      keep : keep,
      clearHistory : clearHistory
  }
})();
