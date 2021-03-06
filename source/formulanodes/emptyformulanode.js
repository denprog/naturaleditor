/**
 * @class EmptyFormulaNode
 * @constructor
 * @extends ShapeFormulaNode
 */
var EmptyFormulaNode = ShapeFormulaNode.extend(
	{
		/**
		 * @this {EmptyFormulaNode}
		 */
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
		
		/**
		 * @this {EmptyFormulaNode}
		 */
		remake : function()
		{
			this.updateClientRect();
		},

		/**
		 * @this {EmptyFormulaNode}
		 */
		render : function()
		{
			var s = this.nte.window.getComputedStyle(this.element, null);
			var h = parseInt(s.getPropertyValue("font-size"));
			
			this.clearShapes();
			
			this.addRect(1, 1, h / 2 - 2, h - 2, "black");
		},
		
		/**
		 * @this {EmptyFormulaNode}
		 */
		updateClientRect : function()
		{
			var s = this.nte.window.getComputedStyle(this.element, null);
			var h = parseInt(s.getPropertyValue("font-size"));
			
			this.clientRect.setRect(0, 0, h / 2, h);
			this.boundingRect.setRect(0, 0, h / 2, h);
		},

		/**
		 * @this {EmptyFormulaNode}
		 */
		update : function()
		{
			this.childNodes.forEach("update", []);
			
			//update the baseline
			var s = this.nte.window.getComputedStyle(this.element, null);
			var h = parseInt(s.getPropertyValue("font-size"));
			this.baseline = h;
		}, 
		
		//caret functions

		getNextPosition : function(relativeState, params)
		{
			return null;
		},
		
		//test functions
		
		toTex : function()
		{
			return "";
		}
	}
);