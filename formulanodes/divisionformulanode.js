/**
 * Division formula node
 * @class DivisionFormulaNode
 */
var DivisionFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalDivisionFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessDivisionFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessDivisionFormulaNode";
			
			this._super(parentNode, pos, nte);
			this.className = "DivisionFormulaNode";
			
			this.addClass("normalDivisionFormulaNode");
			
			this.dividend = null;
			this.shape = this.addShapeNode();
			this.r = this.drawLib.fillRect(0, 0, 1, 1, "black", this.shape.element);
			this.divisor = null;
			
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
				this.dividend = this.childNodes.get(0);
				break;
			case 1:
				this.shape = this.childNodes.get(1);
				break;
			case 2:
				this.divisor = this.childNodes.get(2);
				break;
			}
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);
			
			if (this.dividend && this.divisor)
			{
				var w = Math.max(this.dividend.clientRect.width, this.divisor.clientRect.width);
				w = Math.round(w + w / 5);
				var h = this.dividend.clientRect.height + this.divisor.clientRect.height;
				
				this.divisor.move((w - this.divisor.clientRect.width) / 2, this.dividend.clientRect.height + h / 10);
				
				this.shape.clearShapes();
				if (h / 100 > 1)
				{
					//this.shape.addFillRect(0, Math.round(this.dividend.clientRect.height + h / 20), w, Math.round(h / 100), "black");
					this.shape.addFillRect(0, 0, w, Math.round(h / 100), "black");
				}
				else
				{
					//this.shape.addLine(0, Math.round(this.dividend.clientRect.height + h / 20), w, 
					//	Math.round(this.dividend.clientRect.height + h / 20), "black");
					this.shape.addLine(0, 0, w, 0, "black");
				}
				
				this.shape.move(0, this.dividend.clientRect.height + h / 20);

				this.dividend.move(Math.round((w - this.dividend.clientRect.width) / 2), 0);
			}
			
			this.updateClientRect();
		},

		update : function()
		{
			this.childNodes.forEach("update", []);

			if (this.dividend && this.divisor)
			{
				var h = this.dividend.clientRect.height + this.divisor.clientRect.height;
				this.baseline = Math.round(this.dividend.clientRect.height + h / 10 + (this.shape.clientRect.height == 0 ? 1 : this.shape.clientRect.height));
			}
		},

		createChildNode : function(nodeClassType, pos)
		{
			//the child nodes have already been created
			switch (pos)
			{
			case 0:
				this.dividend = new nodeClassType(this, 0, this.nte);
				return this.dividend;
			case 1:
				this.divisor = new nodeClassType(this, 2, this.nte);
				return this.divisor;
			case 2:
				this.divisor = new nodeClassType(this, 2, this.nte);
				return this.divisor;
			}
			
			return null;
		},

		//caret functions
		
		renderCaret : function(selectedNode, range)
		{
			if (this.caret.currentState.getPos() != 1)
			{
				this._super();
				return;
			}
			
			var r = this.tempRect;
			if (this.caret.currentState.beginCaretPos)
				this.getPosBounds(this.caret.currentState.getSelectionStart(), r);
			else
				this.getPosBounds(this.caret.currentState.getSelectionEnd(), r);
			
			this.caret.paper.clearShapes();
			
			r.setRect(r.left - 3, r.top - 3, r.width + 6, r.height + 6);
			this.caret.paper.move(r.left, r.top);
			this.caret.paper.setSize(r.width, r.height);

			if (this.caret.currentState.beginCaretPos)
				this.caret.paper.line(0, 0, 0, r.height, "black");
			else
				this.caret.paper.line(r.right, 0, r.right, r.height, "black");
			var r = this.caret.paper.line(0, r.height, r.width, r.height, "black");
			this.drawLib.animate("visibility", "visible", "hidden", "1", "indefinite", r.parentNode);
		}, 

		getUpperPosition : function(relativeState)
		{
			var n = relativeState.getNode();
			
			if (this.isChild(n))
			{
				var i = this.getFirstLevelChildPos(n);
				switch (i)
				{
				case 0:
					return this.parentNode.getUpperPosition(relativeState);
				case 1:
					//move to the dividend
					return this.childNodes.get(0).getFirstPosition();
				case 2:
					//move to the shape
					return new CaretState(this, 1);
				}
			}
			else if (n == this)
			{
				//may be only on the shape
				return this.childNodes.get(0).getFirstPosition();
			}
			
			return this._super(relativeState);
		},
		
		getLowerPosition : function(relativeState)
		{
			var n = relativeState.getNode();
			
			if (this.isChild(n))
			{
				var i = this.getFirstLevelChildPos(n);
				switch (i)
				{
				case 0:
					//move to the shape
					return new CaretState(this, 1);
				case 1:
					//move to the divisor
					return this.childNodes.get(2).getFirstPosition();
				case 2:
					return this.parentNode.getLowerPosition(relativeState);
				}
			}
			else if (n == this)
			{
				//may be only on the shape
				return this.childNodes.get(2).getFirstPosition();
			}
			
			return this._super(relativeState);
		},

		//command functions
		
		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			return false;
		},

		dublicate : function(parent)
		{
			var resNode = new DivisionFormulaNode(parent, 
				this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.dividend.dublicate(resNode);
			this.divisor.dublicate(resNode);
			
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
			return this.dividend.toTex() + "/" + this.divisor.toTex();
		}
	}
);
