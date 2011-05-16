var TextFormulaNode = FormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;

			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessFormulaNode";

			var el = this.drawLib.createElement("text", parentNode ? parentNode.element : null);
			this._super("", el, parentNode, pos, nte);
			
			this.className = "TextFormulaNode";
		},
		
		createChildNode : function(nodeClassType, pos)
		{
			if (nodeClassType == window["TextNode"])
				return new FormulaTextNode(this, pos, this.nte);
			return new nodeClassType(this, pos, this.nte);
		},

		addTextNode : function(textNode)
		{
			new FormulaTextNode(textNode, this, this.childNodes.count(), this.nte);
		},
		
		remake : function()
		{
		},
		
		update : function()
		{
			this.updateClientRect();
			var c = this.nte.window.getComputedStyle(this.element, null);
			var s = parseInt(c["fontSize"]);
			this.baseline = s;
			
			this.element.setAttribute("dy", s - this.clientRect.height);
			//this.baseline = this.clientRect.height;
			//var s = this.nte.window.getComputedStyle(this.element, null);
		},

		updateBoundingRect : function()
		{
			if (this.element.x.baseVal.numberOfItems > 0)
			{
				this.boundingRect.setRect(this.element.x.baseVal.getItem(0).value, this.element.y.baseVal.getItem(0).value - this.clientRect.height, 
					this.clientRect.width, this.clientRect.height);
			}
		},

		updateClientRect : function()
		{
			var b = this.element.getBBox();
			this.clientRect.setRect(0, 0, Math.round(b.width), Math.round(b.height));
		},

		move : function(x, y)
		{
			this.drawLib.move(x, y + this.clientRect.height, this.element);
			this.updateBoundingRect();
		},
		
		//caret functions
		
		getFirstPosition : function()
		{
			if (this.childNodes.count() > 0)
				return this.childNodes.getFirst().getFirstPosition();
			return null;
		},
		
		getLastPosition : function()
		{
			if (this.childNodes.count() > 0)
				return this.childNodes.getLast().getLastPosition();
			return null;
		},

		getNextPosition : function(relativeState, params)
		{
			if (this.childNodes.count() > 0 && this.childNodes.get(0).empty)
				return null;
			if (relativeState.checkOnNode())
				return this._super(relativeState, params);
			return new CaretState(this.childNodes.get(0), 0);
		},

		getPreviousPosition : function(relativeState, params)
		{
			if (this.childNodes.count() > 0 && this.childNodes.get(0).empty)
				return null;
			return this._super(relativeState, params);
		},
		
		setLevel : function(level)
		{
			if (this.level != level)
			{
				if (this.levelClasses[this.level])
					this.removeClass(this.levelClasses[this.level]);
				
				this.level = level;
				
				if (this.levelClasses[this.level])
					this.addClass(this.levelClasses[this.level]);
			}
		}
	}
	);

var FormulaTextNode = TextNode.extend(
	{
		init : function(textNode, parentNode, pos, nte)
		{
			this._super(textNode, parentNode, pos, nte);
			this.className = "FormulaTextNode";

			this.empty = (textNode == null || textNode.textContent == "");
		},
		
		remake : function()
		{
		}
	}
	);
