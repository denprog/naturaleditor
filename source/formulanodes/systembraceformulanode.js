var SystemBraceFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this._super(parentNode, pos, nte);
			this.className = "SystemBraceFormulaNode";
			
			this.shape = this.addShapeNode();
		},
		
		insertChildNode : function(childNode, pos)
		{
			if (!this.shape)
			{
				this._super(childNode, pos);
				this.shape = this.childNodes.get(0);
			}
			else
			{
				this._super(childNode, pos + 1);
			}
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);
			
			if (this.childNodes.count() > 1)
			{
				this.shape.clearShapes();

				var m = this.nte.theme.getNodeProperty("SystemBraceFormulaNode", this.level, "shapeOffset");
				var n = this.nte.theme.getNodeProperty("SystemBraceFormulaNode", this.level, "expressionOffset");

				var cy = 0;
				for (var i = 1; i < this.childNodes.count(); ++i)
					cy += this.childNodes.get(i).clientRect.height + n;
				var cx = 1 + Math.round(cy / 4);

				this.shape.addBezier(
					"M " + 
					cx + "," + cy + " " + 
					"C " + 
					cx * 0.739 + "," + cy * 0.988 + " " + 
					cx * 0.413 + "," + cy * 0.867 + " " + 
					cx * 0.413 + "," + cy * 0.739 + " " + 
					cx * 0.413 + "," + cy * 0.751 + " " + 
					cx * 0.485 + "," + cy * 0.652 + " " + 
					cx * 0.485 + "," + cy * 0.624 + " " + 
					cx * 0.485 + "," + cy * 0.585 + " " + 
					cx * 0.296 + "," + cy * 0.518 + " " + 
					cx * 0.129 + "," + cy * 0.511 + " " + 
					"L " + 
					cx * 0.129 + "," + cy * 0.489 + " " + 
					"C " + 
					cx * 0.296 + "," + cy * 0.481 + " " + 
					cx * 0.485 + "," + cy * 0.415 + " " + 
					cx * 0.485 + "," + cy * 0.376 + " " + 
					cx * 0.485 + "," + cy * 0.362 + " " + 
					cx * 0.413 + "," + cy * 0.245 + " " + 
					cx * 0.413 + "," + cy * 0.206 + " " + 
					cx * 0.413 + "," + cy * 0.133 + " " + 
					cx * 0.739 + "," + cy * 0.012 + " " + 
					cx + "," + 0. + " " + 
					"L " + 
					cx + "," + cy * 0.019 + " " + 
					"C " + 
					cx * 0.817 + "," + cy * 0.034 + " " + 
					cx * 0.647 + "," + cy * 0.102 + " " + 
					cx * 0.647 + "," + cy * 0.143 + " " + 
					cx * 0.647 + "," + cy * 0.174 + " " + 
					cx * 0.718 + "," + cy * 0.278 + " " + 
					cx * 0.718 + "," + cy * 0.314 + " " + 
					cx * 0.718 + "," + cy * 0.369 + " " + 
					cx * 0.487 + "," + cy * 0.47 + " " + 
					cx * 0.257 + "," + cy * 0.498 + " " + 
					"C " + 
					cx * 0.487 + "," + cy * 0.526 + " " + 
					cx * 0.718 + "," + cy * 0.609 + " " + 
					cx * 0.718 + "," + cy * 0.685 + " " + 
					cx * 0.718 + "," + cy * 0.722 + " " + 
					cx * 0.647 + "," + cy * 0.825 + " " + 
					cx * 0.647 + "," + cy * 0.857 + " " + 
					cx * 0.647 + "," + cy * 0.898 + " " + 
					cx * 0.817 + "," + cy * 0.966 + " " + 
					cx + "," + cy * 0.981, 
					"black"
					);

				this.shape.boundingRect.setRect(this.shape.boundingRect.left, this.shape.boundingRect.top, cx, cy);
				this.shape.clientRect.setRect(this.shape.boundingRect.left, this.shape.boundingRect.top, cx, cy);

				cx += m;
				m = this.nte.theme.getNodeProperty("SystemBraceFormulaNode", this.level, "expressionOffset");

				for (var i = 1, j = 0; i < this.childNodes.count(); ++i)
				{
					var n = this.childNodes.get(i);
					n.move(cx, j);
					j += n.clientRect.height + m;
				}
			}
			
			this.updateClientRect();
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.childNodes.count() > 1)
				this.baseline = this.shape.clientRect.height / 2;
		},

		//command functions
		
		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			return false;
		},

		//editing
		
		dublicate : function(parent)
		{
			var resNode = new SystemBraceFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
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
			return "";
		}
	}
	);
