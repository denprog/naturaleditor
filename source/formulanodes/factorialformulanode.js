var FactorialFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this._super(parentNode, pos, nte);
			this.className = "FactorialFormulaNode";
			
			this.shape = this.addShapeNode();
		},
		
		insertChildNode : function(childNode, pos)
		{
			this._super(childNode, pos);
			
			switch (pos)
			{
			case 0:
				this.expression = this.childNodes.get(0);
				break;
			case 1:
				this.shape = this.childNodes.get(1);
				break;
			}
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);
			
			if (this.expression && this.shape)
			{
				this.shape.clearShapes();

				var cx = Math.round(this.expression.clientRect.height * 3 / 11);

				if (cx > 0)
				{
					var cy = this.expression.clientRect.height;
					var offset = this.nte.theme.getNodeProperty("FactorialFormulaNode", this.level, "shapeOffset");
					this.shape.addFillCircle(cx * 0.5, cy * 0.857, cx * 0.1, "black");
					this.shape.addBezier(
						"M " + 
						cx * 0.51 + "," + cy * 0.67 + " " + 
						cx * 0.334 + "," + cy * 0.165 + " " + 
						cx * 0.33 + "," + cy * 0.118 + " " + 
						cx * 0.33 + "," + cy * 0.063 + " " + 
						cx * 0.421 + "," + cy * 0.009 + " " + 
						cx * 0.489 + "," + cy * 0.009 + " " + 
						cx * 0.555 + "," + cy * 0.009 + " " + 
						cx * 0.649 + "," + cy * 0.064 + " " + 
						cx * 0.649 + "," + cy * 0.118 + " " + 
						cx * 0.643 + "," + cy * 0.165 + " " + 
						cx * 0.51 + "," + cy * 0.77, 
						"black"
						);

					this.shape.boundingRect.setRect(this.shape.boundingRect.left, this.shape.boundingRect.top, cx, cy);
					this.shape.clientRect.setRect(0, 0, cx, cy);
					this.shape.move(this.expression.clientRect.width + offset, 0);
				}
			}
			
			this.updateClientRect();
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.expression)
				this.baseline = this.expression.baseline;
		},

		createChildNode : function(nodeClassType, pos)
		{
			switch (pos)
			{
			case 0:
				this.expression = new nodeClassType(this, 0, this.nte);
				return this.expression;
			}
			
			return null;
		},
		
		//command functions
		
		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			return false;
		},

		//editing
		
		dublicate : function(parent)
		{
			var resNode = new FactorialFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
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
			return "{" + this.expression.toTex() + "}!";
		}
	}
	);
