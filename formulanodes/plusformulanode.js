/**
 * Plus formula node
 * @class PlusFormulaNode
 */
var PlusFormulaNode = ShapeFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalPlusFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessPlusFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessPlusFormulaNode";
			
			this._super(parentNode, pos, nte);
			this.className = "PlusFormulaNode";
			
			this.addClass("normalPlusFormulaNode");
			
			this.shape1 = null;
			this.shape2 = null;
			
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
			//this.boundingRect.setRect(x, y - this.baseline, this.clientRect.width, this.clientRect.height + this.baseline);
			//this.boundingRect.setRect(x, y, this.clientRect.width, this.clientRect.height + this.baseline / 2);
			this.boundingRect.setRect(x, y, this.clientRect.width, this.clientRect.height);
			//this.updateBoundingRect();
		}, 

		render : function()
		{
			var s = nte.window.getComputedStyle(this.element, null);
			var w = parseInt(s.getPropertyValue("width"));
			var h = parseInt(s.getPropertyValue("height"));
			
			if (this.shape1)
			{
				this.drawLib.remove(this.shape1, this.element);
				this.drawLib.remove(this.shape2, this.element);
			}
			
			this.shape1 = this.drawLib.fillRect(Math.round(w / 2), 1, 0.5, h - 2, "black", this.element);
			this.shape2 = this.drawLib.fillRect(1, Math.round(h / 2), w - 2, 0.5, "black", this.element);
		},
		
		//test functions
		
		toTex : function()
		{
			return "+";
		}
	}
);