// cylinder
(function() {
    var canvas = document.getElementById("canvas");
    paper.setup(canvas);
    var tool = new paper.Tool();
    
    var hlen = 4 * (Math.sqrt(2) - 1) / 3;
    var MPId = 180; // Math.PI;
    var HPId = 90;  //Math.PI / 2;
    var WPId = 360;  //Math.PI * 2;
    var HPI = Math.PI / 2;
    
    var grs;  // groups

    // ----------------------------------------------
    var values = { 
    diameter: 10,
    height:   30,
    interval: 20,
    jitter:   18,
    ok: 0
    };
    
    function setupOptions(){
        optionManager.setupOptionsUI(["diameter", "height", "interval", "jitter"],
                                     [values.diameter, values.height, values.interval, values.jitter]);
    }
    // ----------------------------------------------
    function mm2pt(n){  return n * 2.83464567;  }
    // ----------------------------------------------
    tool.onMouseDown = function(event){
        var opt = optionManager.getOptionsFromUI();
        if(opt){
            values.diameter = opt[0];
            values.height = opt[1];
            values.interval = opt[2];
            values.jitter = opt[3];
            values.ok = 1;
        } else {
            values.ok = 0;
        }
        
        tool.minDistance = values.interval;
        
        grs = new paper.Group();
        
        grs.addChild(drawCylinder(event.point));
    }
    // ----------------------------------------------
    tool.onMouseDrag = function(event){
        if(values.ok == 0) return;
        
        var jitter_vector = (event.point.subtract(event.lastPoint)).normalize().rotate(HPId);
        
        grs.addChild(drawCylinder(event.point.add(
            jitter_vector.multiply((Math.random() - 0.5) * values.jitter))));
    }
    // ----------------------------------------------
    tool.onMouseUp = function(){
        if(values.ok == 0) return;
        
        if(grs.children.length < 1){
            grs.remove();
        } else {
            undoManager.keep(grs);
        }
        grs = null;
    }
    // ----------------------------------------------
    function drawCylinder(pnt){
        var d = values.diameter;
        var r = values.diameter / 2;  // radius
        var h = values.height;
        
        var rad_v = (Math.random() * 0.8 + 0.1) * HPI;
        var sn = Math.sin(rad_v);
        var cs = Math.cos(rad_v);
            
        var v  = new paper.Point(1, 0);
        var v0 = new paper.Point(0, 0);
        
        var path = make_a_path(1, new paper.GrayColor(1));
        path.closed = true;
        
        var gr = new paper.Group();
        gr.addChild(path);
        
        var seg = path.segments;
        
        path.addSegments([
            new paper.Segment(v.rotate(HPId).multiply(r).multiply(new paper.Point(1, sn)),
                              v.multiply(r * hlen),
                              v.multiply(- r * hlen)),
            new paper.Segment(v.rotate(MPId).multiply(r),
                              v.rotate(HPId).multiply(r * hlen).multiply(new paper.Point(1, sn)),
                              v0)
            ]);
        path.addSegments([
            new paper.Segment(seg[1].point.add(new paper.Point(0, - h * cs)),
                              v0,
                              seg[1].handleIn.multiply(-1)),
            new paper.Segment(seg[0].point.add(new paper.Point(0, - h * cs - d * sn)),
                              seg[0].handleOut,
                              seg[0].handleIn)
            ]);
        path.addSegments([
            new paper.Segment(seg[2].point.add(new paper.Point(d, 0)),
                              seg[2].handleOut,
                              v0),
            new paper.Segment(seg[1].point.add(new paper.Point(d, 0)),
                              v0,
                              seg[1].handleIn)
            ]);
        
        path = make_a_path(0.5, null);
        var seg2 = path.segments;
        path.moveAbove(gr.firstChild);
        path.addSegments([
            new paper.Segment(seg[1].point, v0, seg[2].handleOut),
            new paper.Segment(new paper.Point(0, -seg[0].point.y),
                              seg[0].handleOut, seg[0].handleIn),
            new paper.Segment(seg[5].point, seg[4].handleIn, v0)
            ]);
        
        gr.translate(new paper.Point(0, h * cs / 2));
        gr.rotate( Math.random() * WPId );
        gr.translate(pnt);
        return gr;
    }
    // ----------------------------------------------
    function make_a_path(w,c){
        var path = new paper.Path({
        closed: false,
        strokeWidth: w,
        strokeColor: new paper.GrayColor(0),
        fillColor: c
        });
        return path;
    }
    // ----------------------------------------------
    
    setupOptions();
})();
