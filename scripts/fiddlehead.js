// fiddlehead (zenmai)
(function(){
    var canvas = document.getElementById("canvas");
    paper.setup(canvas);
    var tool = new paper.Tool();
    
    var hlen = 4 * (Math.sqrt(2) - 1) / 3;
    var hpi = 90;
    var qpi = hpi / 2;
    var po  = new paper.Point(0,0);
    
    var line, lastPnt, gr;
    var angleRange, stemLen, spiralRadius, lineWidth;
    var interval, growDir, lineCol;
    var g_myDialog;

    function setupOptions(){
        angleRange = 45;
        stemLen = 100;
        spiralRadius = 10;
        lineWidth = 0.5;
        
        // init
        interval = spiralRadius / 2;
        growDir = 1; // 1:normal, 2:drawing direction
        lineCol = "black"; //new paper.GrayColor(1); //or selectedLineCol_or_Black();
        
        stemLen /= 2;
        spiralRadius /= 2;

        optionManager.setupOptionsUI(["stem length", "spiral radius", "interval", "angle range", "direction(1,2)"],
                                   [stemLen*2, spiralRadius*2, interval, angleRange, growDir]);
    }
    // ---------------------
    function getOptions(){
      var opt = optionManager.getOptionsFromUI();
      if(opt != null){
        for(var i=0; i<opt.length; i++){
          if(isNaN(opt[i]) || opt[i]<=0){
            alert("please input a positive number");
            return false;
          }
        }
        stemLen = opt[0]/2;
        spiralRadius = opt[1]/2;
        interval = opt[2];
        angleRange = opt[3];
        if(opt[4]==1 || opt[4]==2) growDir = opt[4];
        lineCol = "black"; //new paper.GrayColor(0);
        return true;
      }
      return false;
    }
    // ----------------------------------------------
    tool.onMouseDown = function(event){
      // get values from dialog
        var chk = getOptions();
        if(!chk){ return; }
        
        tool.minDistance = interval;
        lastPnt = event.point;
        if(growDir != 0) return;
        makeline();
        zenmai(new paper.Point(0,1), event);
    }
    // --------------------------
    tool.onMouseDrag = function(event) {
      lastPnt = event.lastPoint;
      var v = new paper.Point(1,0);
      if(growDir > 0){
        v = (event.delta).normalize();
        if(growDir > 1) v = v.rotate(hpi);
      }
      makeline();
     
      zenmai(v.rotate(hpi), event);
    }
    // --------------------------
    tool.onMouseUp = function(event){
      if(gr && gr.children.length<2){
        if(gr.children.length == 1) gr.firstChild.moveAbove(gr);
        gr.remove();
      } else {
        if(undoManager) undoManager.keep(gr);
      }
      gr = null;
      lastPnt = null;
      line = null;
    }
    // --------------------------
    function makeline(){
      line = new paper.Path({
    	fillColor: null,
    	strokeColor: lineCol,
    	strokeWidth: lineWidth
      });
      if(!gr) gr = new paper.Group();
      gr.addChild(line);
    }
    // --------------------------
    function zenmai(v, event){
      var m = Math.random() + 1;
      var len = stemLen * m;
      var hlen = len/3;
      // 1st point
      line.segments = [new paper.Segment(lastPnt,
                                   po,
                                   v.multiply(hlen))];
      // 2nd point
      v = v.rotate(angleRange * (Math.random()-0.5));
      var p = lastPnt.add( v.multiply(len));
      line.add(new paper.Segment(p,
                           v.rotate(angleRange * (Math.random()-0.5)) * (-hlen),
                           po));
      
      addSpiral(line.segments, spiralRadius * m, 0.85, 12, (Math.random() < 0.5));
    }
    // --------------------------
    function addSpiral(segs,
                       r,  // first radius
                       m,  // rate
                       n,  // number of segments
                       rl){ // turn right  (t/f)
      var qp = rl ? -qpi : qpi;
        
      var len = segs.length - 1;
      if(len < 1) return;
      var p = segs[len].point;
      // define v
      var v;
        if(segs[len].handleIn.equals(po)){
            with(segs[len - 1]){
                if(p.equals(point)) return;
                if(p.equals(point.add(handleOut))){
                    v = (p.subtract(point)).normalize();
                } else {
                    v = (p.subtract(point.add(handleOut))).normalize();
                }
            }
      } else {
        v = (segs[len].handleIn.multiply(-1)).normalize();
      }
      // make spiral
      var seg;
      var h = r * hlen;
      segs[len].handleOut = v.multiply(h);
      for(var i=0; i<n; i++){
        v = v.rotate(qp);
        p = p.add(v.multiply(Math.sqrt(2) * r));
        seg = new paper.Segment(p);
        r *= m;
        v = v.rotate(qp);
        seg.handleIn = v.multiply(-h);
        h = r * hlen;
        seg.handleOut = v.multiply(h);
        segs.push( seg );
      }
    }
    // --------------------------

    // main
    setupOptions();
})();
