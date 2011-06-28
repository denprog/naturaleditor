var CommaFormulaNode = ShapeFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalCommaFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessCommaFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessCommaFormulaNode";
			
			this._super(parentNode, pos, nte);
			this.className = "CommaFormulaNode";
			
			this.addClass("normalCommaFormulaNode");
			
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
			this.baseline = this.nte.theme.getNodeProperty("CommaFormulaNode", this.level, "height");
		},

		updateClientRect : function()
		{
			var w = this.nte.theme.getNodeProperty("CommaFormulaNode", this.level, "width");
			var h = this.nte.theme.getNodeProperty("CommaFormulaNode", this.level, "height");
			
			this.clientRect.setRect(0, 0, w, h * 1.1);
		}, 

		move : function(x, y)
		{
			this.element.setAttribute("transform", "translate(" + x + ", " + y + ")");
			this.boundingRect.setRect(x, y, this.clientRect.width, this.clientRect.height);
		}, 

		render : function()
		{
			var w = this.nte.theme.getNodeProperty("CommaFormulaNode", this.level, "width");
			var h = this.nte.theme.getNodeProperty("CommaFormulaNode", this.level, "height");
			
			if (this.shape)
				this.drawLib.remove(this.shape, this.element);
			
			this.shape = this.drawLib.polygon(
				w * 0.299 + "," + h * 0.868 + " " + 
				w * 0.481 + "," + h * 0.868 + " " + 
				w * 0.05 + "," + h * 1.1 + " " + 
				w * 0.015 + "," + h * 1.1 + " " + 
				w * 0.299 + "," + h * 0.868, 
				"black", 
				this.element);
			this.shape.htmlNode = this.parentNode;

			this.updateClientRect();
		},
		
		//test functions
		
		toTex : function()
		{
			return ",";
		}
	}
	);
