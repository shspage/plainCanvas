// juzu
// for plainCanvas v.1.1.2 or later
(function() {
    paper.setup("canvas");
    with(paper){
        var tool = new Tool();

        var minRadius, maxRadius, margin, grayRange, separation;
        var lastPnt, prevRadius, nextRadius, interval, gr;
        // --------------------------
        function setupOptions(){
            minRadius  = 6;
            maxRadius  = 12;
            separation = 0;
      
            grayRange = 8; // (0-10) : 0 = 50% only
            
            margin = minRadius / 2;
            maxRadius -= minRadius;
    
            optionManager.setupOptionsUI(["min radius", "max radius", "separation (px)", "gray range (0-10)"],
                                         [minRadius, maxRadius + minRadius, separation, grayRange]);
        }
        setupOptions();
        
        // --------------------------
        function getOptions(){
            var opt = optionManager.getOptionsFromUI();
            
            if(opt != null){
                minRadius = opt[0];
                maxRadius = opt[1] - opt[0];
                margin = minRadius / 2;
                separation = opt[2];
                grayRange = Math.min(10, Math.max(0, opt[3])) / 10;
            }
        }
        // --------------------------
        tool.onMouseDown = function(event){
            getOptions();
            gr = new Group();
            lastPnt = event.point;
            drawCircle(getRadius());
        }
        // --------------------------
        tool.onMouseDrag = function(event) {
            if(lastPnt.getDistance(event.point) < interval) return;
            var v = event.point.subtract(lastPnt).normalize();
            lastPnt = lastPnt.add(v.multiply(interval + margin));
            drawCircle(nextRadius);
        }
        // --------------------------
        tool.onMouseUp = function(event){
            if(gr){
                if(gr.children.length < 1){
                    gr.remove();
                }  else {
                    if(undoManager) undoManager.keep(gr);
                }
                gr = null;
            }
            lastPnt = null;
        }
        // --------------------------
        function drawCircle(r){
            var c = new Path.Circle(lastPnt, r);
            c.strokeColor = null;
            var color_value = Math.min(1, Math.max(0, (Math.random() - 0.5) * grayRange + 0.5));
            
            c.fillColor = new Color(color_value);
            
            //c.fillColor = new Color(0);  // use opacity
            //c.opacity = color_value;
    
            gr.addChild( c );
            
            prevRadius = r;
            nextRadius = getRadius();
            var sep = separation;
            interval = nextRadius + prevRadius - margin + sep;
            if(interval <= 0) interval = 1;
        }
        // ---------------------------
        function getRadius(){
            return Math.random() * maxRadius + minRadius;
        }
    }  // with(paper){
})();
