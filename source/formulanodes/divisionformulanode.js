/**
 * Division formula node
 * @class DivisionFormulaNode
 * @constructor
 */
var DivisionFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this._super(parentNode, pos, nte);
			this.className = "DivisionFormulaNode";
			
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
				var i = this.nte.theme.getNodeProperty("DivisionFormulaNode", this.level, "sideOffset");
				var j = this.nte.theme.getNodeProperty("DivisionFormulaNode", this.level, "sideOffset");

				var w = Math.max(this.dividend.clientRect.width, this.divisor.clientRect.width);
				w += i * 2;

				this.shape.clearShapes();
				this.shape.addLine(0, 0, w, 0, "black");

				this.dividend.move((w - this.dividend.clientRect.width) / 2, 0);
				this.shape.move(0, this.dividend.clientRect.height + j);
				this.divisor.move((w - this.divisor.clientRect.width) / 2, this.dividend.clientRect.height + 2 * j + 1);
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
			r.setRect(r.left - 3, r.top - 3, r.width + 6, r.height + 6);
			
			this.caret.renderFormulaCaret(r, this.groupNode);
		}, 

		getNextPosition : function(relativeState, params)
		{
			if (!relativeState || !params || !params.upper)
				return this._super(relativeState);
			
			var res = this._super(relativeState, params);
			var n = res.getNode();
			if (!res.checkOnNode(this) && n != this.dividend && !this.dividend.isChild(n))
				return this.parentNode.getNextPosition(relativeState, params);
			
			return res;
		},

		getPreviousPosition : function(relativeState, params)
		{
			if (!relativeState || !params || !params.lower)
				return this._super(relativeState);

			var res = this._super(relativeState, params);
			if (res)
			{
				var n = res.getNode();
				if (!res.checkOnNode(this) && n != this.divisor && !this.divisor.isChild(n))
					return this.parentNode.getPreviousPosition(relativeState, params);
			}
			
			return res;
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

		doInsert : function(pos, nodeEvent, command)
		{
			return false;
		},

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			return false;
		},

		dublicate : function(parent)
		{
			var resNode = new DivisionFormulaNode(parent, this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
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
		
		toTex : function(braces)
		{
			return "{" + this.dividend.toTex(false) + "}/{" + this.divisor.toTex(false) + "}";
		}
	}
);
