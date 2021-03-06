/**
 * Graphical element of formula node.
 * @class ShapeFormulaNode
 * @constructor
 */
var ShapeFormulaNode = GroupFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super(parentNode, pos, nte);
			
			this.className = "ShapeFormulaNode";
		}, 

		updateClientRect : function()
		{
			var w = 0, h = 0;

			for (var i = 0; i < this.element.childNodes.length; ++i)
			{
				var el = this.element.childNodes[i];
				if (el.width)
				{
					if (w < el.width.baseVal.value)
						w = el.width.baseVal.value;
					if (h < el.height.baseVal.value)
						h = el.height.baseVal.value;
				}
				else if (el.x1)
				{
					if (w < el.x2.baseVal.value - el.x1.baseVal.value)
						w = el.x2.baseVal.value - el.x1.baseVal.value;
					if (h < el.y2.baseVal.value - el.y1.baseVal.value)
						h = el.y2.baseVal.value - el.y1.baseVal.value;
				}
			}
			
			this.clientRect.setRect(0, 0, w, h);

			w = 0;
			h = 0;

			for (var i = 0; i < this.element.childNodes.length; ++i)
			{
				var el = this.element.childNodes[i];
				if (el.width)
				{
					if (w < el.width.baseVal.value)
						w = el.width.baseVal.value;
					if (h < el.height.baseVal.value)
						h = el.height.baseVal.value;
				}
				else if (el.x1)
				{
					if (w < el.x2.baseVal.value - el.x1.baseVal.value)
						w = el.x2.baseVal.value - el.x1.baseVal.value;
					if (h < el.y2.baseVal.value - el.y1.baseVal.value)
						h = el.y2.baseVal.value - el.y1.baseVal.value;
				}
			}
			
			this.boundingRect.setRect(this.boundingRect.left, this.boundingRect.top, w, h);
		}, 

		//caret functions

		setCaretToNodeBegin : function()
		{
			return new CaretState(this.parentNode, this.parentNode.getChildPos(this));
		}, 

		setCaretToNodeEnd : function()
		{
			return new CaretState(this.parentNode, this.parentNode.getChildPos(this));
		},
		
		getNextPosition : function(relativeState, params)
		{
			return null;
		},
		
		getPreviousPosition : function(relativeState, params)
		{
			if (relativeState && relativeState.checkOnNode(this))
				return null;
			
			return new CaretState(this.parentNode, this.parentNode.getChildPos(this));
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
		},
		
		//tool functions
		
		addLine : function(left, top, right, bottom, color)
		{
			var f = this.drawLib.line(left, top, right, bottom, color, this.element);
			f.htmlNode = this.parentNode;
			this.updateClientRect();
		},

		addRect : function(x, y, width, height, color)
		{
			var f = this.drawLib.rect(x, y, width, height, color, this.element);
			f.htmlNode = this.parentNode;
			this.updateClientRect();
		},

		addFillRect : function(x, y, width, height, color)
		{
			var f = this.drawLib.fillRect(x, y, width, height, color, this.element);
			f.htmlNode = this.parentNode;
			this.updateClientRect();
		},

		addFillCircle : function(x, y, radius, color)
		{
			var f = this.drawLib.fillCircle(x, y, radius, color, this.element);
			f.htmlNode = this.parentNode;
			this.updateClientRect();
		},
		
		addPolygon : function(points, color)
		{
			var f = this.drawLib.polygon(points, color, this.element);
			f.htmlNode = this.parentNode;
			this.updateClientRect();
		},
		
		addBezier : function(path, color)
		{
			var f = this.drawLib.bezier(path, color, this.element);
			f.htmlNode = this.parentNode;
			this.updateClientRect();
		},
		
		clearShapes : function()
		{
			if (this.element.children)
			{
				for (var i = 0; i < this.element.children.length; ++i)
					this.drawLib.remove(this.element.children[i], this.element);
			}
			else
			{
				for (var i = 0; i < this.element.childNodes.length; ++i)
					this.drawLib.remove(this.element.childNodes[i], this.element);
			}
			
			this.updateClientRect();
		}
	}
);
