var LimitFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super(parentNode, pos, nte);
			this.className = "LimitFormulaNode";

			this.limitSymbol = null;
			this.limitExpression = null;
			this.expression = null;

			//updating soon
			this.level = 0;
			if (this.groupNode)
				this.groupNode.remake();
		},

		insertChildNode : function(childNode, pos)
		{
			this._super(childNode, pos);

			if (this.groupNode)
				this.groupNode.remake();
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);

			if (this.limitSymbol && this.limitExpression && this.expression)
			{
				var i = this.nte.theme.getNodeProperty("LimitFormulaNode", this.level, "expressionOffset");
				var j = this.nte.theme.getNodeProperty("LimitFormulaNode", this.level, "limitExpressionOffset");

				if (this.limitSymbol.baseline > this.expression.baseline)
				{
					if (this.limitSymbol.clientRect.width > this.limitExpression.clientRect.width)
					{
						this.limitSymbol.move(0, 0);
						this.expression.move(this.limitSymbol.clientRect.width + i, this.limitSymbol.baseline - this.expression.baseline);
						this.limitExpression.move((this.limitSymbol.clientRect.width - this.limitExpression.clientRect.width) / 2, this.limitSymbol.clientRect.height + j);
					}
					else
					{
						this.limitSymbol.move((this.limitExpression.clientRect.width - this.limitSymbol.clientRect.width) / 2, 0);
						this.expression.move(this.limitExpression.clientRect.width + i, this.limitSymbol.baseline - this.expression.baseline);
						this.limitExpression.move(0, this.limitSymbol.clientRect.height + j);
					}
				}
				else
				{
					if (this.limitSymbol.clientRect.width > this.limitExpression.clientRect.width)
					{
						this.limitSymbol.move(0, this.expression.baseline - this.limitSymbol.baseline);
						this.expression.move(this.limitSymbol.clientRect.width + i, 0);
						this.limitExpression.move((this.limitSymbol.clientRect.width - this.limitExpression.clientRect.width) / 2, 
							this.limitSymbol.clientRect.height + this.expression.baseline - this.limitSymbol.baseline + j);
					}
					else
					{
						this.limitSymbol.move((this.limitExpression.clientRect.width - this.limitSymbol.clientRect.width) / 2, 
							this.expression.baseline - this.limitSymbol.baseline);
						this.expression.move(this.limitExpression.clientRect.width + i, 0);
						this.limitExpression.move(0, this.limitSymbol.clientRect.height + this.expression.baseline - this.limitSymbol.baseline + j);
					}
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
				if (!this.limitSymbol)
				{
					this.limitSymbol = this.createTextNode(0, false);
					this.limitSymbol.setText("lim");
				}
				this.limitExpression = new nodeClassType(this, 1, this.nte);
				return this.limitExpression;
			case 1:
				this.expression = new nodeClassType(this, 2, this.nte);
				return this.expression;
			}
			
			return null;
		},

		//command functions
		
		doInsert : function(pos, nodeEvent, command)
		{
			return false;
		},

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			return false;
		},

		//editing
		
		mergeWithNextNode : function(nodeEvent, command)
		{
			return false;
		},

		dublicate : function(parent)
		{
			var resNode = new LimitFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.limitSymbol.dublicate(resNode);
			this.limitExpression.dublicate(resNode);
			this.expression.dublicate(resNode);
			
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
