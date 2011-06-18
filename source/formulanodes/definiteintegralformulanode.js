var DefiniteIntegralFormulaNode = CompoundFormulaNode.extend(
  {
    init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalIntegralFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessIntegralFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessIntegralFormulaNode";
			
			this._super(parentNode, pos, nte);
			this.className = "IntegralFormulaNode";

			this.shape = this.addShapeNode();
			this.lowerLimit = null;
			this.upperLimit = null;
			this.expression = null;
			this.dSymbol = null;
			this.differencial = null;
			
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
				this.lowerLimit = this.childNodes.get(0);
				break;
//			case 1:
//				this.shape = this.childNodes.get(1);
//				break;
			case 2:
				this.upperLimit = this.childNodes.get(2);
				break;
			case 3:
				this.expression = this.childNodes.get(3);
				break;
			//case 4:
			//	break;
			case 4:
				//if (!this.dSymbol)
				//	this.dSymbol = this.createTextNode(4);
				this.differencial = this.childNodes.get(4);
				break;
			}
			
			if (this.groupNode)
				this.groupNode.remake();
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

			if (this.lowerLimit)
				this.lowerLimit.setLevel(this.getLesserLevel());
			if (this.upperLimit)
				this.upperLimit.setLevel(this.getLesserLevel());
			if (this.expression)
				this.expression.setLevel(level);
			if (this.differencial)
				this.differencial.setLevel(level);
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);

			if (this.lowerLimit && this.upperLimit && this.expression && this.dSymbol && this.differencial)
			{
				var i = this.lowerLimit.clientRect.height;
				var j = this.upperLimit.clientRect.height;
				var cy = i / 2 + j / 2 + this.expression.clientRect.height * 2 / 3;
				if (this.expression.baseline > cy / 2)
					cy = 2 * this.expression.baseline;
				if (this.expression.clientRect.height - this.expression.baseline > cy / 2)
					cy = (this.expression.clientRect.height - this.expression.baseline) * 2;
				var cx = cy * 5 / 20;

				this.shape.clearShapes();
				this.shape.addBezier(
					"M " + 
					cx * 0.275 + "," + cy * 0.992 + " " + 
					"C " + 
					cx * 0.192 + "," + cy * 0.992 + " " + 
					cx * 0.067 + "," + cy * 0.960 + " " + 
					cx * 0.067 + "," + cy * 0.941 + " " + 
					cx * 0.067 + "," + cy * 0.919 + " " + 
					cx * 0.155 + "," + cy * 0.891 + " " + 
					cx * 0.220 + "," + cy * 0.891 + " " + 
					cx * 0.278 + "," + cy * 0.891 + " " + 
					cx * 0.347 + "," + cy * 0.909 + " " + 
					cx * 0.386 + "," + cy * 0.918 + " " + 
					cx * 0.442 + "," + cy * 0.919 + " " + 
					cx * 0.480 + "," + cy * 0.904 + " " + 
					cx * 0.480 + "," + cy * 0.888 + " " + 
					cx * 0.480 + "," + cy * 0.868 + " " + 
					cx * 0.465 + "," + cy * 0.819 + " " + 
					cx * 0.403 + "," + cy * 0.502 + " " + 
					cx * 0.430 + "," + cy * 0.222 + " " + 
					cx * 0.443 + "," + cy * 0.082 + " " + 
					cx * 0.580 + "," + cy * 0.032 + " " + 
					cx * 0.670 + "," + cy * 0. + " " + 
					cx * 0.804 + "," + cy * 0. + " " + 
					cx * 0.890 + "," + cy * 0. + " " + 
					cx * 1. + "," + cy * 0.033 + " " + 
					cx * 1. + "," + cy * 0.058 + " " + 
					cx * 1. + "," + cy * 0.080 + " " + 
					cx * 0.915 + "," + cy * 0.105 + " " + 
					cx * 0.850 + "," + cy * 0.105 + " " + 
					cx * 0.783 + "," + cy * 0.105 + " " + 
					cx * 0.687 + "," + cy * 0.047 + " " + 
					cx * 0.625 + "," + cy * 0.047 + " " + 
					cx * 0.588 + "," + cy * 0.088 + " " + 
					cx * 0.588 + "," + cy * 0.104 + " " + 
					cx * 0.603 + "," + cy * 0.161 + " " + 
					cx * 0.665 + "," + cy * 0.557 + " " + 
					cx * 0.637 + "," + cy * 0.810 + " " + 
					cx * 0.622 + "," + cy * 0.882 + " " + 
					cx * 0.553 + "," + cy * 0.930 + " " + 
					cx * 0.508 + "," + cy * 0.961 + " " + 
					cx * 0.350 + "," + cy * 0.992 + " " + 
					cx * 0.275 + "," + cy * 0.992, 
					"black"
					);

				this.shape.clientRect.setRect(0, 0, Math.round(cx), Math.round(cy));

				this.shape.move(0, this.upperLimit.clientRect.height / 2);
				this.upperLimit.move(this.shape.clientRect.width * 11 / 10, 0);
				this.lowerLimit.move(this.shape.clientRect.width * 11 / 10, 
					this.upperLimit.clientRect.height / 2 + this.shape.clientRect.height - this.lowerLimit.baseline);
				i = Math.max(this.upperLimit.clientRect.width, this.lowerLimit.clientRect.width);
				this.expression.move(i + this.shape.clientRect.width * 12 / 10, 
					this.upperLimit.clientRect.height / 2 + this.shape.clientRect.height / 2 - this.expression.baseline);
				this.dSymbol.move(i + this.shape.clientRect.width * 12 / 10 + this.expression.clientRect.width + this.dSymbol.clientRect.height / 5, 
					this.upperLimit.clientRect.height / 2 + this.shape.clientRect.height / 2 - this.dSymbol.baseline);
				this.differencial.move(i + this.shape.clientRect.width * 12 / 10 + this.expression.clientRect.width + this.dSymbol.clientRect.width + 
					this.dSymbol.clientRect.height / 5, 
					this.upperLimit.clientRect.height / 2 + this.shape.clientRect.height / 2 - this.differencial.baseline);
			}
			
			this.updateClientRect();
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.upperLimit && this.shape)
				this.baseline = this.upperLimit.clientRect.height / 2 + this.shape.clientRect.height / 2;
			//if (this.shape && this.expression)
			//	this.baseline = this.expression.boundingRect.top + this.expression.baseline;
		},

		createChildNode : function(nodeClassType, pos)
		{
			//the child nodes have already been created
			switch (pos)
			{
			case 0:
				this.lowerLimit = new nodeClassType(this, 0, this.nte);
				return this.lowerLimit;
			case 1:
				this.upperLimit = new nodeClassType(this, 2, this.nte);
				return this.upperLimit;
			case 2:
				this.expression = new nodeClassType(this, 3, this.nte);
				return this.expression;
			case 3:
				if (!this.dSymbol)
				{
					this.dSymbol = this.createTextNode(4, false);
					//this.dSymbol = new NonActiveTextFormulaNode(this, 4, this.nte);
					this.dSymbol.setText("d");
				}
				this.differencial = new nodeClassType(this, 5, this.nte);
				return this.differencial;
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
			var resNode = new IntegralFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.lowerLimit.dublicate(resNode);
			this.upperLimit.dublicate(resNode);
			this.expression.dublicate(resNode);
			this.differencial.dublicate(resNode);
			
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
