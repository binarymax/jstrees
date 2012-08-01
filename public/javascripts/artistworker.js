/*
	MIT License
	Copyright (c) 2012, Max Irwin
*/

//
// Includes
//
importScripts('tree.js');

//
// Draws trees branch by branch as a web worker, using a genetic algorithm
//
var artistWorker = (function(){ 

	var _isRunning = false;
	var _maxCount = 255;
	var _objQueue = []; _objCount = 0;
	var _w,_h,_generations,_size,_angle,_ratio,_trunk,_twigs,_leaves; 
	
	//(Re)initializes environment
	var init = function(height,width,generations,size,angle,ratio,trunk,twigs,leaves){
		_w = width;
		_h = height;		
		_generations = generations; 	//Iterations through growth 
		_size = size;						//Initial length of the trunk 
		_angle = angle; 					//Angle seed for branch direction
		_ratio = ratio; 					//Ratio seed for length evolution
		_trunk = trunk; 					//Initial Thickness of the trunk 
		_twigs = twigs;   				//Starting branch depth that has leaves
		_leaves = leaves;					//Initial Size of the leaves
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
	var queueBranch = function(x1,y1,x2,y2,w,c){
		_objQueue[_objCount++] = {type:'branch',x1:x1,y1:y1,x2:x2,y2:y2,width:w,color:"#111111"};
	};

	//Draw leaf with radius r
	var queueLeaf = function(x1,y1,r){
		_objQueue[_objCount++]={type:'leaf',x:x1,y:y1,r:r,circ:2*Math.PI,color:colorRange(50,200,50),stroke:"#333333"};
	};

	//Sends a batch of objects back to the window, resets for next batch
	var sendObjects = function() {
		self.postMessage({action:'batch',batch:_objQueue});
		_objQueue = [];
		_objCount = 0;
	};

	//Grow the tree by one branch
	var grow = function(branch) {
		if(!branch.grown) {
			var d1,d2,lp,wp,rp,bp,cp,cc;
			var angle = (Math.random()*_angle) + (_angle/2);  //fans out the branches
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

			//Queue the branch
			queueBranch(branch.x,branch.y,cp.x,cp.y,wp,cc);
			
			//Queue the leaf		
			if(branch.depth>=(15-_twigs)) queueLeaf(cp.x+parseInt(range(1,5)),cp.y+parseInt(range(1,5)),rp);
			
			if(_objCount>_maxCount) sendObjects();

			//Add 2 child branches to current branch
			branch.addChild({x:cp.x,y:cp.y,d:d1,l:lp,w:wp,r:rp});
			branch.addChild({x:cp.x,y:cp.y,d:d2,l:lp,w:wp,r:rp});
			
			//flag that this branch has grown, so it doesn't grow more!
			branch.grown=1;
		}
	}; 

	//Generates and draws a unique tree
	var draw = function(){ 	
	
		//Start in the bottom center, with an upward pointing trunk
		var x = _w>>1, y = _h, d = 90; 

		_isRunning = true;

		//Make the root node
		var tree = Tree.makeNode({x:x, y:y, d:d, l:_size, w:_trunk, r:_leaves});
		
		//Grow the tree!
		for(var i=0;i<_generations;i++) { 
			tree.traverse(grow);
		}

		sendObjects();
		
		_isRunning = false;

		return false;
	};
	
	var status = function() {
		return _isRunning?'running':'idle';
	}	
	
	return {
		init:init,
		draw:draw,
		status:status
	}

 })();

 
//
// Worker message event:
//
self.addEventListener('message',function(e) {
 	
 	var d = e.data;

 	switch(d.action) {

		case 'draw':
			//set params and start drawing!
			artistWorker.init(d.height,d.width,d.generations,d.size,d.angle,d.ratio,d.trunk,d.twigs,d.leaves);
			if(artistWorker.status()!=='running') artistWorker.draw();
			break;
	
		case 'status':
			self.postMessage({action:'status',status:artistWorker.status()});
			break;

		case 'stop':
			self.close();
			break;

 	}

 });