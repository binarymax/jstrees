/*
	MIT License
	Copyright (c) 2012, Max Irwin
*/


//
// Makes a volume-style setting gauge
//
var Setting = function(input,callback){
	var self = this;
	var parent = input.parentNode;
	var gauge  = Setting.element(parent,"div","gauge");
	var min = input.getAttribute("data-min");
	var max = input.getAttribute("data-max");
	var val = input.getAttribute("value");
	var flt = min.indexOf('.')>-1 || max.indexOf('.')>-1;
	min = flt?parseFloat(min):parseInt(min);
	max = flt?parseFloat(max):parseInt(max);
	val = flt?parseFloat(val):parseInt(val);
	var inc = flt?(max-min)/Setting.lineCount:Math.round((max-min)/Setting.lineCount);

	this.input = input;
	this.gauge = gauge;
	this.lines = [];
	this.min = min;
	this.max = max;
	this.val = val;

	for(var i=0,v=min;i<=Setting.lineCount;i++) {
		var line = Setting.element(gauge,"div","gaugeline",{'data-value':v});
		line.innerHTML = "&nbsp;&nbsp;";
		line.onclick   = function(e) {
			var val = this.getAttribute("data-value"); 
			val = flt?parseFloat(val):parseInt(val); 
			self.change(val);
			callback();
		}
		this.lines.push({val:v,element:line});
		v = (flt?Math.round((inc*(i+1))*100)/100:inc*(i+1)) + min;
	}
	this.change(val);
}

Setting.lineCount = 15;

//DOM element helper
Setting.element = function(parent,type,cls,attrs) {
	var element = document.createElement(type);
	element.setAttribute("class",cls);
	for(i in attrs) {
		if(attrs.hasOwnProperty(i)) {
			element.setAttribute(i,attrs[i]);
		}
	}
	parent.appendChild(element);
	return element;
}


//Set input value and highlight gauge 
Setting.prototype.change = function(val) {
	this.val = val;
	this.input.value = val;
	for(var i=0;i<=Setting.lineCount;i++) {
		var line = this.lines[i];
		var cls  = val<line.val?"gaugeline":"gaugeline on";
		line.element.setAttribute("class",cls);
	}
}