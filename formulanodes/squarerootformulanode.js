var SquareRootFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this._super(parentNode, pos, nte);
			this.className = "SquareRootFormulaNode";
			
			this.shape = this.addShapeNode();
		},
		
		insertChildNode : function(childNode, pos)
		{
//			if (!this.shape)
//			{
//				this._super(childNode, pos);
//				this.shape = this.childNodes.get(1);
//				return;
//			}
//			
//			if (pos == 1)
//				return;

			this._super(childNode, pos);
			
			switch (pos)
			{
			case 0:
				this.shape = this.childNodes.get(0);
				break;
			case 1:
				this.radicand = this.childNodes.get(1);
				break;
			}
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);
			
			if (this.radicand)
			{
				this.shape.clearShapes();
				
				var cx = Math.round(this.radicand.clientRect.height * 5 / 11);
				this.offset = this.radicand.clientRect.height / 5;
				var cy = this.radicand.clientRect.height + this.offset * 2;
				
				this.shape.addPolygon(
					cx + "," + cy * 0.01 + " " + 
					cx * 0.722 + "," + cy + " " + 
					cx * 0.281 + "," + cy * 0.495 + " " + 
					cx * 0.061 + "," + cy * 0.544 + " " + 
					cx * 0.075 + "," + cy * 0.510 + " " + 
					cx * 0.343 + "," + cy * 0.429 + " " + 
					cx * 0.703 + "," + cy * 0.869 + " " + 
					cx * 0.934 + "," + "0 " + 
					(cx * 1.32 + this.radicand.clientRect.width) + "," + 0 + " " + 
					(cx * 1.32 + this.radicand.clientRect.width) + "," + cy * 0.01 + " " + 
					cx * 1.32 + "," + cy * 0.01, 
					"black");
				this.shape.boundingRect.setRect(this.shape.boundingRect.left, this.shape.boundingRect.top, cx * 1.32 + this.radicand.clientRect.width, cy);
				this.shape.clientRect.setRect(0, 0, cx, cy);
				this.clientRect.setRect(0, 0, cx * 1.32 + this.radicand.clientRect.width, cy);
				
				this.radicand.move(cx * 1.3, this.offset);
			}
			
			this.updateClientRect();
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.radicand)
				this.baseline = this.radicand.baseline + this.offset;
		},

		createChildNode : function(nodeClassType, pos)
		{
			//the child nodes have already been created
			switch (pos)
			{
			case 0:
				this.radicand = new nodeClassType(this, 1, this.nte);
				return this.radicand;
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
			var resNode = new SquareRootFormulaNode(parent, 
				this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.radicand.dublicate(resNode);
			
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
			return "sqrt" + this.radicand.toTex();
		}
	}
	);
