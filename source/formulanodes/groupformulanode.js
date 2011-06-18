/**
 * The "g" tag node.
 * @class GroupFormulaNode
 * @constructor
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

			this.baseline = 0;
			
			//get loweset baseline
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				if (n.baseline > this.baseline)
					this.baseline = n.baseline;
			}

			//update the baselines
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				n.move(x, this.baseline - n.baseline);
				x += n.clientRect.width + this.groupNode.kerning;
			}
			
			this.updateClientRect();
		}, 
		
		move : function(x, y)
		{
			this.element.setAttribute("transform", "translate(" + x + " " + y + ")");
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
				var n = this.childNodes.getFirst();
				if (n instanceof CompoundFormulaNode)
					return new CaretState(this, 0);
				var res = n.getFirstPosition();
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

		getNextPosition : function(relativeState, params)
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
					if (!relativeState.checkAtLast(this))
					{
						if (node == this)
						{
							if (this.childNodes.get(relativeState.getPos()) instanceof EmptyFormulaNode)
								return this.parentNode.getNextPosition(relativeState, params);
							
							var i = relativeState.getPos();
							//i == this.childNodes.count() means the position is at the end of the collection
							var n = this.childNodes.get(i == this.childNodes.count() ? i - 1 : i);
							res = n.getNextPosition(relativeState, params);
							if (res)
								return res;
							if (i == this.childNodes.count() - 1 && !(n instanceof EmptyFormulaNode))
								return new CaretState(this, i + 1);
						}
						else
							var i = this.getFirstLevelChildPos(node);
					}
					else
						return this.parentNode.getNextPosition(relativeState, params);
					
					if (i + 1 < this.childNodes.count())
					{
						var n = this.childNodes.get(i + 1);
						res = n.getNextPosition(null, params);
						if (!res && n.canSetCaret)
							res = new CaretState(this, i + 1);
					}
					else if (i == this.childNodes.count() - 1 && !relativeState.isEqual(this.getLastPosition()))
						return new CaretState(this, i + 1);
					
					if (!res && this.parentNode)
						res = this.parentNode.getNextPosition(relativeState, params);
				}
				else
					res = new CaretState(this.parentNode, this.parentNode.getChildPos(this));
			}
			
			return res;
		},
		
		getPreviousPosition : function(relativeState, params)
		{
			var res = null;

			if (!relativeState)
			{
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
						res = n.getPreviousPosition(relativeState, params);
						if (res)
							return res;
					}
					else
						var i = this.getFirstLevelChildPos(node);
					
					for (var pos = i - 1; pos >= 0; --pos)
					{
						var n = this.childNodes.get(pos);
						res = n.getPreviousPosition(null, params);
						if (res)
							break;
					}
					
					if (!res && this.parentNode)
						res = this.parentNode.getPreviousPosition(relativeState, params);
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
		
		toTex : function(braces)
		{
			return braces ? "{" + this.childNodes.toTex(this.childNodes.count() == 1 ? false : true) + "}" : this.childNodes.toTex(this.childNodes.count() == 1 ? false : true);
		}
	}
);
