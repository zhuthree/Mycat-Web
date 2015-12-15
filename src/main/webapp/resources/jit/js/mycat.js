var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};


function init(){
	
    var st = new $jit.ST({
        //id of viz container element
        injectInto: 'infovis',
        //set duration for the animation
        duration: 10,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
		constrained:false,	//不隐藏节点
        levelDistance: 50,		 
		width: canvas_width,
		height:canvas_height,
		align:"center",
		indent:10,
		levelsToShow:levels,
        //enable panning
        Navigation: {
          enable:true,
          panning:true,
		  zooming:true
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height:100,
            width: 100,
            type: 'rectangle',
            color: '#aaa',
            overridable: true
        },
        
        Edge: {
            type: 'bezier',
            overridable: true
        },
        
        onBeforeCompute: function(node){
            //Log.write("loading " + node.name);
        },
        
        onAfterCompute: function(){
            //Log.write("done");
        },
        
        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
			if (node.id==root_id)
				return;
            label.id = node.id;            
            label.innerHTML = node.name;
            label.onclick = function(){
            	//if(normal.checked) {
            	  st.onClick(node.id);
            	//} else {
				//	st.setRoot(node.id, 'animate');
            	//}
            };
            //设置节点styles
            var style = label.style;
			//alert(node.width);
            style.width = 100 + 'px';
            style.height = 90 + 'px';            
            style.cursor = 'pointer';
            //style.color = '#333';
			style.color = '#000000';//'#c5c4c4';
            style.fontSize = '0.8em';
            style.textAlign= 'center';
            style.paddingTop = '65px';            
			style.verticalAlign='bottom';
            style.lineHeight= 15 + 'px';                              
            style.background="url('./resources/jit/icon/"+node.data.type+".png') no-repeat top";			
			
        },
        
        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
		//渲染节点触发事件
        onBeforePlotNode: function(node){
			if (node.data.status ==status_error_flag) {		//故障节点
				node.data.$color= error_node_color;	
				return;
			}
		
			if (node.id==root_id) node.data.$color= canvas_color;		//将节点背景色设置为画面背景色，即隐藏节点
            //add some color to the nodes in the path between the
            //root node and the selected node.
            else if (node.selected) {
				node.data.$color = selected_node_color;		//选中节点背景色
				
            }else {
                delete node.data.$color;
                //if the node belongs to the last plotted level
                if(!node.anySubnode("exist")) {
                    //count children number
                    var count = 0;
                    node.eachSubnode(function(n) { count++; });
                    //assign a node color based on
                    //how many children it has
					//alert(count);
                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];                    
                }
            }
        },
        
        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
		//连线前触发事件，可以修改线条颜色等
        onBeforePlotLine: function(adj){
			if (adj.nodeFrom.id == root_id) {
				adj.data.$color= canvas_color;				//将连线设置为背景色，即隐藏连线
				adj.data.$lineWidth = 0;
                //delete adj.data.$color;
                //delete adj.data.$lineWidth;
				return false;
			}
			
		
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                //adj.data.$color = "#eed";
                //adj.data.$lineWidth = 3;
				
				adj.data.$color = link_color;
                adj.data.$lineWidth = 5;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }
    });
    //load json data
    st.loadJSON(json);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree  整体渲染
    st.geom.translate(new $jit.Complex(-200, 0), "current");
    //emulate a click on the root node.
    st.onClick(st.root);
	st.canvas.translate(-canvas_width/2,0,false);
	//alert(st.canvas.translateOffsetX);
    //end
    //Add event handlers to switch spacetree orientation.
    //var top = $jit.id('r-top'), 
     //   left = $jit.id('r-left'), 
     //   bottom = $jit.id('r-bottom'), 
     //   right = $jit.id('r-right'),
     //   normal = $jit.id('s-normal');
        
    
    //function changeHandler() {
    //    if(this.checked) {
    //        top.disabled = bottom.disabled = right.disabled = left.disabled = true;
    //        st.switchPosition(this.value, "animate", {
    //            onComplete: function(){
    //                top.disabled = bottom.disabled = right.disabled = left.disabled = false;
    //            }
    //        });
    //    }
   // };
    
    //top.onchange = left.onchange = bottom.onchange = right.onchange = changeHandler;
    //end

}
