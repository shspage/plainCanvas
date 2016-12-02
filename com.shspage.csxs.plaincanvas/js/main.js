/*global $, window, location, CSInterface, SystemPath, themeManager, paper, optionManager, undoManager*/

(function () {
    'use strict';
    
    // if true, show "debug" button and "reload" button
    var DEBUG_MODE = true;

    // Since html5 canvas uses RGB color, imported CMYK and GRAY colors
    // may look different from how they look on the artboard.
    // * If ALWAYS_EXPORT_RGB is false, the original CMYK colors are kept in memory
    // and are applied when they are exported. (When DefaultColorSpace of the artboard
    // is CMYK.)
    // * If ALWAYS_EXPORT_RGB is true, GRAY colors are exported in RGB.
    var ALWAYS_EXPORT_RGB = false;

    // port number defined in ".debug" file
    var DEBUG_TOOL_PORT_NUMBER = "8080";

    // encoding of a script file which is loaded
    var SCRIPT_ENCODING = "utf-8";


  
    var csInterface = new CSInterface();
    
    // Opens the chrome developer tools in host app
    function showDevTools() {
        if(confirm("open the debug tool?")){
            csInterface.openURLInDefaultBrowser("http://localhost:" + DEBUG_TOOL_PORT_NUMBER);
        }
    }
    // Reloads extension panel
    function reloadPanel() {
        if(confirm("reload the panel?")){
            location.reload();
        }
    }
    
    
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
    // functions to serialize/unserialize objects
    // ----------------------
    // shorten the length of a string form of a float value
    function f2s(f){
        var s = f.toFixed(4);
        if(s.indexOf(".") > 0){
            s = s.replace(/0+$/,"");
            return s.replace(/\.$/,"");
        }
    }

    // parseFloat
    function pf(s){ return parseFloat(s); }

    // get paths on canvas
    function getPathsOnCanvas(){
        var lay = paper.project.activeLayer;
        var paths = [];
        if(lay) getPathsOnCanvas_sub(paths, lay);
        return paths;
    }

    // sub function of getPathsOnCanvas
    function getPathsOnCanvas_sub(paths, gr){
        for(var i = gr.children.length - 1; i >= 0; i--){
            if(gr.children[i] instanceof paper.Path
               && gr.children[i].visible){  // items undoed by undoManager are invisible
                paths.push(gr.children[i]);
            } else if(gr.children[i] instanceof paper.Group){
                getPathsOnCanvas_sub(paths, gr.children[i]);
            }
        }
    }

    // corrects the range of the color
    function correctRange(v, maxval){
        return Math.max(0, Math.min(v, maxval));
    }
    
    // serialize a color of a paper object
    function serializePaperColor(col, c_id, is_fill){
        var s = "";
        var v;
        if(col.type == "gray"){
            v = correctRange(col.gray, 1);
            s = f2s(v * 255);
            s = ALWAYS_EXPORT_RGB
                ? s +","+ s +","+ s
                : f2s((1 - v) * 100);
        } else if(col.type == "rgb"){
            s = f2s(correctRange(col.red,   1) * 255) +","+
                f2s(correctRange(col.green, 1) * 255) +","+
                f2s(correctRange(col.blue,  1) * 255);
            if( ! ALWAYS_EXPORT_RGB) s += getRegistedColor(c_id, is_fill);
        } else{
            s = ALWAYS_EXPORT_RGB ? "0,0,0" : "0,0";  // black
        }
        return s;
    }

    // create a RGB type paper.Color instance from CMYK specification
    // it's inaccurate and just for displaying the color tentatively
    function cmyk2rgbColor(cmyk){  // cmyk: [c, m, y, k]
        var c = pf(cmyk[0]) / 100; var m = pf(cmyk[1]) / 100;
        var y = pf(cmyk[2]) / 100; var k = pf(cmyk[3]) / 100;
      
        var r = 1 - Math.min(1, c * (1 - k) + k);
        var g = 1 - Math.min(1, m * (1 - k) + k);
        var b = 1 - Math.min(1, y * (1 - k) + k);
        return new paper.Color(r, g, b);
    }

    // create a paper.Color instance from a serialized AI color
    function getPaperColorFromResult(p_id, color_type, c1, c2, c3, c4, is_fill) {
        var col;
        if(color_type == "N"){  // N,0,0,0,0,
            col = null;
        } else if(color_type == "G"){
            col = new paper.Color(pf(c1));
        } else if(color_type == "RGB"){
            col = new paper.Color(pf(c1), pf(c2), pf(c3));
        } else if(color_type == "CMYK"){
            var colorSpec = [c1, c2, c3, c4];
            if( ! ALWAYS_EXPORT_RGB) registCmykColor(p_id, colorSpec.join(","), is_fill)
            col = cmyk2rgbColor(colorSpec);
        } else {
            col = new paper.Color(0);
        }
        return col;
    }
    
    // ----------------------
    // functions to load a script file
    // ----------------------
    // load a script file and insert its contents into the document
    function insertPaperScript(fileobj){
        var fr = new FileReader();
        fr.onload = function(e){
            if(undoManager) undoManager.clearHistory();
            paper.clear();

            _ids = {};
            optionManager.resetOptions();
            
            var script = document.createElement("script");
            script.setAttribute("id","script_paper");
            script.type = "text/javascript";
            script.innerHTML = e.target.result;
            document.body.appendChild( script );
        }
        fr.readAsText(fileobj, SCRIPT_ENCODING);
    }


    // ----------------------
    // initialize the extension
    // ----------------------
    function init() {
        themeManager.init();

        if(DEBUG_MODE){
            $("#btn_debug").show();
            $("#btn_reload").show();
            $("#btn_debug").click(showDevTools);
            $("#btn_reload").click(reloadPanel);
        }

        // in button
        // serialize paths selected in artboard
        // and convert it into paths as paper object
        $("#btn_in").click(function () {
            csInterface.evalScript('serializePaths()', function(result){
                if(paper.project == null) return;
                if(result == "") return;
                
                //console.log(result);

                var r = result.split(",");
                var p;
                var i = 0;
                var rlen = r.length;
                
                while(i < rlen){
                    if(r[i] == "@"){
                        p = new paper.Path();
                        p.closed = r[++i] == "1";
                        
                        // fill
                        if(r[++i] == "1"){  // filled
                            p.fillColor = getPaperColorFromResult(
                              p.id, r[++i],r[++i],r[++i],r[++i],r[++i], true);
                            i++;
                        } else {
                            i += 6;
                        }
                        
                        // stroke
                        if(r[i++] == "1"){  // stroked
                            p.strokeWidth = pf(r[i]);
                            p.strokeColor = getPaperColorFromResult(
                              p.id, r[++i],r[++i],r[++i],r[++i],r[++i], false);
                            i++;
                        } else {
                            p.strokeWidth = 0;
                            p.strokeColor = null;
                            i += 6;
                        }
                        
                    } else {
                        var anc = new paper.Point(pf(r[i++]), -pf(r[i++]));
                        var handleOut = new paper.Point(pf(r[i++]), -pf(r[i++]));
                        var handleIn = new paper.Point(pf(r[i++]), -pf(r[i++]));
                        var seg = new paper.Segment(anc, handleIn, handleOut);
                        p.add(seg);
                    }
                }
            });
        });

        // out button
        // serialize paths on a canvas as a series of code
        // and eval it to draw the paths on an artboard
        $("#btn_out").click(function () {
            var paths = getPathsOnCanvas();
            var code = "(function(){";
            
            if(paths.length < 1){
                code += "alert('There is nothing to output');";
            } else {
                code += "if(isBadCondition()) return;";
                code += "var ";

                for(var i = paths.length - 1; i >= 0; i--){
                    var c = paths[i];
                    code += "m=new M();";
                    
                    if(c.closed) code += "m.C();";
                    
                    if(c.fillColor != null){
                        code += "m.Fc(" + serializePaperColor(c.fillColor, c.id, true) + ");";
                    }

                    if(c.strokeColor != null && c.strokeWidth > 0){
                        code += "m.W(" + f2s(c.strokeWidth) +");";
                        code += "m.Sc(" + serializePaperColor(c.strokeColor, c.id, false) + ");";
                    }

                    if(c.opacity < 1){
                        code += "m.Op(" + f2s(c.opacity * 100.0) + ");";
                    }
                    for(var j = 0, jEnd = c.segments.length; j < jEnd; j++){
                        var seg = c.segments[j];
                        code += "m.B(" + f2s(seg.point.x) + "," + f2s(-seg.point.y)
                            + "," + f2s(seg.handleIn.x) + "," + f2s(-seg.handleIn.y)
                                + "," + f2s(seg.handleOut.x) + "," + f2s(-seg.handleOut.y) + ");";
                    }
                }
            }
            code += "})();";
            
            //console.log(code);
            csInterface.evalScript(code);
        });

        // option button
        // show or hide controls for optional values
        $("#btn_opt").click(function () {
            $("#div_options").toggle();
            $("#div_screen").toggle();
        });

        // undo ( < ) button
        // you need to call undoManager.keep( *item* ) previously
        // to regist an *item* as a target of undo/redo
        $("#btn_undo").click(function(e){
           if(undoManager) undoManager.undo();
        });

        // redo ( > ) button
        $("#btn_redo").click(function(e){
            if(undoManager) undoManager.redo();
        });
        
        // clear button
        $("#btn_clear").click(function(e){
            if(confirm("clear the canvas?")){
                if(undoManager) undoManager.clearHistory();
                if(paper.project){
                    var cs = paper.project.activeLayer.children;
                    for(var i = cs.length - 1; i >= 0; i--){
                        cs[i].remove();
                    }
                }
            }
        });
        
        // file select button
        // load a javascript file and setup paper again
        $("#file").change(function(e){
            var fileobj = e.target.files[0];
            var type = fileobj.type;
            
            if(type != "application/x-javascript"
               && type != "application/javascript"
               && type != "text/javascript"){
                
                if(type == ""){
                    type = "(unknown type)";
                }
                
                alert("Please select a JavaScript file.\rSelected file is \"" + type + "\".");
                return false;
            }
            insertPaperScript(fileobj);
        });
    }
    
    init();

}());
    
