﻿var IndefiniteIntegralFormulaNode = CompoundFormulaNode.extend(
  {
    init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalIndefiniteIntegralFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessIndefiniteIntegralFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessIndefiniteIntegralFormulaNode";
			
			this._super(parentNode, pos, nte);
			this.className = "IndefiniteIntegralFormulaNode";

			this.shape = this.addShapeNode();
			this.expression = null;
			this.dSymbol = null;
			this.differencial = null;
			
			this.render();
		},

		insertChildNode : function(childNode, pos)
		{
			this._super(childNode, pos);
			
			switch (pos)
			{
			case 1:
				this.expression = this.childNodes.get(1);
				break;
			case 2:
				this.differencial = this.childNodes.get(2);
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

			if (this.expression)
				this.expression.setLevel(level);
			if (this.differencial)
				this.differencial.setLevel(level);
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);

			if (this.shape && this.expression && this.dSymbol && this.differencial)
			{
				var i = Math.max(this.expression.baseline, Math.max(this.differencial.baseline, this.dSymbol.baseline));
				var cy = i + this.expression.clientRect.height * 2 / 3;
				if (i > cy / 2)
					cy = 2 * i;
				if (this.expression.clientRect.height - i > cy / 2)
					cy = (this.expression.clientRect.height - i) * 2;
				if (this.differencial.clientRect.height - i > cy / 2)
					cy = (this.differencial.clientRect.height - i) * 2;
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

				if (this.shape.clientRect.height / 2 > i)
				{
					this.shape.move(0, 0);
					this.expression.move(this.shape.clientRect.width * 12 / 10, this.shape.clientRect.height / 2 - this.expression.baseline);
					this.dSymbol.move(this.shape.clientRect.width * 12 / 10 + this.expression.clientRect.width + this.dSymbol.clientRect.height / 5, 
						this.shape.clientRect.height / 2 - this.dSymbol.baseline);
					this.differencial.move(this.shape.clientRect.width * 12 / 10 + this.expression.clientRect.width + this.dSymbol.clientRect.height / 5 + 
						this.dSymbol.clientRect.width, 
						this.shape.clientRect.height / 2 - this.differencial.baseline);
				}
				else
				{
					this.shape.move(0, 0);
					this.expression.move(this.shape.clientRect.width * 12 / 10, this.shape.clientRect.height / 2 - this.expression.baseline);
					this.dSymbol.move(this.shape.clientRect.width * 12 / 10 + this.expression.clientRect.width + this.dSymbol.clientRect.height / 5, 
						this.shape.clientRect.height / 2 - this.dSymbol.baseline);
					this.differencial.move(this.shape.clientRect.width * 12 / 10 + this.expression.clientRect.width + this.dSymbol.clientRect.height / 5 + 
						this.dSymbol.clientRect.width, 
						this.shape.clientRect.height / 2 - this.differencial.baseline);
				}
			}
			
			this.updateClientRect();
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.shape)
				this.baseline = this.shape.clientRect.height / 2;
		},

		createChildNode : function(nodeClassType, pos)
		{
			//the child nodes have already been created
			switch (pos)
			{
			case 0:
				this.expression = new nodeClassType(this, 1, this.nte);
				return this.expression;
			case 1:
				if (!this.dSymbol)
				{
					this.dSymbol = this.createTextNode(2, false);
					this.dSymbol.setText("d");
				}
				this.differencial = new nodeClassType(this, 3, this.nte);
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
			var resNode = new IndefiniteIntegralFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
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
