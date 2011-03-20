function NodesCollection(id)
{
	this.id = id;
  this.nodes = new Array();
  
  this.add = function(node)
  {
		this.nodes.push(node);
  };

	this.insert = function(pos, node)
	{
		this.nodes.splice(pos, 0, node);
	};
	
  this.remove = function(nodeId)
  {
		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i];
			if (node.id == nodeId)
			{
				node.destroy();
				this.nodes.splice(i, 1);
				return true;
			}
		}
		
		return false;
  };
  
  this.removeAt = function(pos)
  {
		this.nodes.splice(pos, 1);
  };

	this.replace = function(pos, node)
	{
		this.removeAt(pos);
		this.insert(pos, node);
	};

	this.copyFrom = function(source, parent)
	{
		this.reset();
		
		for (var i = 0; i < source.count(); ++i)
		{
			source.get(i).dublicate(parent);
			//var node = source.get(i).dublicate(parent);
			//this.nodes.push(node);
		}
	};

	this.reset = function()
	{
		for (var i = 0; i < this.nodes.length;)
		{
			var node = this.nodes[0];
			node.destroy();
			node.childNodes.reset();
			this.nodes.splice(0, 1);
		}
		
		this.nodes.length = 0;
	};
		  
  this.count = function()
  {
		return this.nodes.length;
  };
  
  this.get = function(pos)
  {
		return this.nodes[pos];
  };

  this.getFirst = function()
  {
		return this.nodes[0];
  }; 
  
  this.getLast = function()
  {
		return this.nodes[this.nodes.length - 1];
  };

	this.getPos = function(node)
	{
		for (var i = 0; i < this.nodes.length; ++i)
		{
			if (this.nodes[i] == node)
				return i;
		}
		
		return -1;
	};

  this.height = function()
  {
		if (this.nodes.length == 0)
			return 0;
		
		var node = this.nodes[0];
		
		var topPos = node.nodeRect.y;
		var bottomPos = node.nodeRect.bottom();

		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i];
			if (node.nodeRect.top() < topPos)
				topPos = node.nodeRect.top();
			if (node.nodeRect.bottom() > bottomPos)
				bottomPos = node.nodeRect.bottom();
		}
		
		return bottomPos - topPos;
  };
  
  //returns the rect of the nodes
  this.getRect = function(start, end)
  {
		if (this.nodes.length == 0)
			return new Rect(0, 0, 0, 0);
		
		var node = this.nodes[0];
		
		var leftPos = node.nodeRect.x;
		var topPos = node.nodeRect.y;
		var rightPos = node.nodeRect.right();
		var bottomPos = node.nodeRect.bottom();

		for (var i = start; i < end; ++i)
		{
			var node = this.nodes[i];
			if (node.nodeRect.left < leftPos)
				leftPos = node.nodeRect.left;
			if (node.nodeRect.top() < topPos)
				topPos = node.nodeRect.top();
			if (node.nodeRect.right() > rightPos)
				rightPos = node.nodeRect.right();
			if (node.nodeRect.bottom() > bottomPos)
				bottomPos = node.nodeRect.bottom();
		}
		
		return new Rect(leftPos, topPos, rightPos - leftPos, bottomPos - topPos);
  };
  
  //returns the base line of the collection
  this.getBaseLine = function()
  {
		var baseLine = 0;
		
		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i];
			if (node.baseLine > baseLine)
				baseLine = node.baseLine;
		}
		
		return baseLine;
  };
  
  this.recalcOffsets = function()
  {
		var baseLine = this.getBaseLine();
		
		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i];
			if (node.baseLine < baseLine)
				node.offset = baseLine - node.baseLine;
			else
				node.offset = 0;
		}
  };
  
  this.getNodeById = function(id)
  {
		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i].getNodeById(id);
			if (node)
				return node;
		}
		
		return null;
  };

  this.getNodeByLastId = function(lastId)
  {
		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i].getNodeByLastId(lastId);
			if (node)
				return node;
		}
		
		return null;
  };
  
	this.forEach = function(func, args)
	{
		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i];
			node[func].apply(node, [args]);
		}
	};
	
	this.dublicate = function(parent)
	{
		var c = new NodesCollection(this.id);
		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i].dublicate(parent);
			c.add(node);
		}
		
		return c;
	};
	
	this.getSymbolsCount = function()
	{
		for (var i = 0; i < this.nodes.length; ++i)
		{
			var node = this.nodes[i];
		}
	};
	
	this.toTex = function()
	{
		var res = "";
		
		for (var i = 0; i < this.nodes.length; ++i)
			res += this.nodes[i].toTex();
		
		return res;
	};
}
