var DifferentialFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalDifferentialFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessDifferentialFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessDifferentialFormulaNode";

			this._super(parentNode, pos, nte);
			this.className = "DifferentialFormulaNode";

			this.expression = null;
			this.division = null;

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

			if (this.division && this.expression && this.expression.baseline > 0)
			{
				var i = this.nte.theme.getNodeProperty("DifferentialFormulaNode", this.level, "expressionOffset");
				if (this.division.baseline > this.expression.baseline)
				{
					this.division.move(0, 0);
					this.expression.move(this.division.clientRect.width + i, this.division.baseline - this.expression.baseline);
				}
				else
				{
					this.division.move(0, this.expression.baseline - this.division.baseline);
					this.expression.move(this.division.clientRect.width + i, 0);
				}
			}

			this.updateClientRect();
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.division && this.expression)
				this.baseline = Math.max(this.division.baseline, this.expression.baseline);
		},

		createChildNode : function(nodeClassType, pos)
		{
			//the child nodes have already been created
			switch (pos)
			{
			case 0:
				if (!this.division)
				{
					this.division = new DifferentialDivisionFormulaNode(this, 0, this.nte);
//					var g = new GroupFormulaNode(this.division, 0, this.nte);
//					var d = g.createTextNode(0, false);
//					d.setText("d");
//					g = new GroupFormulaNode(this.division, 2, this.nte);
//					var d = g.createTextNode(0, false);
//					d.setText("d");
//					this.differenial = new nodeClassType(g, 1, this.nte);
					this.differenial = new nodeClassType(this.division.childNodes.get(2), 1, this.nte);
				}
				return this.differenial;
			case 1:
				this.expression = new nodeClassType(this, 1, this.nte);
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
			var resNode = new DifferenialFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.expression.dublicate(resNode);
			this.differenial.dublicate(resNode);
			
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

var DifferentialDivisionFormulaNode = DivisionFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super(parentNode, pos, nte);

			var g = new GroupFormulaNode(this, 0, this.nte);
			var d = g.createTextNode(0, false);
			d.setText("d");
			g = new GroupFormulaNode(this, 2, this.nte);
			var d = g.createTextNode(0, false);
			d.setText("d");
		},

		getFirstPosition : function()
		{
			return this.childNodes.get(2).childNodes.get(1).getFirstPosition();
		},

		getLastPosition : function()
		{
			return this.childNodes.get(2).childNodes.get(1).getLastPosition();
		},

		getNextPosition : function(relativeState, params)
		{
			return this._super(relativeState, params);
		},

		getPreviousPosition : function(relativeState, params)
		{
			if (relativeState && relativeState.checkInNode(this))
				return this.parentNode.getFirstPosition();
			return this._super(relativeState, params);
		}
	}
	);
