var EmptyFormulaNode = ShapeFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;

			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalEmptyFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessEmptyFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessEmptyFormulaNode";

			this._super(parentNode, pos, nte);
			
			this.addClass("normalEmptyFormulaNode");
			
			this.className = "EmptyFormulaNode";

			//this.shape = null;
			
			this.render();
		},
		
		remake : function()
		{
			this.updateClientRect();
		},

		render : function()
		{
			var s = nte.window.getComputedStyle(this.element, null);
			var h = parseInt(s.getPropertyValue("font-size"));
			
			//if (this.shape)
			this.clearShapes();
			
			//this.shape = this.drawLib.rect(2, 2, h / 2 - 2, h - 2, "black", this.element);
			this.addRect(1, 1, h / 2 - 2, h - 2, "black");
			//this.addRect(0, 0, h, h, "black");
		},
		
		updateClientRect : function()
		{
			var s = nte.window.getComputedStyle(this.element, null);
			var h = parseInt(s.getPropertyValue("font-size"));
			
			this.clientRect.setRect(0, 0, h / 2, h);
			this.boundingRect.setRect(0, 0, h / 2, h);
		},

		update : function()
		{
			this.childNodes.forEach("update", []);
			
			//update the baseline
			var s = nte.window.getComputedStyle(this.element, null);
			var h = parseInt(s.getPropertyValue("font-size"));
			this.baseline = h;
		}, 
		
		//caret functions

		getNextPosition : function(relativeState)
		{
			//return this.parentNode.getNextPosition(new CaretState(this.parentNode, this.parentNode.getChildPos(this) + 1));
			return null;
		},
		
		//test functions
		
		toTex : function()
		{
			return "";
		}
	}
);