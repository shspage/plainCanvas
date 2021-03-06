// hatchingLine
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
            hatchWidth : 12,
            interval : 2,
            angle_multiplier : 4,
            ok : 0
        }
        // --------------------------
        optionManager.setupOptionsUI(["lineWidth","hatchWidth","interval","angle_multiplier"], opts);
        // --------------------------
        tool.onMouseDown = function(event){
            opts.ok = optionManager.getOptionsFromUI(opts);
            if(opts.ok){
                opts.hatchWidth /= 2;
                preLastPoint = null;
                lastPoint = event.point;
                gr = new Group();
            }
        }
        // --------------------------
        tool.onMouseDrag = function(event) {
            if(opts.ok == 0) return;
            if(lastPoint.getDistance(event.point) < opts.interval) return;

            var lp = preLastPoint ? preLastPoint : lastPoint;
            var path = make_a_path(opts.lineWidth, null);
            gr.addChild(path);
            var w = opts.hatchWidth;
            var y = (Math.random() -0.5) * w * opts.angle_multiplier;
            path.moveTo(new Point(w, y));
            path.lineTo(new Point(-w, -y));
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
