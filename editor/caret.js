﻿/**
 * Caret in the Natural Editor
 * @class
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

	/**
	 * Caret's paper
	 */
	this.span = this.editor.document.createElement("span");
	this.span.className = "caret";
	//this.span.style.position = "absolute";
	this.nte.editor.appendChild(this.span);
	this.paper = new Paper(this.nte.drawLib, this.span);

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
		this.render();
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
	
	this.show = function()
	{
		this.visible = true;
		this.render();
	},
	
	this.hide = function()
	{
		this.visible = false;
		this.paper.clearShapes();
		this.render();
	},
	
	/**
	 * Renders the caret in the current state
	 * @method render
	 */
	this.render = function()
	{
		var range = window.getSelection();
		range.removeAllRanges();

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
			}
		}
	};
}