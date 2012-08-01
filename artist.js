/*
	MIT License
	Copyright (c) 2012, Max Irwin
*/


//
// Draws trees to a canvas, using a genetic algorithm
//
var artist = window.artist = (function(){ 

	var E = function(e){return document.getElementById(e);};
	var _w,_h,_generations,_size,_angle,_ratio,_trunk,_twigs,_leaves,_canvas,_c; 
	
	//(Re)initializes environment, gets values from UI
	var settings = function(){
		_canvas = E("c");
		_canvas.width = _canvas.clientWidth = _w = window.innerWidth;
		_canvas.height = _canvas.clientHeight = _h = window.innerHeight;		
		_generations = parseInt(E("generations").value); 	//Iterations through growth 
		_size = parseFloat(E("size").value);					//Initial length of the trunk 
		_angle = parseFloat(E("angle").value); 				//Angle seed for branch direction
		_ratio = parseFloat(E("ratio").value); 				//Ratio seed for length evolution
		_trunk = parseFloat(E("trunk").value); 				//Initial Thickness of the trunk 
		_twigs = parseInt(E("twigs").value);   				//Starting branch depth that has leaves
		_leaves = parseFloat(E("leaves").value); 				//Initial Size of the leaves
		_c = _canvas.getContext("2d"); 							//Context for use in all rendering
		_c.clearRect(0,0,_w,_h);
	};
		
	//Converts cartesian coordinates to polar
	var polar = function(x,y){ 
	 	var r = Math.pow((Math.pow(x,2) + Math.pow(y,2)),0.5);
	 	var theta = Math.atan(y/x)*360/2/Math.PI; 
	 	if (x >= 0 && y >= 0) {
	 		theta = theta;
	 	} else if (x < 0 && y >= 0) {
	 		theta = 180 + theta;
	 	} else if (x < 0 && y < 0) {
	 		theta = 180 + theta;
	 	} else if (x > 0 && y < 0) {
	 		theta = 360 + theta;
	 	} 
		return {d:theta,l:r}; 
	};
	
	//Converts polar coordinates to cartesian
	var cartesian = function(d,l,x,y){
		//Get base cartesian around 0,0 axis
	 	var x1 = Math.floor(l * Math.cos(d * 2 * Math.PI / 360));
	 	var y1 = Math.floor(l * Math.sin(d * 2 * Math.PI / 360));
		y1*=(d>180)?1:-1;
		x1*=(d>90||d<270)?1:-1;
	 	//Map to x,y arguments:
		y1+=y||0;
		x1+=x||0;
		return {x:x1,y:y1};
	};
	
	//Gets a random number between a and b
	var range = function(a,b) {
		return parseInt((Math.random() * (b-a)) + a);
	};

	
	//Gets a variation on a base rgb color
	var colorRange = function(r,g,b,z) {
		z = z||20;
		r = parseInt(Math.abs(range(r-z,r+z)));
		g = parseInt(Math.abs(range(g-z,g+z)));
		b = parseInt(Math.abs(range(b-z,b+z)));
		return "#" + r.toString(16) + g.toString(16) + b.toString(16);
	};

	//Gets a variation on a base rgb color
	var greyRange = function(g,z) {
		z = z||20;
		g = parseInt(Math.abs(range(g-z,g+z))).toString(16);
		g = (g.length>1?'':'0') + g;
		g = "#" + g + g + g;
		return g;
	};

	//Draw branch with thickness w
	var drawBranch = function(x1,y1,x2,y2,w,c){
		_c.beginPath();
		//_c.strokeStyle = "#111111";
		_c.strokeStyle = c;
		_c.moveTo(x1,y1);
		_c.lineTo(x2,y2);
		_c.lineWidth = w;
		_c.stroke();
		_c.closePath();
	};

	//Draw leaf with radius r
	var drawLeaf = function(x1,y1,r){
		_c.beginPath();
		_c.strokeStyle = "#333333";
		_c.fillStyle = colorRange(50,200,50);
		_c.arc(x1,y1,r,0,2*Math.PI,true);
		_c.lineWidth=0.5;
		_c.stroke();
		_c.fill();
		_c.closePath();
	};

	//Grow the tree by one branch
	var grow = function(branch) {
		if(!branch.grown) {
			var d1,d2,lp,wp,rp,bp,cp,cc;
			var angle = (Math.random()*_angle) + (_angle/2);
			var ratio = _ratio + Math.random()/8;
			//evolve from parent:
			lp = branch.l*ratio;
			wp = branch.w*_ratio;
			rp = branch.r*_leaves;
			bp = branch.Branch+1;
			d1 = branch.d-angle;
			d2 = branch.d+angle;
			d1 = (d1<0)?d1+360:d1;
			d2 = (d2>=360)?d2-360:d2;
						
			cp = cartesian(branch.d,lp,branch.x,branch.y);

			//branch.c = branch.c || greyRange(40,20);
			//cc = colorRange(51,33,16,10);
			cc = "#191919"

			drawBranch(branch.x,branch.y,cp.x,cp.y,wp,cc);
			if(branch.depth>=(15-_twigs))drawLeaf(cp.x+parseInt(range(1,5)),cp.y+parseInt(range(1,5)),rp);

			branch.addChild({x:cp.x,y:cp.y,d:d1,l:lp,w:wp,r:rp});
			branch.addChild({x:cp.x,y:cp.y,d:d2,l:lp,w:wp,r:rp});
			branch.grown=1;
		}
	}; 

	//Generates and draws a unique tree
	var draw = function(){ 
		settings();
		var x = _w>>1, y = _h, d = 90; //Start in the bottom center, with an upward pointing trunk
		var tree = Tree.makeNode({x:x, y:y, d:d, l:_size, w:_trunk, r:_leaves});
		for(var i=0;i<_generations;i++) 
			tree.traverse(grow);
		return false;
	};
	
	//Preps the image for user download
	var save = function(){
		var uri = _canvas.toDataURL("image/png").replace("image/png","image/octet-stream");
		document.location.href=uri;
	};

	//initialize the UI
	var init = function(){
		var set = E("settings");
		var lis = set.getElementsByTagName("input");
		for(var i=0,l=lis.length;i<l;i++) {
			var gauge = new Setting(lis[i], draw);
		}
		draw();
	};

	//Toggle about section
	var about = function() {
		var a = E("about");
		var d = a.style.display;
		a.style.display = (d=="none"||d=="")?"block":"none";
	}

	return {
		init:init,
		draw:draw,
		save:save,
		about:about
	} 

 })(); 