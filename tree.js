var Tree = (function() {
	"use strict"; 

	//---------------------------------------------------
	//Converts an object into a tree node
	var treeNode = function(obj,depth) {
		
		//Wraps the object in a node
		function Node(){};
		Node.prototype = obj||Object;
		Node.prototype.addChild = addChild;
		Node.prototype.traverse = traverse;
		var self = new Node();
		self.depth = depth||0;
		self.children = [];
		return self;
		
	};
	
	//Node prototype, adds a child to the node
	var addChild = function(obj) {
			var childNode = treeNode(obj,this.depth+1);
			this.children.push(childNode);
			return childNode;	
	};		
		
	//Node prototype, traverses down the tree, executing a callback for each node.
	var traverse = function(callback) {
		callback(this);
		for(var i=0,l=this.children.length;i<l;i++) {
			this.children[i].traverse(callback);
		}
	};
	
	//---------------------------------------------------
	//Converts a flat array to a tree
	//		flat		=> the flat Array.  Each item is converted to a tree node
	//		getDepth	=> the callback returning the intended depth of the node object
	var arrayToTree = function(flat,getDepth) {

		//Root node of the tree
		var root = treeNode();

		//The depth of the previous and current nodes
		var lastDepth = null;
		var currDepth = null;
		
		//The temporary stack used to cache parents when going up/down levels 
		var nodeStack = [root];
		var nodeIndex = 0;
		var currNode = root;

		for(var i=0,l=flat.length;i<l;i++){
			//Get the depth of the 
			currDepth = getDepth(flat[i]);

			//First item in the list:
			if(lastDepth===null) lastDepth = currDepth;
						
			if(currDepth===lastDepth) {
				//Same depth as previous item, add a sibling
				currNode = nodeStack[nodeIndex].addChild(flat[i]);

			} else if (currDepth>lastDepth) {
				//level deeper than last, add a child
				//go down a level in the tree, and add the parent node to the stack
				nodeStack.push(currNode);
				nodeIndex++;
				currNode = currNode.addChild(flat[i]);

			} else if (currDepth<lastDepth) {
				//level higher than last
				//Pop parents from the stack until you get to the depth of the intended sibling
				while(nodeIndex>0 && (nodeStack[nodeIndex].depth>=currDepth)) {
					//depth of stack item higher than target depth, discard from the stack
					nodeStack.pop();
					nodeIndex--;
				}
				//Parent found: add the child 
				currNode = nodeStack[nodeIndex].addChild(flat[i]);
				
			}

			//Update depth of current node
			lastDepth=currDepth;				

		}
		
		//Return the tree!
		return root;
		
	};	
	
	return {
		arrayToTree:arrayToTree
	}	
	
})();