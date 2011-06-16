var SumFormulaNode = IterateFormulaNode.extend(
  {
    init: function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalSumFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessSumFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessSumFormulaNode";
			
			this._super(parentNode, pos, nte);
			this.className = "SumFormulaNode";
			
			this.render();
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);

			if (this.variable && this.limit && this.expression)
			{
				var i = this.variable.clientRect.width;
				if (i < this.limit.clientRect.width)
					i = this.limit.clientRect.width;
				var cx = Math.round(i * 7 / 6);
				var cy = cx;

				this.shape.clearShapes();
				this.shape.addBezier(
					"M " + 
					cx * 0.04 + "," + cy * 0.002 + " " + 
					"L " + 
					cx * 0.9 + "," + cy * 0.002 + " " + 
					cx * 0.91 + "," + cy * 0.2 + " " + 
					cx * 0.89 + "," + cy * 0.2 + " " + 
					"C " + 
					cx * 0.876 + "," + cy * 0.127 + " " + 
					cx * 0.794 + "," + cy * 0.061 + " " + 
					cx * 0.721 + "," + cy * 0.061 + " " + 
					"L " + 
					cx * 0.227 + "," + cy * 0.061 + " " + 
					cx * 0.602 + "," + cy * 0.443 + " " + 
					cx * 0.183 + "," + cy * 0.875 + " " + 
					cx * 0.728 + "," + cy * 0.875 + " " + 
					"C " + 
					cx * 0.868 + "," + cy * 0.849 + " " + 
					cx * 0.918 + "," + cy * 0.754 + " " + 
					cx * 0.935 + "," + cy * 0.738 + " " + 
					"L " + 
					cx * 0.961 + "," + cy * 0.69 + " " + 
					cx * 0.961 + "," + cy * 0.742 + " " + 
					cx * 0.919 + "," + cy * 0.97 + " " + 
					cx * 0.043 + "," + cy * 0.97 + " " + 
					cx * 0.043 + "," + cy * 0.95 + " " + 
					cx * 0.49 + "," + cy * 0.491 + " " + 
					cx * 0.043 + "," + cy * 0.037 + " " + 
					cx * 0.04 + "," + cy * 0.002, 
					"black"
					);

				this.shape.clientRect.setRect(0, 0, cx, cy);

				if (this.expression.baseline < this.shape.clientRect.height / 2)
				{
					this.limit.move(this.shape.clientRect.width / 2 - this.limit.clientRect.width / 2, 0);
					this.shape.move(0, this.limit.clientRect.height + this.shape.clientRect.height / 10);
					this.expression.move(this.shape.clientRect.width + this.shape.clientRect.width / 10, 
						this.limit.clientRect.height + this.shape.clientRect.height / 2 + this.shape.clientRect.height / 10 - this.expression.baseline);
					this.variable.move(this.shape.clientRect.width / 2 - this.variable.clientRect.width / 2, 
						this.limit.clientRect.height + this.shape.clientRect.height + this.shape.clientRect.height / 5);
				}
				else if (this.expression.baseline < this.shape.clientRect.height / 2 + this.shape.clientRect.height / 10 + this.limit.clientRect.height)
				{
					this.shape.move(0, this.limit.clientRect.height + this.shape.clientRect.height / 10);
					this.expression.move(this.shape.clientRect.width + this.shape.clientRect.width / 10, 
						this.limit.clientRect.height + this.shape.clientRect.height / 2 + this.shape.clientRect.height / 10 - this.expression.baseline);
					this.variable.move(this.shape.clientRect.width / 2 - this.variable.clientRect.width / 2, 
						this.limit.clientRect.height + this.shape.clientRect.height + this.shape.clientRect.height / 5);
					this.limit.move(this.shape.clientRect.width / 2 - this.limit.clientRect.width / 2, 0);
				}
				else
				{
					this.limit.move(this.shape.clientRect.width / 2 - this.limit.clientRect.width / 2, 
						this.expression.baseline - this.limit.clientRect.height - this.shape.clientRect.height / 10 - this.shape.clientRect.height / 2);
					this.shape.move(0, 
						this.expression.baseline - this.shape.clientRect.height / 2);
					this.expression.move(this.shape.clientRect.width + this.shape.clientRect.width / 10, 
						0);
					this.variable.move(this.shape.clientRect.width / 2 - this.variable.clientRect.width / 2, 
						this.expression.baseline + this.shape.clientRect.height / 2 + this.shape.clientRect.height / 10);
				}
			}
			
			this.updateClientRect();
		},

		//editing
		
		dublicate : function(parent)
		{
			var resNode = new SumFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.variable.dublicate(resNode);
			this.limit.dublicate(resNode);
			
			resNode.groupNode = this.groupNode;
			
			return resNode;
		}, 
		
		//test functions
		
		toTex : function()
		{
			return "";
		}
  }
  );
