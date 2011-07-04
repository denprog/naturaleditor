var EquationFormulaNode = ShapeFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this._super(parentNode, pos, nte);
			this.className = "EquationFormulaNode";
			
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
			this.baseline = this.nte.theme.getNodeProperty("EquationFormulaNode", this.level, "height");
		},

		updateClientRect : function()
		{
			var w = this.nte.theme.getNodeProperty("EquationFormulaNode", this.level, "width");
			var h = this.nte.theme.getNodeProperty("EquationFormulaNode", this.level, "height");
			
			this.clientRect.setRect(0, 0, w, h);
		}, 

		move : function(x, y)
		{
			this.element.setAttribute("transform", "translate(" + x + ", " + y + ")");
			this.boundingRect.setRect(x, y, this.clientRect.width, this.clientRect.height);
		}, 

		render : function()
		{
			var w = this.nte.theme.getNodeProperty("EquationFormulaNode", this.level, "width");
			var h = this.nte.theme.getNodeProperty("EquationFormulaNode", this.level, "height");
			
			if (this.shape1 && this.shape2)
			{
				this.drawLib.remove(this.shape1, this.element);
				this.drawLib.remove(this.shape2, this.element);
			}
			
			this.shape1 = this.drawLib.fillRect(w * 0.03, h - h * 0.3, w * 0.9, h * 0.1, "black", this.element);
			this.shape1.htmlNode = this.parentNode;
			this.shape2 = this.drawLib.fillRect(w * 0.03, h - h * 0.693, w * 0.9, h * 0.1, "black", this.element);
			this.shape2.htmlNode = this.parentNode;
		},
		
		//test functions
		
		toTex : function()
		{
			return "=";
		}
	}
	);
