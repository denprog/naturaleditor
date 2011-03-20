/**
 * Exponentiation formula node.
 * @class ExponentiationFormulaNode
 */
var ExponentiationFormulaNode = CompoundFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalExponentationFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessExponentationFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessExponentationFormulaNode";

			this._super(parentNode, pos, nte);
			this.className = "ExponentiationFormulaNode";

			this.base = null;
			this.shape = this.addShapeNode();
			this.r = this.drawLib.fillRect(0, 0, 1, 1, "white", this.shape.element);
			this.exponent = null;

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
				this.exponent = this.childNodes.get(2);
				break;
			}
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);
			
			if (this.base && this.exponent)
			{
				this.base.move(0, this.exponent.clientRect.height * 2 / 3);
				
				this.shape.clearShapes();
				this.shape.addFillRect(0, 0, 3, this.base.boundingRect.bottom, "white");
				this.shape.move(this.base.clientRect.width + 1, 0);
				
				this.drawLib.setSize(1, this.base.boundingRect.bottom, this.r);
				this.shape.updateClientRect();
				this.exponent.move(this.base.clientRect.right + this.shape.clientRect.right + 2, 0);
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

			for (var i = 0; i < this.childNodes.count() - 1; ++i)
				this.childNodes.get(i).setLevel(level);
			if (this.childNodes.count() > 0)
				this.childNodes.get(i).setLevel(this.getLesserLevel());
		},

		update : function()
		{
			this.childNodes.forEach("update", []);
			if (this.exponent)
			{
				//update the baseline
				this.baseline = this.base.baseline + this.exponent.clientRect.height * 2 / 3;
				//this.baseline = this.base.baseline;
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
				this.exponent = new nodeClassType(this, 2, this.nte);
				return this.exponent;
			case 2:
				this.exponent = new nodeClassType(this, 2, this.nte);
				return this.exponent;
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
			
			var r = new Rect();
			if (this.caret.currentState.beginCaretPos)
				this.getPosBounds(this.caret.currentState.getSelectionStart(), r);
			else
				this.getPosBounds(this.caret.currentState.getSelectionEnd(), r);
			
			this.caret.paper.clearShapes();

			r.setRect(r.left - 2, r.top, r.width + 2, r.height);
			
			this.caret.paper.move(r.left, r.top);
			this.caret.paper.setSize(r.width + 1, r.height + 1);

			if (this.caret.currentState.beginCaretPos)
				this.caret.paper.line(0, 0, 0, r.height, "black");
			else
				this.caret.paper.line(r.right, 0, r.right, r.height, "black");
			var t = this.caret.paper.line(0, r.height + 1, r.width, r.height + 1, "black");
			this.drawLib.animate("visibility", "visible", "hidden", "1", "indefinite", t.parentNode);

//			r.setRect(r.left - 1, r.top, r.width + 2, r.height);
//			this.caret.paper.move(r.left, r.top);
//			this.caret.paper.setSize(r.width, r.height);
//
//			if (this.caret.currentState.beginCaretPos)
//				this.caret.paper.line(0, 0, 0, r.height, "black");
//			else
//				this.caret.paper.line(r.right, 0, r.right, r.height, "black");
//			this.caret.paper.line(0, r.height, r.width, r.height, "black");
		}, 

		//command functions
		
		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			return false;
		},
		
		//editing
		
		dublicate : function(parent)
		{
			var resNode = new ExponentiationFormulaNode(parent, 
				this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.base.dublicate(resNode);
			this.exponent.dublicate(resNode);
			
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
			return this.base.toTex() + "^" + this.exponent.toTex();
		}
	}
);
