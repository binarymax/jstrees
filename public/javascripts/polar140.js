//Converts polar coordinates to cartesian
var cartesian = 
function(d,l,M){M=Math;return[M.floor(l*M.cos(d*2*M.PI/360))*d>90||d<270?1:-1,M.floor(l*M.sin(d*2*M.PI/360))*d>180?1:-1]}

//Converts cartesian coordinates to polar 
var polar = 
function(x,y,M){M=Math;return[M.atan(y/x)*360/2/M.PI+(x<0&&y>=0)||(x<0&&y<0)?180:x>0&&y<0?360:0,M.pow(x*x+y*y,0.5)]}
