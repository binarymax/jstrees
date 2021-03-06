#jsTrees

Javascript Tree-themed algorithms

##Tree Generator Example

Tree generator uses the tree API and accompanying settings.js to let the user generate simple trees on an html canvas.
A live example is here: http://www.binarymax.com/tree.html

##tree.js API

### makeNode : Creates a root node.

All nodes (including root) have the following prototype functions:	
 * addChild(obj) : Converts an object into a node, and appends it as a child.
 * traverse(callback) : Traverses the tree, leaf nodes first down to root, and executes a callback for each.
 * traverse2(callback) : Traverses the tree, root first up to leaf nodes, and executes a callback for each.

### arrayToTree : Converts a flat array to a tree data structure

###Sample input:
```
	var ary = [
		{"Level":1,"Name":"a"},
		{"Level":2,"Name":"b"},
		{"Level":2,"Name":"c"},
		{"Level":3,"Name":"d"},
		{"Level":3,"Name":"e"},
		{"Level":4,"Name":"f"},
		{"Level":2,"Name":"g"},
		{"Level":1,"Name":"h"},
		{"Level":2,"Name":"i"},
		{"Level":3,"Name":"j"},
		{"Level":4,"Name":"k"},
		{"Level":3,"Name":"l"},
		{"Level":1,"Name":"m"},
		{"Level":2,"Name":"n"}
	];
	
	var tree = Tree.arrayToTree(ary,function(obj){ return parseInt(obj.Level)||0; });
	var str = "";
	tree.traverse(function(obj){
		str+="\n";
		for(var i=0;i<obj.depth;i++) {
			str+="    |";
		}
		str+=obj.Name;
	});
	console.log(str);
```

###Sample output:
```
    |a
    |    |b
    |    |c
    |    |    |d
    |    |    |e
    |    |    |    |f
    |    |g
    |h
    |    |i
    |    |    |j
    |    |    |    |k
    |    |    |l
    |m
    |    |n
```