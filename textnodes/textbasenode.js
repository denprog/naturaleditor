/**
 * @constructor
 */
var TextBaseNode = HtmlNode.extend(
	{
		//caret functions
		
		getLineBegin : function(caretState)
		{
			var res = caretState;
			var c = res;
			var r = new Rectangle();
			var n = c.getNode();
			n.getRelativePosBounds(c.getPos(), r);
			var x = r.left;
			
			while (c != null && r.left <= x)
			{
				res = c;
				x = r.left;
				n = c.getNode();
				
				if (n.hasSingleLine())
				{
					//omit the node because of having a single line
					c = n.getFirstPosition();
					res = c;
				}

				c = n.getPreviousPosition(c);
				
				if (!c || res.isEqual(c))
					return res;
				
				n = c.getNode();
				
				//check not going out the paragraph
				if (!this.isChild(n))
					return res;
				n.getRelativePosBounds(c.getPos(), r);
			}
			
			return res;
		},

		getLineEnd : function(caretState)
		{
			var res = caretState;
			var c = res;
			var r = new Rectangle();
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
					res = c;
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
			
			return res;
		}
	}
	);
