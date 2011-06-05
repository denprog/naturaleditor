/**
 * Multiply formula node
 * @class MultiplyFormulaNode
 * @constructor
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
			//var s = this.nte.window.getComputedStyle(this.element, null);
			//var h = parseInt(s.getPropertyValue("max-height"));
			//this.baseline = h;
			this.baseline = this.nte.theme.getNodeProperty("MultiplyFormulaNode", this.level, "height");
		},

		updateClientRect : function()
		{
			//var s = this.nte.window.getComputedStyle(this.element, null);
			//var w = parseInt(s.getPropertyValue("max-width"));
			//var h = parseInt(s.getPropertyValue("max-height"));
			var w = this.nte.theme.getNodeProperty("MultiplyFormulaNode", this.level, "width");
			var h = this.nte.theme.getNodeProperty("MultiplyFormulaNode", this.level, "height");
			
			this.clientRect.setRect(0, 0, w, h);
		}, 

		move : function(x, y)
		{
			this.element.setAttribute("transform", "translate(" + x + ", " + y + ")");
			this.boundingRect.setRect(x, y, this.clientRect.width, this.clientRect.height + this.baseline / 2);
		}, 

		render : function()
		{
			//var s = this.nte.window.getComputedStyle(this.element, null);
			//var w = parseInt(s.getPropertyValue("max-width"));
			//var h = parseInt(s.getPropertyValue("max-height"));
			var w = this.nte.theme.getNodeProperty("MultiplyFormulaNode", this.level, "width");
			var h = this.nte.theme.getNodeProperty("MultiplyFormulaNode", this.level, "height");
			
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
