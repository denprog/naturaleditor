/**
 * @constructor
 */
var CompoundFormulaNode = GroupFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this._super(parentNode, pos, nte);
			
			this.className = "CompoundFormulaNode";
		}, 
		
		addTextNode : function()
		{
			var c = this.createChildNode;
			this.createChildNode = null;

			var res = new TextFormulaNode(this, this.childNodes.count(), this.nte);

			this.createChildNode = c;
			
			return res;
		}, 
		
		addShapeNode : function()
		{
			var c = this.createChildNode;
			this.createChildNode = null;

			var res = new ShapeFormulaNode(this, this.childNodes.count(), this.nte);
			
			this.createChildNode = c;
			
			return res;
		}, 
		
		//caret functions
		
		setCaretToNodeBegin : function()
		{
			this.nextCaretState = this.getFirstPosition();
			return new CaretState(this.parentNode, this.parentNode.getChildPos(this));
		}, 

		getNextPosition : function(relativeState, params)
		{
			var res = null;

			if (!relativeState)
			{
				res = new CaretState(this.parentNode, this.parentNode.getChildPos(this));
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
					if (node == this)
					{
						var i = relativeState.getPos();
						var n = this.childNodes.get(i);
						res = n.getNextPosition(relativeState, params);
						if (res)
							return res;
					}
					else
						var i = this.getFirstLevelChildPos(node);
					
					if (i + 1 < this.childNodes.count())
					{
						var n = this.childNodes.get(i + 1);
						res = n.getNextPosition(null, params);
						if (!res)
							res = new CaretState(this, i + 1);
					}
					
					if (!res && this.parentNode)
						res = this.parentNode.getNextPosition(relativeState, params);
				}
				else if (relativeState.checkAtLast())
				{
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
				if (relativeState.checkInNode(this))
				{
					var node = relativeState.getNode();
					if (!relativeState.checkAtLast())
					{
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
					}
					else
						i = this.childNodes.count();
					
					for (var pos = i - 1; pos >= 0; --pos)
					{
						var n = this.childNodes.get(pos);
						res = n.getPreviousPosition(null, params);
						if (res)
							break;
					}
					
					if (!res)
						res = new CaretState(this.parentNode, this.parentNode.getChildPos(this));
				}
			}
			
			return res;
		},
		
		getUpperPosition : function(relativeState)
		{
			return this.parentNode.getUpperPosition(relativeState);
		},
		
		getLowerPosition : function(relativeState)
		{
			return this.parentNode.getLowerPosition(relativeState);
		},
		
		//command functions
		
		mergeWithNextNode : function(nodeEvent, command)
		{
			return false;
		}
	}
);
