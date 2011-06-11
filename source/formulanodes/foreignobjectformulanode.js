/**
 * @constructor
 */
var ForeignObjectFormulaNode = FormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			var el = this.drawLib.createElement("foreignObject", parentNode ? parentNode.element : null);
			this._super("", el, parentNode, pos, nte);
			this.className = "ForeignObjectFormulaNode";
		}, 
		
		updateBoundingRect : function()
		{
//			if (this.nte.isIE)
//				this.boundingRect.setRect(parseInt(this.element.x), parseInt(this.element.y),	this.clientRect.width, this.clientRect.height);
//			else
			this.boundingRect.setRect(this.element.x.baseVal.value, this.element.y.baseVal.value, this.clientRect.width, this.clientRect.height);
		}, 

		addTextNode : function(textNode)
		{
			if (this.childNodes.count() == 1)
			{
				this.childNodes.get(0).addTextNode(textNode);
				if (this.groupNode)
					this.groupNode.remake();
			}
			else
				this._super(textNode);
		}, 

		remake : function()
		{
			this.childNodes.forEach("remake", []);
			this.updateClientRect();
		},

		setLevel : function(level)
		{
			for (var i = 0; i < this.childNodes.count(); ++i)
				this.childNodes.get(i).setLevel(level);
		},
		
		update : function()
		{
			this.childNodes.forEach("update", []);
		},

		//caret functions

		moveCaretToLineBegin : function()
		{
			return this.parentNode.moveCaretToLineBegin();
		},

		moveCaretToLineEnd : function()
		{
			return this.parentNode.moveCaretToLineEnd();
		},

		getNextPosition : function(relativeState, params)
		{
			var res = null;
			
			if (!relativeState)
				res = this.getFirstPosition();
			else
			{
				if (relativeState.checkOnNode(this) || relativeState.checkInNode(this))
					res = this.parentNode.getNextPosition(relativeState, params);
				else
					res = this.getFirstPosition();
			}
			
			return res;
		},
		
		//tool functions

		getNodeBounds : function(posRect)
		{
			var cx = this.boundingRect.left;
			var cy = this.boundingRect.top;
			var p = this;
			
			while (p && p != this.groupNode)
			{
				if (p.boundingRect)
				{
					cx += p.boundingRect.left;
					cy += p.boundingRect.top;
				}
				else
				{
					cx += p.element.offsetLeft;
					cy += p.element.offsetTop;
				}
				p = p.parentNode;
			}
			
			var r = this.nte.editor.getBoundingClientRect();
			var rect = this.element.getBoundingClientRect();
			
			this.groupNode.updateBoundingRect();
			cx += this.groupNode.boundingRect.left;
			cx -= r.left;
			cy += this.groupNode.boundingRect.top;

			posRect.setRect(cx, cy, rect.width, rect.height);
		}
	}
);
