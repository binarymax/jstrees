/*
	MIT License
	Copyright (c) 2012, Max Irwin
*/


//
// Draws trees to a canvas, using a genetic algorithm
//
var artist = window.artist = (function(){ 

	var E = function(e){return document.getElementById(e);}; //Shortcut for DOM element
	var _worker, _objBatches = []; 		//worker objects
	var _branchObjects = [], _leafObjects = []; 	//tree objects (for SVG)
	var _w,_h,_generations,_size,_angle,_ratio,_trunk,_twigs,_leaves,_canvas,_c; //private vars

	var settings = function(){
		_canvas = E("c");
		_canvas.width = _canvas.clientWidth = _w = window.innerWidth;
		_canvas.height = _canvas.clientHeight = _h = window.innerHeight;		
		_generations = parseInt(E("generations").value); 	//Iterations through growth 
		_size = parseFloat(E("size").value);					//Initial length of the trunk 
		_angle = parseFloat(E("angle").value); 				//Angle seed for branch direction
		_ratio = parseFloat(E("ratio").value); 				//Ratio seed for length evolution
		_trunk = parseFloat(E("trunk").value); 				//Initial Thickness of the trunk 
		_twigs = parseInt(E("twigs").value);   				//Not used yet
		_leaves = parseFloat(E("leaves").value); 				//Initial Size of the leaves
		_c = _canvas.getContext("2d"); 							//Context for use in all rendering
		_c.clearRect(0,0,_w,_h);
	};


	//Draw branch with thickness w
	var drawBranch = function(branch){
		_c.beginPath();
		_c.strokeStyle = branch.color;
		_c.moveTo(branch.x1,branch.y1);
		_c.lineTo(branch.x2,branch.y2);
		_c.lineWidth = branch.width;
		_c.stroke();
		_c.closePath();
	};

	//Draw leaf with radius r
	var drawLeaf = function(leaf){
		_c.beginPath();
		_c.strokeStyle = leaf.stroke;
		_c.fillStyle = leaf.color;
		_c.arc(leaf.x,leaf.y,leaf.r,0,leaf.circ,true);
		_c.lineWidth=0.5;
		_c.stroke();
		_c.fill();
		_c.closePath();
	};

	//Interval to draw objects to canvas, one batch at a time
	var drawInterval = function() {
		if(_objBatches.length) {
			var batch = _objBatches.pop();
			for(var i=0,l=batch.length;i<l;i++) {
				var obj = batch[i];
				switch(obj.type) {
					case 'branch':
						_branchObjects.push(obj);
						drawBranch(obj);
						break;
					case 'leaf':
						_leafObjects.push(obj);
						drawLeaf(obj);
						break;
				}
			}
		}
	};

	//Callback fired when message received from worker
	var workerEvent = function(e) {

		var data = e.data;
		switch(data.action) {

			case 'batch':
				//push the received batch onto the stack
				_objBatches.push(data.batch);
				break;

			case 'status':
				//Start the worker if its not running
				if(data.status!=='running') {
					_branchObjects = [];
					_leafObjects = [];
					_worker.postMessage({action:'draw',width:_w,height:_h,generations:_generations,size:_size,angle:_angle,ratio:_ratio,trunk:_trunk,twigs:_twigs,leaves:_leaves});
				}
				break;
		}
		
	};

	//Gets the settings and starts the worker
	var draw = function() {
		settings();
		
		if(!_worker) {
			//Initialize worker
			_worker = new Worker("/javascripts/artistworker.js");
			_worker.addEventListener('message',workerEvent);
		}		
 
 		//Send a status request to the thread
		_worker.postMessage({action:'status'});
		
	}

	//initialize the UI
	var init = function(){

		//Initialize and get the original settings from the UI
		var set = E("settings");
		var lis = set.getElementsByTagName("input");
		for(var i=0,l=lis.length;i<l;i++) {
			var gauge = new Setting(lis[i], draw);
		}		

		//Start the draw interval
		setInterval(drawInterval,5);

		//start it up!		
		draw();
		
	};

	//Preps the image for user download
	var savePNG = function(){
		var uri = _canvas.toDataURL("image/png").replace("image/png","image/octet-stream");
		document.location.href=uri;
	};

	//Builds the SVG for user download
	var saveSVG = function(){
		var svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+_w+'" height="'+_h+'"><g id="branches">#{branches}</g><g id="leaves">#{leaves}</g></svg>';
		var pth = _branchObjects.map(function(val){ 
			return [ '<path d="M', val.x1, ' ', val.y1, ' L', val.x2, ' ', val.y2, ' Z" stroke="', val.color ,'" stroke-width="', val.width ,'"/>'].join(''); 
		}).join('');
		var arc = _leafObjects.map(function(val){ 
			return [ '<circle cx="',val.x,'" cy="',val.y,'" r="',val.r,'" style="stroke:',val.stroke,'; fill:',val.color,'" />'].join('');
		}).join('');
		var data = window.btoa(svg.replace('#{branches}',pth).replace('#{leaves}',arc));
		var img = '<img title="tree.svg" alt="tree.svg" src="data:image/svg+xml;base64,' + data + '">';
		E("svgimage").innerHTML = img;
		E("svgoverlay").style.display = "block";
	};


	//Toggle about section
	var about = function() {
		var a = E("about");
		var d = a.style.display;
		a.style.display = (d=="none"||d=="")?"block":"none";
	}

	return {
		init:init,
		about:about,
		savePNG:savePNG,
		saveSVG:saveSVG
	} 

 })(); 