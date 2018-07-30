// cube
// for plainCanvas v.1.1.2 or later
(function() {
    paper.setup("canvas");
    with(paper){
        var tool = new Tool();
        
        var v0 = new Point(0, 0);
        var v1 = new Point(1, 0);
        
        var grs;  // group
        
        // ----------------------------------------------
        var values = { 
        cubeSize: 10,
        interval: 10,
        jitter:   10,
        ok : 1,
        };
        
        optionManager.setupOptionsUI(["cubeSize", "interval", "jitter"], values);
        
        // ----------------------------------------------
        tool.onMouseDown = function(event){
            values.ok = optionManager.getOptionsFromUI(values);
            
            if(values.ok){
                tool.minDistance = values.interval;
                grs = new Group();
                drawCube(event.point);
            }
        }
        // ----------------------------------------------
        tool.onMouseDrag = function(event){
            if(values.ok){
                drawCube(event.point.add( v1.rotate(Math.random() * 360, v0 )
                                          .multiply(Math.random() * values.jitter)));
            }
        }
        // ----------------------------------------------
        tool.onMouseUp = function(){
            if(values.ok){
                if(grs){
                    if(grs.children.length < 1){
                        grs.remove();
                    } else {
                        undoManager.keep(grs);
                    }
                    grs = null;
                }
            }
        }
        // ----------------------------------------------
        function points2segments(points){
            for(var i = 0; i < points.length; i++){
                points[i] = new Segment(points[i]);
            }
            return points;
        }
        // ----------------------------------------------
        function drawCube(pnt){
            var radian_v = (Math.random() * 0.7 + 0.15) * Math.PI / 2;
            var angle_h = (Math.random() - 0.5) * (90 * 0.85);
            var radius = values.cubeSize / Math.sqrt(2);
            var v = new Point(1, 0);
            var v2 = v.rotate(angle_h).multiply(radius);
            var sn = Math.sin(radian_v);
            var p_sn = new Point(1, sn);
            
            var face_top = [v2.multiply(p_sn),
                            v2.rotate(90).multiply(p_sn),
                            v2.rotate(180).multiply(p_sn),
                            v2.rotate(-90).multiply(p_sn)];
            
            var cs = values.cubeSize * Math.cos(radian_v);
            var p_cs = new Point(0, -cs);
            
            var face_side = [v2.rotate(180).multiply(p_sn).add(p_cs),
                             v2.rotate(-90).multiply(p_sn).add(p_cs),
                             v2.multiply(p_sn).add(p_cs)];
            
            var path = make_a_path(1, new Color(1));
            
            path.closed = true;
            path.strokeJoin = 'round';
            
            var gr = new Group();
            gr.insertChild(0, path);
            path.segments = points2segments(
                [face_top[0],  face_top[1],  face_top[2],
                 face_side[0], face_side[1], face_side[2]]);
            
            
            path = make_a_path(0.5, null);
            gr.addChild(path);
            path.segments = points2segments([face_top[0], face_top[3]]);
            
            path = make_a_path(0.5, null);
            gr.addChild(path);
            path.segments = points2segments([face_top[2], face_top[3]]);
            
            path = make_a_path(0.5, null);
            gr.addChild(path);
            path.segments = points2segments([face_side[1], face_top[3]]);
            
            gr.position = gr.position.add(new Point(0, cs / 2));
            gr.rotate( Math.random() * 360 );
            gr.position = gr.position.add(pnt);
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
