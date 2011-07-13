/**
 * Plus formula node
 * @class PlusFormulaNode
 * @constructor
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
			this.baseline = this.nte.theme.getNodeProperty("PlusFormulaNode", this.level, "height");
		},

		updateClientRect : function()
		{
			var w = this.nte.theme.getNodeProperty("PlusFormulaNode", this.level, "width");
			var h = this.nte.theme.getNodeProperty("PlusFormulaNode", this.level, "height");
			
			this.clientRect.setRect(0, 0, w, h);
		}, 

		move : function(x, y)
		{
			this.element.setAttribute("transform", "translate(" + x + ", " + y + ")");
			this.boundingRect.setRect(x, y, this.clientRect.width, this.clientRect.height);
		}, 

		render : function()
		{
			var w = this.nte.theme.getNodeProperty("PlusFormulaNode", this.level, "width");
			var h = this.nte.theme.getNodeProperty("PlusFormulaNode", this.level, "height");
			
			if (this.shape1)
			{
				this.drawLib.remove(this.shape1, this.element);
				this.drawLib.remove(this.shape2, this.element);
			}
			
			this.shape1 = this.drawLib.fillRect(Math.round(w / 2), 1, 1, h - 2, "black", this.element);
			this.shape1.htmlNode = this.parentNode;
			this.shape2 = this.drawLib.fillRect(1, Math.round(h / 2), w - 2, 1, "black", this.element);
			this.shape2.htmlNode = this.parentNode;
		},
		
		//test functions
		
		toTex : function()
		{
			return "+";
		}
	}
);
