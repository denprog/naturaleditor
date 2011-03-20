/**
 * Minus formula node
 * @class MinusFormulaNode
 */
var MinusFormulaNode = ShapeFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalMinusFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessMinusFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessMinusFormulaNode";
			
			this._super(parentNode, pos, nte);
			this.className = "MinusFormulaNode";
			
			this.addClass("normalMinusFormulaNode");
			
			this.shape = null;
			
			this.render();
		}, 
		
		remake : function()
		{
			this.updateClientRect();
		},

		update : function()
		{
			var s = nte.window.getComputedStyle(this.element, null);
			var h = parseInt(s.getPropertyValue("height"));
			this.baseline = h;
			//this.baseline = this.clientRect.height;
		},

		updateClientRect : function()
		{
			var s = nte.window.getComputedStyle(this.element, null);
			var w = parseInt(s.getPropertyValue("width"));
			var h = parseInt(s.getPropertyValue("height"));
			
			this.clientRect.setRect(0, 0, w, h);
		}, 

		move : function(x, y)
		{
			this.element.setAttribute("transform", "translate(" + x + ", " + y + ")");
			this.boundingRect.setRect(x, y, this.clientRect.width, this.clientRect.height + this.baseline / 2);
		}, 

		render : function()
		{
			var s = nte.window.getComputedStyle(this.element, null);
			var w = parseInt(s.getPropertyValue("width"));
			var h = parseInt(s.getPropertyValue("height"));
			
			if (this.shape)
				this.drawLib.remove(this.shape, this.element);
			
			this.shape = this.drawLib.fillRect(1, h / 2, w - 2, 0.1, "black", this.element);
		},
		
		//test functions
		
		toTex : function()
		{
			return "-";
		}
	}
);
