/**
 * The "svg" tag node.
 * @class SvgFormulaNode
 * @constructor
 */
var SvgFormulaNode = FormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = parentNode.drawLib;

			var el = this.drawLib.svg(parentNode.element);
			this._super("", el, parentNode, pos, nte);

			this.groupNode = this;
			this.addClass("formula");

			this.leftOffset = 5;
			this.rightOffset = 5;
			this.kerning = 5;
			
			this.className = "SvgFormulaNode";
		}, 
		
		remake : function()
		{
			var x = this.leftOffset, y = 0;
			
			for (var i = 0; i < this.childNodes.count(); ++i)
				this.childNodes.get(i).setLevel(NodeLevel.NORMAL);
			this.childNodes.forEach("remake", []);

			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				n.move(x, y);
				x += n.clientRect.width + this.kerning;
			}
			
			this.update();
			this.updateClientRect();
			
			if (this.clientRect.width == 0 || this.clientRect.height == 0)
				this.drawLib.setSize(1, 1, this.element);
			else
				this.drawLib.setSize(this.clientRect.width + this.rightOffset, this.clientRect.height, this.element);

			this.updateBoundingRect();

			if (this.baseline != 0)
				this.element.style.verticalAlign = -(this.clientRect.height - this.baseline) + "px";
			
			if (this.nte.isIE)
			{
				//refresh DOM
				var n = this.parentNode.childNodes.get(this.parentNode.getChildPos(this) + 1);
				if (n)
					n.getRelativePosBounds(0, this.tempRect);
			}
		}, 
		
		updateBoundingRect : function()
		{
			if (this.nte.isWebKit)
			{
				this.boundingRect.setRect(this.element.offsetLeft, this.element.offsetTop, this.element.offsetWidth, this.element.offsetHeight);
			}
			else
			{
				this.getNodeBounds(this.tempRect);
				var r = this.element.getBoundingClientRect();
				var b = this.nte.editor.getBoundingClientRect();
				
				this.boundingRect.setRect(r.left - this.element.x.baseVal.value - b.left - this.leftOffset, 
				//this.boundingRect.setRect(r.left - this.element.x.baseVal.value - b.left, 
				//this.boundingRect.setRect(this.tempRect.left - this.element.x.baseVal.value, 
					this.tempRect.top - this.element.y.baseVal.value, 
					this.element.width.baseVal.value, 
					this.element.height.baseVal.value);
			}
		}, 

		moveCaretToLineBegin : function()
		{
			var p = this.getFirstPosition();
			if (this.caret.currentState.isEqual(p))
				return this.parentNode.moveCaretToLineBegin();
			
			var n = p.getNode();
			n.scrollIntoView(p.getSelectionStart());
			this.caret.setState(p);
			
			return true;
		},
		
		moveCaretToLineEnd : function()
		{
			var p = this.getLastPosition();
			if (this.caret.currentState.isEqual(p))
				return this.parentNode.moveCaretToLineEnd();
			
			var n = p.getNode();
			n.scrollIntoView(p.getSelectionStart());
			this.caret.setState(p);
			
			return true;
		},

		/**
		 * Returns the first caret position of the node.
		 * @method getFirstPosition
		 */
		getFirstPosition : function()
		{
			if (this.childNodes.getFirst() instanceof CompoundFormulaNode)
				return new CaretState(this, 0);
			var t = this.childNodes.getFirst().getFirstPosition();
			if (t)
				return t;
			return new CaretState(this, 0);
		}, 
		
		/**
		 * Returns the last caret position of the node.
		 * @method getLastPosition
		 */
		getLastPosition : function()
		{
			if (this.childNodes.getLast() instanceof EmptyFormulaNode)
				return new CaretState(this, this.childNodes.count() - 1);
			if (this.childNodes.getLast() instanceof CompoundFormulaNode)
				return new CaretState(this, this.childNodes.count());
			var res = this.childNodes.getLast().getLastPosition();
			if (!res)
				res = new CaretState(this, this.childNodes.count());
			return res;
		},
		
		getNextPosition : function(relativeState, params)
		{
			var res = null;

			if (!relativeState)
			{
				res = this.getFirstPosition();
			}
			else
			{
				var node = relativeState.getNode();
				if (!relativeState.checkAtLast())
				{
					if (node == this)
					{
						var i = relativeState.getPos();
						//i == this.childNodes.count() means the position is at the end of the collection
						var n = this.childNodes.get(i == this.childNodes.count() ? i - 1 : i);
						res = n.getNextPosition(relativeState, params);
						if (res)
							return res;
						if (i == this.childNodes.count() - 1 && !(n instanceof EmptyFormulaNode))
							return new CaretState(this, i + 1);
					}
					else
						var i = this.getFirstLevelChildPos(node);
				}
				else if (node == this)
					return this.parentNode.getNextPosition(relativeState, params);
				else
					var i = this.getFirstLevelChildPos(node);
				
				if (i + 1 < this.childNodes.count())
				{
					var n = this.childNodes.get(i + 1);
					res = n.getNextPosition(relativeState, params);
					if (!res && n.canSetCaret())
						res = new CaretState(this, i + 1);
				}
				else if (i == this.childNodes.count() - 1 && !relativeState.isEqual(this.getLastPosition()))
					return new CaretState(this, i + 1);
				
				if (!res && this.parentNode)
					res = this.parentNode.getNextPosition(relativeState, params);
			}
			
			return res;
		}, 
		
		getPreviousPosition : function(relativeState, params)
		{
			var res = null;
			
			if (!relativeState)
			{
				res = this.getLastPosition();
			}
			else
			{
				var node = relativeState.getNode();
				if (node == this)
				{
					var i = relativeState.getPos();
					//i == this.childNodes.count() means the position is at the end of the collection
					var n = this.childNodes.get(i == this.childNodes.count() ? i - 1 : i);
					res = n.getPreviousPosition(relativeState, params);
					if (res)
						return res;
				}
				else
					var i = this.getFirstLevelChildPos(node);

				for (var pos = i - 1; pos >= 0; --pos)
				{
					var n = this.childNodes.get(pos);
					res = n.getPreviousPosition(null, params);
					if (res)
						break;
				}
				
				if (!res && this.parentNode)
					res = this.parentNode.getPreviousPosition(relativeState, params);
			}
			
			return res;
		},

		//command functions
		
		mergeWithNextNode : function(nodeEvent, command)
		{
			return false;
		},

		//tool functions
		
		getNodeBounds : function(posRect)
		{
			var rect = this.element.getBoundingClientRect();
			var r = this.nte.editor.getBoundingClientRect();
			
			posRect.setRect(Math.round(rect.left + this.nte.editor.scrollLeft - r.left), 
				Math.round(rect.top + this.nte.editor.scrollTop - r.top), 
				Math.round(rect.width), 
				Math.round(rect.height));
		}, 
		
		//test functions
		
		toTex : function(braces)
		{
			var tex = "$";
			tex += this.childNodes.toTex(braces);
			tex += "$";
			return tex;
		}
	}
);
