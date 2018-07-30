// cylinder
// for plainCanvas v.1.1.2 or later
(function() {
    paper.setup("canvas");
    with(paper){
        var tool = new Tool();
    
        var v0 = new Point(0, 0);
        var v1 = new Point(1, 0);
        
        var grs;  // groups
    
        // ----------------------------------------------
        var values = { 
        diameter: 10,
        height:   30,
        interval: 20,
        lineWidth: 1.0,
        jitter:   18,
        ok: 0
        };
        optionManager.setupOptionsUI(["diameter", "height", "interval", "lineWidth", "jitter"], values);
        
        // ----------------------------------------------
        tool.onMouseDown = function(event){
            values.ok = optionManager.getOptionsFromUI(values);
            tool.minDistance = values.interval;
            grs = new Group();
            drawCylinder(event.point);
        }
        // ----------------------------------------------
        tool.onMouseDrag = function(event){
            if(values.ok == 0) return;
    
            drawCylinder(event.point.add( v1.rotate(Math.random() * 360, v0 )
                                          .multiply(Math.random() * values.jitter)));
        }
        // ----------------------------------------------
        tool.onMouseUp = function(){
            if(values.ok == 0) return;
    
            if(grs){
                if(grs.children.length < 1){
                    grs.remove();
                } else {
                    undoManager.keep(grs);
                }
                grs = null;
            }
        }
        // ----------------------------------------------
        function drawCylinder(pnt){
            var d = values.diameter;
            var r = values.diameter / 2;  // radius
            var h = values.height;
            var w = values.lineWidth;
            var w2 = w / 2;
            
            var rad_v = (Math.random() * 0.8 + 0.1) * Math.PI / 2;
            var sn = Math.sin(rad_v);
            var cs = Math.cos(rad_v);
    
            var t = Math.random() * 360;
    
            h *= cs / sn;
            
            var gr = new Group();
    
            var path = make_a_path(w, new Color(1));
            path.moveTo(v0);
            path.arcTo( new Point(r, r), new Point(d, 0));
            path.lineTo(new Point(d, -h));
            path.arcTo( new Point(r, -h-r), new Point(0, -h));
            path.closePath();
            gr.addChild(path);
    
            var path1 = make_a_path(w2, new Color(1));
            path1.moveTo(v0);
            path1.arcTo(new Point(r, -r), new Point(d, 0));
            gr.addChild(path1);
            
            gr.translate(-r, h / 2);
            gr.scale(1, sn);
            gr.rotate(t);
            gr.translate(pnt);
            
            if( ! grs) grs = new Group();
            grs.addChild(gr);
        }
        // ----------------------------------------------
        function make_a_path(w, c){
            var path = new Path({
            closed: false,
            strokeWidth: w,
            strokeColor: new Color(0),
            fillColor: c
            });
            return path;
        }
    }  // with(paper){
})();
