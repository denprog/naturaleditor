var HeaderNode = HtmlNode.extend(
	{
	}
);

var Header1Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h1", null, parentNode, pos, nte);
		}
	}
);

var Header2Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h2", null, parentNode, pos, nte);
		},
		
		getLineEnd : function(caretState)
		{
			var res = caretState;
			var c = res;
			var r = new Rect();
			var n = c.getNode();
			n.getRelativePosBounds(c.getPos(), r);
			var x = r.left;
			
			while (c != null && r.left >= x)
			{
				res = c;
				x = r.left;
				n = c.getNode();
				
				if (n.hasSingleLine())
				{
					//omit the node because of having a single line
					c = n.getLastPosition();
				}
				
				c = n.getNextPosition(c);
				
				if (!c || res.isEqual(c))
					return res;
				
				n = c.getNode();
				
				//check not going out the paragraph
				if (!this.isChild(n))
					return res;
				
				n.getRelativePosBounds(c.getPos(), r);
			}
		}
	}
);

var Header3Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h3", null, parentNode, pos, nte);
		}
	}
);
