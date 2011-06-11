var BracketsFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte, element, params)
		{
			this.drawLib = nte.drawLib;

			//the left and right brackets availability
			this.left = element.attributes["left"];
			this.right = element.attributes["right"];

			if (params)
			{
				this.left = params.left;
				this.right = params.right;
			}
			
			this._super(parentNode, pos, nte);
			this.className = "BracketsFormulaNode";
			
			this.shape = this.addShapeNode();
			this.rightShape = this.addShapeNode();
		},
		
		insertChildNode : function(childNode, pos)
		{
			this._super(childNode, pos);

			switch (pos)
			{
			case 0:
				this.shape = this.childNodes.get(0);
				break;
			case 1:
				this.nested = this.childNodes.get(1);
				break;
			case 2:
				this.rightShape = this.childNodes.get(2);
				break;
			}
			
			if (this.groupNode)
				this.groupNode.remake();
		},
		
		remake : function()
		{
			this.childNodes.forEach("remake", []);
			
			if (this.nested && this.shape && this.rightShape)
			{
				this.shape.clearShapes();
				this.rightShape.clearShapes();
				
				var cx = Math.round(1 + this.nested.clientRect.height / 5);
				var cy = Math.round((1 + 2 * 1 / 10) * this.nested.clientRect.height);
				
				this.clientRect.setRectEmpty();
				
				if (this.left)
				{
					this.shape.addBezier(
						"M " + cx + "," + cy + " " +  
						"C " + 
						cx * 0.59 + "," + cy * 0.941 + " " + 
						cx * 0.132 + "," + cy * 0.66 + " " + 
						cx * 0.132 + "," + cy * 0.5 + " " + 
						cx * 0.132 + "," + cy * 0.333 + " " + 
						cx * 0.613 + "," + cy * 0.059 + " " + 
						cx + ",0 " + 
						"L " + 
						cx + "," + cy * 0.023 + " " + 
						"C " + 
						cx * 0.807 + "," + cy * 0.059 + " " + 
						cx * 0.558 + "," + cy * 0.190 + " " +  
						cx * 0.436 + "," + cy * 0.38 + " " + 
						cx * 0.436 + "," + cy * 0.486 + " " + 
						cx * 0.436 + "," + cy * 0.486 + " " + 
						cx * 0.436 + "," + cy * 0.606 + " " + 
						cx * 0.549 + "," + cy * 0.726 + " " +  
						cx * 0.781 + "," + cy * 0.926 + " " + 
						cx + "," + cy * 0.977 + " " + 
						"L " + 
						cx + "," + cy, 
						"black");
					
					this.shape.boundingRect.setRect(this.shape.boundingRect.left, this.shape.boundingRect.top, cx + this.nested.clientRect.width, cy);
					this.shape.clientRect.setRect(0, 0, cx, cy);
					this.clientRect.setRect(0, 0, cx + this.nested.clientRect.width, cy);
					
					this.nested.move(cx, 0);
				}
				
				if (this.right)
				{
					this.rightShape.addBezier(
						"M 0," + cy + " " +  
						"C " + 
						cx * 0.41 + "," + cy * 0.941 + " " + 
						cx * 0.868 + "," + cy * 0.66 + " " + 
						cx * 0.868 + "," + cy * 0.5 + " " + 
						cx * 0.868 + "," + cy * 0.333 + " " + 
						cx * 0.387 + "," + cy * 0.059 + " " + 
						"0,0 " + 
						"L " + 
						"0," + cy * 0.023 + " " + 
						"C " + 
						cx * 0.139 + "," + cy * 0.059 + " " + 
						cx * 0.442 + "," + cy * 0.190 + " " +  
						cx * 0.564 + "," + cy * 0.38 + " " + 
						cx * 0.564 + "," + cy * 0.486 + " " + 
						cx * 0.564 + "," + cy * 0.486 + " " + 
						cx * 0.564 + "," + cy * 0.606 + " " + 
						cx * 0.451 + "," + cy * 0.726 + " " +  
						cx * 0.219 + "," + cy * 0.926 + " " + 
						"0," + cy * 0.977 + " " + 
						"L " + 
						"0," + cy, 
						"black");
					
					this.rightShape.move(cx + this.nested.clientRect.width, 0);
					this.rightShape.boundingRect.setRect(this.rightShape.boundingRect.left, this.rightShape.boundingRect.top, cx, cy);
					this.rightShape.clientRect.setRect(0, 0, cx, cy);
					this.clientRect.setRect(0, 0, this.clientRect.width + cx, cy);
				}
			}
			
			this.updateClientRect();
		},
		
		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.nested)
				this.baseline = this.nested.baseline;
		},
		
		createChildNode : function(nodeClassType, pos)
		{
			switch (pos)
			{
			case 0:
				this.nested = new nodeClassType(this, 1, this.nte);
				return this.nested;
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
			var resNode = new BracketsFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			resNode.left = this.left;
			resNode.right = this.right;
			this.nested.dublicate(resNode);
			
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
			return "{" + this.nested.toTex() + "}";
		}
	}
	);
