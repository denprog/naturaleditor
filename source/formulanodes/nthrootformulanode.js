/**
 * @constructor
 * @param {function(this:String, FormulaNode, int, NaturalEditor)}
 */
var NthRootFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this._super(parentNode, pos, nte);
			this.className = "NthRootFormulaNode";
			
			this.degree = null;
			this.shape = this.addShapeNode();
			this.radicand = null;
		},
		
		insertChildNode : function(childNode, pos)
		{
			if (pos == 1)
				return;
			
			this._super(childNode, pos);
			
			switch (pos)
			{
			case 0:
				this.degree = this.childNodes.get(0);
				break;
			case 1:
				this.shape = this.childNodes.get(0);
				break;
			case 2:
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
				
				var p1 = this.degree.baseline;
				var p2 = this.degree.clientRect.height - p1;
				var b = (p1 > p2 ? p1 * 2 : p2 * 2) + 8;
				var cx = Math.round(this.radicand.clientRect.height * 5 / 11);
				this.offset = this.radicand.clientRect.height / 5;
				var cy = Math.max(this.radicand.clientRect.height + this.offset * 2, this.degree.clientRect.height);

				//the root's shape
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
				this.clientRect.setRect(0, 0, this.degree.clientRect.width + cx * 1.32 + this.radicand.clientRect.width, cy);
				
				//align the child nodes
				this.degree.move(0, this.clientRect.height / 2 - this.degree.baseline);
				this.shape.move(this.degree.clientRect.width + this.groupNode.kerning, 0);
				this.radicand.move(this.groupNode.kerning + this.degree.clientRect.width + cx * 1.3, this.offset);
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

			for (var i = 0; i < this.childNodes.count(); ++i)
				this.childNodes.get(i).setLevel(level);
			if (this.childNodes.count() > 0)
				this.childNodes.get(0).setLevel(this.getLesserLevel());
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
				this.degree = new nodeClassType(this, 0, this.nte);
				return this.degree;
			case 1:
			case 2:
				this.radicand = new nodeClassType(this, 2, this.nte);
				return this.radicand;
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
		
		dublicate : function(parent)
		{
			var resNode = new NthRootFormulaNode(parent, 
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
		
		toTex : function(braces)
		{
			return "sqrt[" + this.degree.toTex(false) + "]{" + this.radicand.toTex(false) + "}";
		}
	}
	);
