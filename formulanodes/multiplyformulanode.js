/**
 * Multiply formula node
 * @class MultiplyFormulaNode
 */
var MultiplyFormulaNode = ShapeFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalMultiplyFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessMultiplyFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessMultiplyFormulaNode";
			
			this._super(parentNode, pos, nte);
			this.className = "MultiplyFormulaNode";
			
			this.addClass("normalMultiplyFormulaNode");
			
			this.shape = null;
			
			this.render();
		}, 
		
		remake : function()
		{
			this.update();
			this.updateClientRect();
		},

		update : function()
		{
			var s = nte.window.getComputedStyle(this.element, null);
			var h = parseInt(s.getPropertyValue("height"));
			this.baseline = h;
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
			
			this.shape = this.drawLib.fillCircle(Math.round(w / 2), Math.round(h / 2), Math.round(w / 8), "black", this.element);
		},
		
		//test functions
		
		toTex : function()
		{
			return "*";
		}
	}
);
