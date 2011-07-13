var ModulusFormulaNode = BracketsFormulaNode.extend(
	{
		init : function(parentNode, pos, nte, element, params)
		{
			this._super(parentNode, pos, nte, element, params);
			this.className = "ModulusFormulaNode";
		},
		
		remake : function()
		{
			this.childNodes.forEach("remake", []);
			
			if (this.nested && this.leftShape && this.rightShape)
			{
				this.leftShape.clearShapes();
				this.rightShape.clearShapes();
				
				var cx = Math.round(this.nested.clientRect.width / 100);
				if (cx < 1)
					cx = 1;
				var cy = Math.round(this.nested.clientRect.height * 1.2);
				var offset = this.nte.theme.getNodeProperty("ModulusFormulaNode", this.level, "offset");
				
				this.clientRect.setRectEmpty();
				
				if (this.left)
				{
					this.leftShape.addFillRect(0, 0, cx, cy, "black");

					this.leftShape.boundingRect.setRect(this.leftShape.boundingRect.left, this.leftShape.boundingRect.top, cx, cy);
					this.leftShape.clientRect.setRect(0, 0, cx, cy);
					this.clientRect.setRect(0, 0, cx + this.nested.clientRect.width + offset, cy);

					this.nested.move(cx + offset, 0);
				}
				else
					this.nested.move(0, 0);
				
				if (this.right)
				{
					this.rightShape.addFillRect(0, 0, cx, cy, "black");
					this.rightShape.move(cx + offset * 2 + this.nested.clientRect.width, 0);

					this.rightShape.boundingRect.setRect(this.rightShape.boundingRect.left, this.rightShape.boundingRect.top, cx, cy);
					this.rightShape.clientRect.setRect(0, 0, cx, cy);
					this.clientRect.setRect(0, 0, this.clientRect.width + cx + offset * 2, cy);
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

		updateClientRect : function()
		{
			this._super();
			this.clientRect.setRect(0, 0, this.clientRect.width + 2, this.clientRect.height);
		},

		//caret functions

		renderCaret : function(selectedNode, range)
		{
			var r = new Rectangle();
			this.getPosBounds(this.caret.currentState.getSelectionStart(), r);
			if (this.groupNode.boundingRect.height > Math.round(r.bottom) + 3)
				r.setRect(r.left - 4, r.top, r.width == 1 ? 1 : Math.round(r.width) + 4, Math.floor(r.height) + 3);
			else
				r.setRect(r.left - 4, r.top, r.width == 1 ? 1 : Math.round(r.width) + 4, Math.floor(r.height));

			this.caret.renderFormulaCaret(r, this.groupNode);
		},

		//editing
		
		dublicate : function(parent)
		{
			var resNode = new ModulusFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			resNode.left = this.left;
			resNode.right = this.right;
			this.nested.dublicate(resNode);
			
			resNode.groupNode = this.groupNode;
			
			return resNode;
		}, 

		//tool functions

		getPosBounds : function(pos, posRect)
		{
			this._super(pos, posRect);
			if (pos == 3)
				posRect.offsetRect(2, 0);
			else if (posRect.width <= 1)
				posRect.setSize(2, posRect.height);
		},

		//test functions
		
		toTex : function()
		{
			return "|" + this.nested.toTex() + "|";
		}
	}
	);
