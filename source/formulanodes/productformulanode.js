var ProductFormulaNode = CompoundFormulaNode.extend(
  {
    init: function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this._super(parentNode, pos, nte);
			this.className = "ProductFormulaNode";
			
			this.shape = this.addShapeNode();
			this.variable = null;
			this.limit = null;
			this.expression = null;

			this.render();
		},

		insertChildNode : function(childNode, pos)
		{
			if (pos == 1)
				return;
			
			this._super(childNode, pos);
			
			switch (pos)
			{
			case 0:
				this.variable = this.childNodes.get(0);
				break;
			case 1:
				this.shape = this.childNodes.get(1);
				break;
			case 2:
				this.limit = this.childNodes.get(2);
				break;
			case 3:
				this.expression = this.childNodes.get(3);
				break;
			}
			
			if (this.groupNode)
				this.groupNode.remake();
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
					cx * 0.029 + "," + cy * 0.028 + " " + 
					"L " + 
					cx * 0.966 + "," + cy * 0.028 + " " + 
					cx * 0.966 + "," + cy * 0.049 + " " + 
					"C " + 
					cx * 0.894 + "," + cy * 0.049 + " " + 
					cx * 0.851 + "," + cy * 0.089 + " " + 
					cx * 0.851 + "," + cy * 0.136 + " " + 
					"L " + 
					cx * 0.851 + "," + cy * 0.877 + " " + 
					"C " + 
					cx * 0.874 + "," + cy * 0.931 + " " + 
					cx * 0.905 + "," + cy * 0.958 + " " + 
					cx * 0.966 + "," + cy * 0.963 + " " + 
					"L " + 
					cx * 0.966 + "," + cy * 0.984 + " " + 
					cx * 0.615 + "," + cy * 0.984 + " " + 
					cx * 0.615 + "," + cy * 0.963 + " " + 
					"C " + 
					cx * 0.688 + "," + cy * 0.963 + " " + 
					cx * 0.731 + "," + cy * 0.923 + " " + 
					cx * 0.731 + "," + cy * 0.877 + " " + 
					"L " + 
					cx * 0.731 + "," + cy * 0.072 + " " + 
					cx * 0.264 + "," + cy * 0.072 + " " + 
					cx * 0.264 + "," + cy * 0.877 + " " + 
					"C " + 
					cx * 0.278 + "," + cy * 0.935 + " " + 
					cx * 0.336 + "," + cy * 0.963 + " " + 
					cx * 0.38 + "," + cy * 0.963 + " " + 
					"L " + 
					cx * 0.38 + "," + cy * 0.984 + " " + 
					cx * 0.029 + "," + cy * 0.984 + " " + 
					cx * 0.029 + "," + cy * 0.963 + " " + 
					"C " + 
					cx * 0.101 + "," + cy * 0.963 + " " + 
					cx * 0.145 + "," + cy * 0.923 + " " + 
					cx * 0.145 + "," + cy * 0.877 + " " + 
					"L " + 
					cx * 0.145 + "," + cy * 0.136 + " " + 
					"C " + 
					cx * 0.145 + "," + cy * 0.089 + " " + 
					cx * 0.102 + "," + cy * 0.049 + " " + 
					cx * 0.029 + "," + cy * 0.049 + " " + 
					"L " + 
					cx * 0.029 + "," + cy * 0.028, 
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

		setLevel : function(level)
		{
			if (this.level != level)
			{
				if (this.levelClasses && this.levelClasses[this.level])
					this.removeClass(this.levelClasses[this.level]);
				
				this.level = level;
				
				if (this.levelClasses && this.levelClasses[this.level])
					this.addClass(this.levelClasses[this.level]);
				
				this.render();
			}

			if (this.variable)
				this.variable.setLevel(this.getLesserLevel());
			if (this.limit)
				this.limit.setLevel(this.getLesserLevel());
			if (this.expression)
				this.expression.setLevel(level);
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.shape && this.expression)
				this.baseline = this.expression.boundingRect.top + this.expression.baseline;
		},

		createChildNode : function(nodeClassType, pos)
		{
			//the child nodes have already been created
			switch (pos)
			{
			case 0:
				this.variable = new nodeClassType(this, 0, this.nte);
				return this.variable;
			case 1:
				this.limit = new nodeClassType(this, 2, this.nte);
				return this.limit;
			case 2:
				this.expression = new nodeClassType(this, 3, this.nte);
				return this.expression;
			}
			
			return null;
		},

		//editing
		
		dublicate : function(parent)
		{
			var resNode = new ProductFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.variable.dublicate(resNode);
			this.limit.dublicate(resNode);
			this.expression.dublicate(resNode);
			
			resNode.groupNode = this.groupNode;
			
			return resNode;
		}, 

		mergeWithNextNode : function(nodeEvent, command)
		{
			return false;
		},
		
		//test functions
		
		toTex : function()
		{
			return "";
		}
  }
  );
