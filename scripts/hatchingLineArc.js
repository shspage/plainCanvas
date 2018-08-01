// hatchingLineArc
// for plainCanvas v.1.1.2 or later
(function() {
    paper.setup("canvas");
    with(paper){
        var tool = new Tool();

        var lastPoint;
        var preLastPoint;
        var gr;
        var opts = {
            lineWidth : 0.5,
            hatchWidth : 16,
            interval : 3,
            angle_multiplier : 4,
            ok : 0
        }
        // --------------------------
        optionManager.setupOptionsUI(["lineWidth","hatchWidth","interval","angle_multiplier"], opts);
        // --------------------------
        tool.onMouseDown = function(event){
            opts.ok = optionManager.getOptionsFromUI(opts);
            if(opts.ok){
                if(opts.hatchWidth == 0){
                    alert("hatchWidth must be not 0");
                    opts.ok = 0;
                } else {
                    opts.hatchWidth /= 2;
                    preLastPoint = null;
                    lastPoint = event.point;
                    gr = new Group();
                }
            }
        }
        // --------------------------
        tool.onMouseDrag = function(event) {
            if(opts.ok == 0) return;
            if(lastPoint.getDistance(event.point) < opts.interval) return;
            
            var path = make_a_path(opts.lineWidth, null);
            gr.addChild(path);
            
            var w = opts.hatchWidth;
            var lp = preLastPoint ? preLastPoint : lastPoint;
            
            var y = (Math.random() -0.5) * w * opts.angle_multiplier;
            path.moveTo(new Point(-w, -y));
            path.arcTo(getArcHeightVector(w, y),
                       new Point(w, y));
            path.rotate(event.point.subtract(lp).getAngle() + 90);
            path.translate(event.point);
            
            preLastPoint = lastPoint;
            lastPoint = event.point;
        }
        // --------------------------
        tool.onMouseUp = function(event){
            if(opts.ok && gr){
                if(gr.children.length < 1){
                    gr.remove();
                } else {
                    undoManager.keep(gr);
                }
            }
        }
        // ----------------------------------------------
        // about variables, refer to ./image/extra_hatchinglinearc_getarcheightvector.png
        function getArcHeightVector(w, y){
            // must (w != 0)
            var d = Math.sqrt(w*w+y*y);
            var sin_t = y / d;
            var t = Math.asin(sin_t);
            var tc = Math.PI / 2 - t;
            var sin_tc = Math.sin(tc);
            var r = d / sin_tc;
            var r1 = Math.abs(r * sin_t);
            
            // adjusts arc height not to be too high
            r1 = Math.max(r * 0.75, r1);
            var v = new Point(Math.cos(tc), sin_tc).normalize(r - r1);
            return v;
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
