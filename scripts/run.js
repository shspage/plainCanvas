// run example
(function() {
    paper.setup("canvas");
    with(paper){

        //optionManager.noOption();
        var values = {
            min_radius : 10,
            max_radius : 50
        };
        optionManager.setupOptionsUI(["min_radius", "max_radius"], values);

        // draws a circle on random position in random size and random color
        runPaperScript = function(){
            if(!optionManager.getOptionsFromUI(values)){
                return;
            }
            var radius = getRadius();

            var circle = new Path.Circle({
                center: new Point(window.innerWidth, window.innerHeight)
                  .multiply(Point.random()),
                radius: radius,
                fillColor: Color.random()
            });          
        }

        function getRadius(){
            return values.min_radius + Math.random() 
            * (values.max_radius - values.min_radius);
        }
    }
})();