/**
 * The "g" tag node.
 * @class GroupFormulaNode
 */
var GroupFormulaNode = FormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;

			var el = this.drawLib.createElement("g", parentNode ? parentNode.element : null);
			this._super("", el, parentNode, pos, nte);
			
			this.className = "GroupFormulaNode";
		}, 
		
		remake : function()
		{
			var x = 0, y = 0;
			
			this.childNodes.forEach("remake", []);
			
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				n.move(x, this.baseline - n.baseline);
				//n.move(x, this.baseline);
				//n.move(x, y);
				x += n.clientRect.width + this.groupNode.kerning;
			}
			
			this.updateClientRect();
		}, 
		
		move : function(x, y)
		{
			this.element.setAttribute("transform", "translate(" + x + ", " + y + ")");
			this.boundingRect.setRect(x, y, this.clientRect.width, this.clientRect.height);
		}, 

		updateClientRect : function()
		{
			var w = 0, h = 0;
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				if (w < n.boundingRect.right)
					w = n.boundingRect.right;
				if (h < n.boundingRect.bottom)
					h = n.boundingRect.bottom;
//				if (w < n.boundingRect.width)
//					w = n.boundingRect.width;
//				if (h < n.boundingRect.height)
//					h = n.boundingRect.height;
			}
			this.clientRect.setRect(0, 0, w, h);
		},

		update : function()
		{
			this.childNodes.forEach("update", []);
			
			this.baseline = 0;
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				if (this.baseline < n.baseline)
					this.baseline = n.baseline;
			}
		},

		//caret functions

		moveCaretToLineBegin : function()
		{
			var p = this.getFirstPosition();
			if (this.caret.currentState.isEqual(p))
				return this.parentNode.moveCaretToLineBegin();
			
			var n = p.getNode();
			n.scrollIntoView(p.getSelectionStart());
			this.caret.setState(p);
			
			return true;
		},
		
		moveCaretToLineEnd : function()
		{
			var p = this.getLastPosition();
			if (this.caret.currentState.isEqual(p))
				return this.parentNode.moveCaretToLineEnd();
			
			var n = p.getNode();
			n.scrollIntoView(p.getSelectionStart());
			this.caret.setState(p);
			
			return true;
		},
		
		getFirstPosition : function()
		{
			if (this.childNodes.count() > 0)
			{
				var res = this.childNodes.getFirst().getFirstPosition();
				if (res)
					return res;
				return new CaretState(this, 0);
			}
			return null;
		},

		getLastPosition : function()
		{
			if (this.childNodes.count() > 0)
			{
				if (this.childNodes.getLast() instanceof EmptyFormulaNode)
					return new CaretState(this, this.childNodes.count() - 1);
				if (this.childNodes.getLast() instanceof CompoundFormulaNode)
					return new CaretState(this, this.childNodes.count());
				var res = this.childNodes.getLast().getLastPosition();
				if (res)
					return res;
				if (this.childNodes.count() == 1 && (this.childNodes.get(0) instanceof EmptyFormulaNode))
				{
					//return null;
					return new CaretState(this, 0);
				}
				return new CaretState(this, this.childNodes.count());
			}
			return null;
		},

		getNextPosition : function(relativeState)
		{
			var res = null;

			if (!relativeState)
			{
				res = this.getFirstPosition();
			}
			else
			{
				if (relativeState.checkOnNode(this))
				{
					res = this.getFirstPosition();
				}
				else if (relativeState.checkInNode(this))
				{
					var node = relativeState.getNode();
					if (!relativeState.checkAtLast())
					{
						if (node == this)
						{
							if (this.childNodes.get(relativeState.getPos()) instanceof EmptyFormulaNode)
								return this.parentNode.getNextPosition(relativeState);
							
							var i = relativeState.getPos();
							//i == this.childNodes.count() means the position is at the end of the collection
							var n = this.childNodes.get(i == this.childNodes.count() ? i - 1 : i);
							res = n.getNextPosition(relativeState);
							if (res)
								return res;
							if (i == this.childNodes.count() - 1 && !(n instanceof EmptyFormulaNode))
								return new CaretState(this, i + 1);
						}
						else
							var i = this.getFirstLevelChildPos(node);
					}
					else
						return this.parentNode.getNextPosition(relativeState);
					
					if (i + 1 < this.childNodes.count())
					{
						var n = this.childNodes.get(i + 1);
						res = n.getNextPosition(null);
						if (!res)
							res = new CaretState(this, i + 1);
					}
					else if (i == this.childNodes.count() - 1 && !relativeState.isEqual(this.getLastPosition()))
						return new CaretState(this, i + 1);
					
					if (!res && this.parentNode)
						res = this.parentNode.getNextPosition(relativeState);
				}
				else
					res = new CaretState(this.parentNode, this.parentNode.getChildPos(this));
			}
			
			return res;
		},
		
		getPreviousPosition : function(relativeState)
		{
			var res = null;

			if (!relativeState)
			{
				//res = new CaretState(this.parentNode, this.parentNode.getChildPos(this));
				res = this.getLastPosition();
			}
			else
			{
				if (relativeState.checkOnNode(this))
				{
					res = this.getLastPosition();
				}
				else if (relativeState.checkInNode(this))
				{
					var node = relativeState.getNode();
					if (node == this)
					{
						var i = relativeState.getPos();
						//i == this.childNodes.count() means the position is at the end of the collection
						var n = this.childNodes.get(i == this.childNodes.count() ? i - 1 : i);
						res = n.getPreviousPosition(relativeState);
						if (res)
							return res;
					}
					else
						var i = this.getFirstLevelChildPos(node);
					
					for (var pos = i - 1; pos >= 0; --pos)
					{
						var n = this.childNodes.get(pos);
						res = n.getPreviousPosition(null);
						if (res)
							break;
					}
					
					if (!res && this.parentNode)
						res = this.parentNode.getPreviousPosition(relativeState);
				}
				else
					res = new CaretState(this.parentNode, this.parentNode.getChildPos(this));
			}
			
			return res;
		},
		
		mergeWithNextNode : function(nodeEvent, command)
		{
			return false;
		},
		
		//test functions
		
		toTex : function()
		{
			return "{" + this.childNodes.toTex() + "}";
		}
	}
);
