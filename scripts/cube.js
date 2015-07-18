// cube
(function() {
    var canvas = document.getElementById("canvas");
    paper.setup(canvas);
    var tool = new paper.Tool();
    
    var PId = 180;   //Math.PI in degree;
    var HPId = 90;   //Math.PI / 2 in degree;
    var WPId = 360;  //Math.PI * 2 in degree;
    var HPI = Math.PI / 2;
    
    var grs;  // group
    
    // ----------------------------------------------
    var values = { 
    cubeSize: 10,
    interval: 10,
    jitter:   10,
    ok : 1,
    }; 
    
    function setupOptions(){
        optionManager.setupOptionsUI(["size", "interval", "jitter"],
                                     [values.cubeSize, values.interval, values.jitter]);
    }
    
    // ----------------------------------------------
    function mm2pt(n){  return n * 2.83464567;  }
    // ----------------------------------------------
    tool.onMouseDown = function(event){
        var opt = optionManager.getOptionsFromUI();
        
        if(opt != null){
            values.cubeSize = opt[0];
            values.interval = opt[1];
            values.jitter = opt[2];
            
            tool.minDistance = values.interval;
            
            grs = new paper.Group();
            
            grs.addChild(drawCube(event.point));
            values.ok = 1;
            
        } else {
            values.ok = 0;
        }
    }
    // ----------------------------------------------
    tool.onMouseDrag = function(event){
        if(values.ok == 0) return;
        
        var jitter_vector = (event.point.subtract(event.lastPoint)).normalize().rotate(HPId);
        
        if(grs){
            grs.addChild(
                drawCube(event.point.add(
                    jitter_vector.multiply((Math.random() - 0.5) * values.jitter))));
        }
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
    function points2segments(points){
        for(var i = 0; i < points.length; i++){
            points[i] = new paper.Segment(points[i]);
        }
        return points;
    }
    // ----------------------------------------------
    function drawCube(pnt){
        var radian_v = (Math.random() * 0.7 + 0.15) * HPI;
        var angle_h = (Math.random() - 0.5) * (HPId * 0.85);
        var radius = values.cubeSize / Math.sqrt(2);
        var v = new paper.Point(1, 0);
        var v2 = v.rotate(angle_h).multiply(radius);
        var sn = Math.sin(radian_v);
        var p_sn = new paper.Point(1, sn);
        
        var face_top = [v2.multiply(p_sn),
                        v2.rotate(HPId).multiply(p_sn),
                        v2.rotate(PId).multiply(p_sn),
                        v2.rotate(-HPId).multiply(p_sn)];
        
        var cs = values.cubeSize * Math.cos(radian_v);
        var p_cs = new paper.Point(0, -cs);
        
        var face_side = [v2.rotate(PId).multiply(p_sn).add(p_cs),
                         v2.rotate(-HPId).multiply(p_sn).add(p_cs),
                         v2.multiply(p_sn).add(p_cs)];
        
        var path = make_a_path(1, new paper.GrayColor(1));
        
        path.closed = true;
        path.strokeJoin = 'round';
        
        var gr = new paper.Group();
        gr.insertChild(0, path);
        path.segments = points2segments(
            [face_top[0],  face_top[1],  face_top[2],
             face_side[0], face_side[1], face_side[2]]);
        
        
        path = make_a_path(0.5, null);
        gr.addChild(path);
        path.segments = points2segments(
            [face_top[0], face_top[3]]);
        
        path = make_a_path(0.5, null);
        gr.addChild(path);
        path.segments = points2segments(
            [face_top[2], face_top[3]]);
        
        path = make_a_path(0.5, null);
        gr.addChild(path);
        path.segments = points2segments(
            [face_side[1], face_top[3]]);
        
        gr.position = gr.position.add(new paper.Point(0, cs / 2));
        gr.rotate( Math.random() * WPId );
        gr.position = gr.position.add(pnt);
        return gr;
    }
    // ----------------------------------------------
    function make_a_path(w, c){
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
