var SubscriptFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalSubscriptFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessSubscriptFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessSubscriptFormulaNode";

			this._super(parentNode, pos, nte);
			this.className = "SubscriptFormulaNode";

			this.base = null;
			this.shape = this.addShapeNode();
			this.r = this.drawLib.fillRect(0, 0, 1, 1, "white", this.shape.element);
			this.subscript = null;

			//updating soon
			this.level = 0;
			if (this.groupNode)
				this.groupNode.remake();
		}, 
		
		insertChildNode : function(childNode, pos)
		{
			if (!this.shape)
			{
				this._super(childNode, pos);
				this.shape = this.childNodes.get(1);
				return;
			}
			
			if (pos == 1)
				return;

			this._super(childNode, pos);
			
			switch (pos)
			{
			case 0:
				this.base = this.childNodes.get(0);
				break;
			case 1:
				this.shape = this.childNodes.get(1);
				break;
			case 2:
				this.subscript = this.childNodes.get(2);
				break;
			}
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);
			
			if (this.base && this.subscript)
			{
				var i = this.nte.theme.getNodeProperty("SubscriptFormulaNode", this.level, "subscriptOffset");

				this.shape.clearShapes();
				this.shape.addFillRect(0, 0, 3, this.base.clientRect.height + i + this.subscript.clientRect.height, "white");
				this.shape.move(this.base.clientRect.width + 1, 0);
				
				this.drawLib.setSize(1, this.base.clientRect.height + i + this.subscript.clientRect.height, this.r);
				this.shape.updateClientRect();
				this.subscript.move(this.base.clientRect.right + this.shape.clientRect.right + 2, this.base.clientRect.height + i);
			}
			
			this.updateClientRect();
			this.update();
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

			for (var i = 0; i < this.childNodes.count() - 1; ++i)
				this.childNodes.get(i).setLevel(level);
			if (this.childNodes.count() > 0)
				this.childNodes.get(i).setLevel(this.getLesserLevel());
		},

		update : function()
		{
			this.childNodes.forEach("update", []);
			if (this.subscript)
			{
				//update the baseline
				this.baseline = this.base.baseline;
			}
		}, 

		/**
		 * Creates a child node.
		 * @method createChildNode
		 */
		createChildNode : function(nodeClassType, pos)
		{
			//the child nodes have already been created
			switch (pos)
			{
			case 0:
				this.base = new nodeClassType(this, 0, this.nte);
				return this.base;
			case 1:
				this.subscript = new nodeClassType(this, 2, this.nte);
				return this.subscript;
			case 2:
				this.subscript = new nodeClassType(this, 2, this.nte);
				return this.subscript;
			}
			
			return null;
		},

		//caret functions

		//command functions
		
		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			return false;
		},
		
		//editing
		
		dublicate : function(parent)
		{
			var resNode = new SubscriptFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.base.dublicate(resNode);
			this.subscript.dublicate(resNode);
			
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
			return this.base.toTex(braces) + "_" + this.subscript.toTex(braces);
		}
	}
);
