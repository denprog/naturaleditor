/**
 * Caret in the Natural Editor
 * @class
 * @constructor
 * @param {Object} nte
 */
function Caret(nte)
{
	/**
	 * Reference to the Natural Editor
	 */
	this.nte = nte;
	this.editor = nte.editor;
	this.settings = nte.settings;
	/**
	 * Current caret state
	 */
	this.currentState = null;

//	/**
//	 * Caret's paper
//	 */
	/*
	 * Text caret
	 */
	this.caretSpan = this.editor.document.createElement("span");
	this.caretSpan.className = "caret";
	//this.span.style.position = "absolute";
	this.nte.editor.appendChild(this.caretSpan);
	//this.paper = new Paper(this.nte.drawLib, this.span);
	this.textCaretGroup = this.nte.drawLib.svg(this.caretSpan);
	
	/*
	 * Formula caret
	 */
	//this.formulaCaretGroup;
	
	/*
	 * Caret shapes
	 */
	this.shapes = new Array();
	this.formulaCaretShape = null;
	
	this.nextNode = null;

	this.visible = true;

	/**
	 * Returns the current caret state
	 * @method getState
	 */
	this.getState = function()
	{
		return this.currentState;
	};
	
	/**
	 * Changes the caret state to the passed one
	 * @method setState
	 * @param {CaretState} caretState new caret state
	 */
	this.setState = function(caretState)
	{
		this.currentState.setCaretState(caretState);
		//this.render();
	};
	
	/**
	 * Sets the caret to the node beginning
	 * @method setToNodeBegin
	 */
	this.setToNodeBegin = function(node)
	{
		this.currentState = node.getFirstPosition();
		this.render();
	};

	this.setToNodeEnd = function(node)
	{
		this.currentState = node.getLastPosition();
		this.render();
	};

	this.setToNode = function(node, pos, length)
	{
		this.currentState.setToNode(node, pos, length);
		this.render();
	};

	this.continueSelection = function(node, pos)
	{
		this.currentState.continueSelection(node, pos);
		this.render();
	};
	
	//moving
	
	/**
	 * Moves the caret to the left
	 * @method moveLeft
	 */
	this.moveLeft = function()
	{
		if (this.currentState == null)
			return false;
		
		var n = this.currentState.getNode();
		if (n.moveCaretLeft())
		{
			this.render();
			return true;
		}
		return false;
	};
	
	/**
	 * Moves the caret to the right
	 * @method moveRight
	 */
	this.moveRight = function()
	{
		if (this.currentState == null)
			return false;
		
		var n = this.currentState.getNode();
		if (n.moveCaretRight())
		{
			this.render();
			return true;
		}
		return false;
	};
	
	this.moveUp = function()
	{
		if (this.currentState == null)
			return false;
		
		var n = this.currentState.getNode();
		if (n.moveCaretUp())
		{
			this.render();
			return true;
		}
		return false;
	};
	
	this.moveDown = function()
	{
		if (this.currentState == null)
			return false;
		
		var n = this.currentState.getNode();
		if (n.moveCaretDown())
		{
			this.render();
			return true;
		}
		return false;
	};
	
	this.moveHome = function()
	{
		if (this.currentState == null)
			return false;
		
		var n = this.currentState.getNode();
		if (n.moveCaretToLineBegin())
			this.render();
		return true;
	};
	
	this.moveEnd = function()
	{
		if (this.currentState == null)
			return false;
		
		var n = this.currentState.getNode();
		if (n.moveCaretToLineEnd())
			this.render();
		return true;
	};
	
//	this.moveToPreviousWord = function()
//	{
//	};
//	
//	this.moveToNextWord = function()
//	{
//		if (this.currentState == null)
//			return false;
//		
//		var n = this.nte.getNodeById(this.currentState.parentNodeId);
//		if (n.moveCaretToNextWord())
//		{
//			this.render();
//			return true;
//		}
//		return false;
//	};
	
	this.selectLeft = function()
	{
	};
	
	this.selectRight = function()
	{
		if (this.currentState == null)
			return false;
		
		var n = this.nte.getNodeById(this.currentState.parentNodeId);
		if (n.selectRight())
		{
			this.render();
			return true;
		}
		return false;
	};

	this.getFormula = function()
	{
		var n = this.currentState.getNode();
		
		while (n)
		{
			if (n instanceof SvgFormulaNode)
				return n;
			n = n.parentNode;
		}
		
		return null;
	},

	this.setNextState = function(caretState)
	{
		var node = caretState.getNode();
		if (node.childNodes.count() > 0)
		{
			var n = node.getChildNode(caretState.getPos() == node.childNodes.count() ? node.childNodes.count() - 1 : caret.getPos());
			//var n = node.getChildNode(caretState.getPos());
			n.nextCaretPos = true;
			this.nextNode = n;
		}
		else
		{
			node.nextCaretPos = true;
			this.nextNode = node;
			this.nextNodePos = caretState.getPos();
		}
	},
	
	this.getNextState = function()
	{
		if (!this.nextNode)
			return null;
		
		if (this.nextNode instanceof TextNode)
			var res = new CaretState(this.nextNode, this.nextNodePos, 0);
		else
			var res = new CaretState(this.nextNode.parentNode, this.nextNode.parentNode.getChildPos(this.nextNode), 0);
		
		this.nextNode.nextCaretPos = false;
		this.nextNode = null;
		
		return res;
	},
	
	this.show = function()
	{
		this.visible = true;
		this.render();
	},
	
	this.hide = function()
	{
		this.visible = false;
		this.clearShapes();
	},
	
	this.move = function(x, y)
	{
		this.caretSpan.style.left = x + "px";
		this.caretSpan.style.top = y + "px";
	},

	//rendering

	this.setSize = function(width, height)
	{
		this.nte.drawLib.setSize(width, height, this.textCaretGroup);
	},
	
	/**
	 * Renders the caret in the current state
	 * @method render
	 */
	this.render = function()
	{
		//if (this.nte.isIE)
		//	var range = window.document.selection.createRange();
		//else
		//{
		var range = window.getSelection();
		range.removeAllRanges();
		//}

		if (!this.currentState || !this.visible)
			return;

		for (var i = 0; i < this.currentState.selectedNodes.length; ++i)
		{
			var s = this.currentState.selectedNodes[i];
			var node = s.getNode();
			//the node will renders the caret oneself
			if (node)
			{
				//the node will render the caret by oneself
				node.renderCaret(s, range);
				node.scrollIntoView(s.getPos());
			}
		}
	},
	
	this.timerId = 0;
	
	this.renderTextCaret = function(rect, parent, pos, length, range)
	{
		this.clearShapes();

		this.move(rect.left, rect.top);
		this.setSize(1, rect.height);
		if (this.nte.isWebKit)
			var r = this.nte.drawLib.line(0, 0, 0, rect.height, "black", this.textCaretGroup);
		else
			var r = this.nte.drawLib.line(1, 0, 1, rect.height, "black", this.textCaretGroup);
		this.addShape(r);
		var c = this.caretSpan;
		
		function interval(obj, visibility)
		{
			if (c.style.visibility != visibility)
				c.style.visibility = visibility;
			
			obj.timerId = setTimeout(
				function()
				{
					interval(obj, c.style.visibility == "hidden" ? "visible" : "hidden");
				}, 
				500
				);
		};
		
		interval(this, "visible");

		//update the selection range
		var r = this.nte.document.createRange();
		r.setStart(parent.element, pos);
		r.setEnd(parent.element, pos + length);
		range.addRange(r);
	},
	
	this.renderFormulaCaret = function(rect, parent)
	{
		this.clearShapes();

		if (this.nte.isIE)
		{
			var group = this.nte.drawLib.group(parent.element);
			this.nte.drawLib.move(rect.left, rect.top, group);
			
			//if (rect.bottom >= parent.groupNode.clientRect.height)
			//	rect.setSize(rect.width, rect.height - 1);
			this.nte.drawLib.setSize(rect.width <= 1 ? 2 : rect.width, rect.height + 1, group);
			
			if (rect.width > 1)
			{
				this.nte.drawLib.line(0, 0, 0, rect.height + 1, "black", group);
				this.nte.drawLib.line(0, rect.height + 1, rect.width, rect.height + 1, "black", group);
			}
			else
			{
				this.nte.drawLib.line(0, 0, 0, rect.height + 1, "black", group);
			}

			var s = group;
			
			this.addShape(group, parent.element);
		}
		else
		{
			var f = this.nte.drawLib.createElement("foreignObject", parent.element);
			var s = this.nte.editor.document.createElementNS("http://www.w3.org/1999/xhtml", "span");
			f.appendChild(s);
			parent.element.appendChild(f);
			
			var group = this.nte.drawLib.svg(s);
			this.nte.drawLib.move(rect.left, rect.top, f);
		
			if (this.nte.isWebKit)
			{
				if (rect.bottom >= parent.groupNode.clientRect.height)
					rect.setSize(rect.width, rect.height - 1);
				this.nte.drawLib.setSize(rect.width <= 1 ? 2 : rect.width, rect.height + 1, f);
				this.nte.drawLib.setSize(rect.width <= 1 ? 2 : rect.width, rect.height + 1, group);
			}
			else
			{
				this.nte.drawLib.setSize(rect.width <= 1 ? 2 : rect.width, rect.height + 1, f);
				this.nte.drawLib.setSize(rect.width <= 1 ? 2 : rect.width, rect.height + 1, group);
			}

			if (rect.width > 1)
			{
				this.nte.drawLib.line(1, 0, 1, rect.height, "black", group);
				this.nte.drawLib.line(1, rect.height, rect.width, rect.height, "black", group);
			}
			else
			{
				this.nte.drawLib.line(1, 0, 1, rect.height, "black", group);
			}
			
			this.addShape(f, parent.element);
		}
		
		if (this.nte.isWebKit || this.nte.isIE)
		{
			clearTimeout(this.tid);
			
			function interval(obj, visibility)
			{
				s.style.visibility = visibility;
				
				obj.timerId = setTimeout(
					function()
					{
						interval(obj, s.style.visibility == "hidden" ? "visible" : "hidden");
					}, 
					500
					);
			}; 
	
			interval(this, "visible");
		}
		else
		{
			this.nte.drawLib.animate("visibility", "visible", "hidden", "1", "indefinite", group);
		}
	},
	
	//shapes
	
	this.addShape = function(shape, group)
	{
		this.shapes.push(shape);
		if (!group)
			this.group = this.textCaretGroup;
		else
			this.group = group;
	},

	this.clearShapes = function()
	{
		clearTimeout(this.timerId);

		for (var i in this.shapes)
		{
			var shape = this.shapes[i];
			this.nte.drawLib.remove(shape, shape.parentNode);
		}
		this.shapes.length = 0;
		
		if (this.group == this.textCaretGroup)
		{
			this.nte.drawLib.remove(this.group, this.caretSpan);
			this.textCaretGroup = this.nte.drawLib.svg(this.caretSpan);
		}
	};
}
