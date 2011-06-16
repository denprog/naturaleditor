var IterateFormulaNode = CompoundFormulaNode.extend(
  {
    init: function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			this._super(parentNode, pos, nte);
			
			this.shape = this.addShapeNode();
			this.variable = null;
			this.limit = null;
			this.expression = null;
			
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
				this.variable = this.childNodes.get(0);
				break;
			case 1:
				this.shape = this.childNodes.get(1);
				break;
			case 2:
				this.limit = this.childNodes.get(2);
				break;
			case 3:
				this.expression = this.childNodes.get(3);
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

			if (this.variable)
				this.variable.setLevel(this.getLesserLevel());
			if (this.limit)
				this.limit.setLevel(this.getLesserLevel());
			if (this.expression)
				this.expression.setLevel(level);
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.shape && this.expression)
				this.baseline = this.expression.boundingRect.top + this.expression.baseline;
		},

		createChildNode : function(nodeClassType, pos)
		{
			//the child nodes have already been created
			switch (pos)
			{
			case 0:
				this.variable = new nodeClassType(this, 0, this.nte);
				return this.variable;
			case 1:
				this.limit = new nodeClassType(this, 2, this.nte);
				return this.limit;
			case 2:
				this.expression = new nodeClassType(this, 3, this.nte);
				return this.expression;
			}
			
			return null;
		},

		//editing
		
		mergeWithNextNode : function(nodeEvent, command)
		{
			return false;
		}
  }
  );
