// object that is used to export "paper" objects onto an artboard
function M(){
    this.P = activeDocument.activeLayer.pathItems.add();
    this.P.stroked = false;
    this.P.filled = false;
    this.colorSpace = activeDocument.documentColorSpace;
}
M.prototype = {
    // each name of the method is shortened because
    // a series of code is passed to "csInterface.evalScript"
    // as a string type value
    //
    B : function(ax, ay, lx, ly, rx, ry){
        // add a pathPoint
        var pnt = this.P.pathPoints.add();
        pnt.anchor = [ax, ay];
        pnt.leftDirection = [ax + lx, ay + ly];
        pnt.rightDirection = [ax + rx, ay + ry];
    },
    C : function(){
        this.P.closed = true;
    },
    W : function(n){
        this.P.stroked = true;
        this.P.strokeWidth = n;
    },
    Sc : function(r, g, b, c, m, y, k){
        this.P.stroked = true;
        this.P.strokeColor = this._getColor(r, g, b, c, m, y, k);
    },
    Sx : function(){
        this.P.stroked = false;
    },
    Fc : function(r, g, b, c, m, y, k){
        this.P.filled = true;
        this.P.fillColor = this._getColor(r, g, b, c, m, y, k);
    },
    Fx : function(){
        this.P.filled = false;
    },
    Op : function(op){
        this.P.opacity = op;  // 0 - 100
    },
    _getColor : function(r, g, b, c, m, y, k){
        // _getColor(100) returns GrayColor(100)
        // _getColor(100,100,100) returns RGBColor(100,100,100)
        // _getColor(255,255,255,0,0,0,0) 
        //   if DocumentColorSpace is CMYK returns CMYKColor(0,0,0,0).
        //   if DocumentColorSpace is RGB  returns RGBColor(255,255,255).
        var col;
        if(b == undefined){  // gray
            col = new GrayColor();
            col.gray = r;
        } else {
            if(c != undefined && this.colorSpace == DocumentColorSpace.CMYK){
                col = new CMYKColor();
                col.cyan = c; col.magenta = m; col.yellow = y; col.black = k;
            } else {
                col = new RGBColor();
                col.red = r; col.green = g; col.blue = b;
            }
        }
        return col;
    }
}
// ----
function isBadCondition(){
    var errmsg = "";
    if(app.documents.length < 1){
        errmsg = "Please open a document to export";
    } else if(app.activeDocument.activeLayer.locked){
        errmsg = "Please unlock the active layer";
    } else if(app.activeDocument.activeLayer.hidden){
        errmsg = "Please make the active layer visible";
    }
    
    if(errmsg != ""){
        alert(errmsg);
        return true;
    }
    return false;
}
// ----
// shorten the length of a string form of a float value
function _f2s(f){
    var s = f.toFixed(4);
    if(s.indexOf(".") > 0){
        s = s.replace(/0+$/,"");
        return s.replace(/\.$/,"");
    }
}

// serialize a color object to draw on a canvas
function serializeColor(col){
    if(col.typename == "NoColor"){
        return ["N", 0, 0, 0, 0];
    } else if(col.typename == "GrayColor"){
        return ["G", _f2s(col.gray / 100), 0, 0, 0];
    } else if(col.typename == "RGBColor"){
        return ["RGB", _f2s(col.red / 255), _f2s(col.green / 255), _f2s(col.blue / 255), 0];
    } else if(col.typename == "CMYKColor"){
        return ["CMYK", _f2s(col.cyan), _f2s(col.magenta), _f2s(col.yellow), _f2s(col.black)];
    } else {
        // GradientColor, SpotColor etc.
        return ["UNKNOWN", 0, 0, 0, 0];
    }
}

// find the top-left point of paths
function getTopLeftOfPaths(paths){
    if(paths.length < 1) return [0,0];
    
    var top = paths[0].top;
    var left = paths[0].left;

    for(var i = 0, iEnd = paths.length; i < iEnd; i++){

        var cb = paths[i].controlBounds;  // left, top, right, bottom
        
        if(cb[1] > top) top = cb[1];
        if(cb[0] < left) left = cb[0];
    }
    return [top, left];
}

// serialize an array of pathItems to draw on a canvas
function serializePaths(){
    var paths = extractSelectedPaths();
    var data = [];

    var MARGIN_TOP = 50;
    var MARGIN_LEFT = 25;
    
    var top_left = getTopLeftOfPaths(paths);
    var top = top_left[0] + MARGIN_TOP;
    var left = top_left[1] - MARGIN_LEFT;
    
    for(var i = 0, iEnd = paths.length; i < iEnd; i++){
        var r = ["@"];  // "@" is a mark that means the beginning of a path
        var p = paths[i];
        
        r.push(p.closed ? "1" : "0");

        r.push([p.filled ? "1" : "0",
                serializeColor(p.fillColor)]);
        
        r.push([p.stroked && p.strokeColor.typename != "NoColor" ? "1" : "0",
                _f2s(p.strokeWidth),
                serializeColor(p.strokeColor)]);

        for(var j = 0, jEnd = p.pathPoints.length; j < jEnd; j++){
            var ppt = p.pathPoints[j];
            var anc = ppt.anchor;
            r.push([_f2s(anc[0] - left), _f2s(anc[1] - top),
                    _f2s(ppt.rightDirection[0] - anc[0]),
                    _f2s(ppt.rightDirection[1] - anc[1]),
                    _f2s(ppt.leftDirection[0] - anc[0]),
                    _f2s(ppt.leftDirection[1] - anc[1])]);
            // ignore pointType becauses paper js doesn't have this property
        }
        
        data[data.length] = r;
    }
    
    // "data" is passed to callback function as a comma separated string
    return data;
}

function extractSelectedPaths(items, paths){
    if(!items) items = app.activeDocument.selection;
    if(!paths) paths = [];
    for(var i = 0, iEnd = items.length; i < iEnd; i++){
        if(items[i].typename == "PathItem"){
            paths.push(items[i]);
        } else if(items[i].typename == "GroupItem"){
            extractSelectedPaths(items[i].pageItems, paths);
        } else if(items[i].tyepname == "CompoundPathItem"){
            extractSelectedPaths(items[i].pathItems, paths);
        }
    }
    return paths;
}
