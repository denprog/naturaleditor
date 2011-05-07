/**
 * $Id: htmlnode.js
 * @author Den
 * @copyright Copyright @ 2010, Den, All rights reserved
 */

function NodeEvent(params)
{
	for (var p in params)
		this[p] = params[p];
}

var NodeLevel = 
{
	NORMAL : 1, 
	LESS : 2, 
	STILL_LESS : 3
};

/**
 * Base class for html nodes
 * @class
 * @constructor
 * @extends Class
 * @param {HtmlNodeType} nodeType type of the node
 * @param {} element DOM element
 * @param {} parentNode parent node
 * @param {} nodePos node insert position
 * @param {} textPos text insert position
 * @param {} nte reference to nte
 */
var HtmlNode = Class.extend(
	/**
	 * @lends HtmlNode
	 */
	{
		init : function(nodeType, element, parentNode, pos, nte)
		{
			/**
			 * parent node
			 * @public
			 */
			this.parentNode = parentNode;
			/**
			 * reference to the Natural Editor object
			 * @public
			 */
			this.nte = nte;
			/**
			 * node id for tests
			 * @public
			 */
			this.id = this.nte.getNextId();
			/**
			 * event handlers array
			 * @public
			 */
			this.eventHandlers = {};
			/**
			 * keyboard shortcuts
			 * @public
			 */
			this.shortcuts = new Array();
			/**
			 * editor's document
			 * @public
			 */
			this.document = this.nte.document;
			/**
			 * drawing library
			 * @public
			 */
			this.drawLib = nte.drawLib;

			this.level = NodeLevel.NORMAL;

			this.tempRect = new Rectangle();
			
			if (element)	
				this.element = element;
			else
				this.element = this.document.createElementNS("http://www.w3.org/1999/xhtml", nodeType);
			
			this.element.htmlNode = this;
			
			this.eventsHandler = this.nte.eventsHandler;
			this.commandManager = this.nte.commandManager;
		
			this.caret = this.nte.caret;
			this.caretState = null;
			this.nextCaretPos = false;
			
			this.childNodes = new NodesCollection(1);

			if (parentNode)
				parentNode.insertChildNode(this, pos);
		}, 
		
		destroy : function()
		{
			this.childNodes.reset();
			if (this.element.parentNode)
				this.element.parentNode.removeChild(this.element);
		}, 

		/**
		 * Adds a child node in the children nodes collection
		 * @method addChildNode
		 * @inner
		 * @public
		 * @param {HtmlNode} childNode child node
		 */		
		addChildNode : function(childNode)
		{
			this.childNodes.add(childNode);
			childNode.parentNode = this;
			this.element.appendChild(childNode.element);
			
			if (childNode.nextCaretPos)
				this.caret.nextNode = childNode;
		}, 
		
		/**
		 * Inserts a child node in the children nodes collection
		 * @method insertChildNode
		 * @public
		 * @param {HtmlNode} childNode child node
		 * @param {int} cPos continuous position
		 */
		insertChildNode : function(childNode, pos, caretState)
		{
			if (caretState)
			{
				var n = caretState.getNode();
				var p = caretState.getPos();
				if (n.childNodes.count() > 0)
				{
					if (p == n.childNodes.count())
						n.childNodes.get(p - 1).caretState = caretState;
					else
						n.childNodes.get(p).caretState = caretState;
				}
				else
					n.caretState = caretState;
			}
			
			childNode.parentNode = this;

			if (this.childNodes.count() == pos)
				this.element.appendChild(childNode.element);
			else
				this.element.insertBefore(childNode.element, this.childNodes.get(pos).element);
			
			this.childNodes.insert(pos, childNode);

			if (childNode.nextCaretPos)
				this.caret.nextNode = childNode;

			this.updateCaretState();
			this.clearCaretState();
		}, 

		/**
		 * Adds a text node to the HtmlNode's element
		 * @method addTextNode
		 * @param {Object} textNode
		 */		
		addTextNode : function(textNode)
		{
			return new TextNode(textNode, this, this.childNodes.count(), this.nte);
		}, 

		/**
		 * Removes a child node.
		 * @method removeChildNode
		 * @param {int} pos
		 */
		removeChildNode : function(pos)
		{
			var n = this.childNodes.get(pos);
			
			if (n.nextCaretPos && this.caret.nextNode == n)
				this.caret.nextNode = null;

			n.destroy();
			this.childNodes.removeAt(pos);
			
			this.updateCaretState();
			this.clearCaretState();
			
			return true;
		}, 
		
		removeChildNodeFromCollection : function(pos)
		{
			this.childNodes.removeAt(pos);
		}, 

		updateCaretState : function()
		{
			var c = this.caretState;
			if (c)
			{
				if (this.childNodes.count() > 0)
					c.setToNode(this, c.getPos(), c.getSelectionLength());
				else if (this instanceof TextNode)
					c.setToNode(this, c.getPos(), c.getSelectionLength());
				else
					c.setToNode(this.parentNode, this.parentNode.getChildPos(this), c.getSelectionLength());
			}

			c = this.selectedNode;
			if (c)
			{
				if (this.childNodes.count() > 0 || this instanceof TextNode)
					c.setToNode(this, c.getPos(), c.length);
				else
					c.setToNode(this.parentNode, this.parentNode.getChildPos(this), c.length);
			}
			
			for (var i = 0; i < this.childNodes.count(); ++i)
				this.childNodes.get(i).updateCaretState();
		},
		
		clearCaretState : function()
		{
			//this.caretState = null;
			delete this.caretState;
			//delete this.selectedNode;
			
			for (var i = 0; i < this.childNodes.count(); ++i)
				this.childNodes.get(i).clearCaretState();
		},
		
		hasClass : function(name)
		{
			var s = this.element.className;
			if (s.indexOf)
				return s.indexOf(name) != -1;
			return s.indexOf(name) != -1;
		},
		
		addClass : function(name)
		{
			if (!this.hasClass(name))
				this.element.className += " " + name;
		},
		
		removeClass : function(name)
		{
			var s = this.element.className;
			s = s.replace(new RegExp("\\b" + name + "\\b"), "");
			this.element.className = s;
		},
		
		hasTag : function(tag)
		{
			var n = this;
			while (n)
			{
				if (n.element.tagName && n.element.tagName.toLowerCase() == tag)
					return true;
				n = n.parentNode;
			}
			return false;
		},
		
		setLevel : function(level)
		{
			this.level = level;
			
			for (var i = 0; i < this.childNodes.count(); ++i)
				this.childNodes.get(i).setLevel(level);
		},

		getGreaterLevel : function()
		{
			if (this.level != NodeLevel.NORMAL)
				return this.level - 1;
			return this.level;
		},
		
		getLesserLevel : function()
		{
			if (this.level != NodeLevel.STILL_LESS)
				return this.level + 1;
			return this.level;
		},

		moveChildNode : function(childNode, pos)
		{
			var p = childNode.parentNode.getChildPos(childNode);
			childNode.parentNode.element.removeChild(childNode.element);
			childNode.parentNode.removeChildNodeFromCollection(p);
			
			this.insertChildNode(childNode, pos);
		}, 

		mergeNode : function(caretState)
		{
			var pos = this.parentNode.getChildPos(this);
			var node = this.parentNode.childNodes.get(pos + 1);
			var n = caretState.getNode();
			n.caretState = caretState;
			
			if (n == node)
				var s = c.findSelectedNode(node);
			
			if (n == this.parentNode)
			{
				if (caretState.isNodeSelected(node))
				{
					caretState.removeInnerSelectedNode(node);
					var b2 = true;
				}
				if (caretState.isNodeSelected(this))
				{
					caretState.removeInnerSelectedNode(this);
					var b1 = true;
				}
			}
			
			if (this.isEmpty())
				this.childNodes.reset();
			if (node.isEmpty())
				node.childNodes.reset();
			
			var len = this.childNodes.count();
			for (var i = 0; !node.isEmpty(); ++i)
				this.moveChildNode(node.childNodes.get(0), len + i);
			this.parentNode.removeChildNode(pos + 1);

			if (s)
				caretState.replaceSelectedNode(node, this, len + s.getPos(), s.length);

			if (b1)
				caretState.addSelectedNode(new SelectedNode(caretState, this, 0, len));
			if (b2)
				caretState.addSelectedNode(new SelectedNode(caretState, this, len, 1));
		},

		/**
		 * Creates a child node. Default implementation.
		 * @method createChildNode
		 */
		createChildNode : function(nodeClassType, pos, element)
		{
			if (nodeClassType == window["TextNode"])
				return new TextNode(null, this, pos, this.nte);
			return new nodeClassType(this, pos, this.nte, element);
		}, 
		
		getChildNode : function(pos)
		{
			return this.childNodes.get(pos);
		}, 

		getLength : function()
		{
			return this.childNodes.count();
		}, 
		
		getPositionsCount : function()
		{
			return this.childNodes.count();
		}, 

		isFirstChild : function(node)
		{
			return this.childNodes.getPos(node) == 0;
		},
		
		isEmpty : function()
		{
			if (this.childNodes.count() == 0)
				return true;
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				if (!this.childNodes.get(i).isEmpty())
					return false;
			}
			
			return true;
		}, 

		addStyle : function(style)
		{
			for (var name in style)
				this.element.style[name] = style[name];
		}, 
		
		checkStyle : function(style)
		{
			for (var name in style)
				if (this.element.style[name] != style[name])
					return false;
			return true;
		}, 

		getChildPos : function(node)
		{
			return this.childNodes.getPos(node);
		}, 
		
		getPosInParentCollection : function()
		{
			return this.parentNode.childNodes.getPos(this.id);
		}, 

		getFirstLevelChildPos : function(node)
		{
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				if (n == node || n.getFirstLevelChildPos(node) != -1)
					return i;
			}
			
			return -1;
		}, 

		getChildNodeElement : function(pos)
		{
			if (this.element.children)
				return this.element.children[pos];
			
			for (var i = 0, j = 0; i < this.element.childNodes.length; ++i)
			{
				var n = this.element.childNodes[i];
				if (n.nodeType == 1)
				{
					if (pos == j)
						return n;
					++j;
				}
			}
			
			return null;
		}, 

		isChild : function(node)
		{
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				if (n == node)
					return true;
				if (n.isChild(node))
					return true;
			}
			
			return false;
		}, 

		getCommonParent : function(node)
		{
			if (this.isChild(node))
				return this;
			
			var p = this.parentNode;
			while (p)
			{
				if (p.isChild(node))
					return p;
				p = p.parentNode;
			}
			
			return null;
		},
		
		/**
		 * Scrolls the editor to the symbol position of the node
		 * @method scrollIntoView
		 * @param pos
		 */
		scrollIntoView : function(pos)
		{
			var cr = this.nte.clientRect;
			var r = this.tempRect;
			
			if (typeof(pos) != "undefined" && pos != -1)
				this.getRelativePosBounds(pos, r);
			else
				this.getNodeBounds(r);
			
			if (r.top - this.nte.editor.scrollTop <= 10)
			{
				//scroll down
				this.nte.editor.scrollTop = r.top - 10;
			}
			else if (r.bottom - this.nte.editor.scrollTop >= cr.height - 10)
			{
				//scroll up
				this.nte.editor.scrollTop = r.top + r.height - cr.height + 10;
			}
			
			var rect = this.nte.editor.getBoundingClientRect();
			
			if (r.left + rect.left - this.nte.editor.scrollLeft <= 0)
			{
				//scroll to the right
				this.nte.editor.scrollLeft = r.left - cr.width / 10;
			}
			else if (r.right + rect.left - this.nte.editor.scrollLeft >= cr.width)
			{
				//scroll to the left
				this.nte.editor.scrollLeft = r.right - cr.width + cr.width / 10;
			}
		}, 
		
		render : function()
		{
		}, 
		
		remake : function()
		{
			this.childNodes.forEach("remake", []);
		}, 
		
		//caret functions

		/**
		 * Renders the caret. Default implementation.
		 * @method renderCaret
		 */
		renderCaret : function(selectedNode, range)
		{
			for (var i = selectedNode.pos; i < selectedNode.pos + selectedNode.length; ++i)
			{
				var n = this.childNodes.get(i);
				n.renderCaret(new SelectedNode(null, n, 0, n.getLength()), range);
			}
		}, 
		
		getNodePos : function()
		{
			var positions = new Array();

			var n = this;
			while (n.parentNode)
			{
				var p = n.parentNode.getChildPos(n);
				positions.push(p);
				n = n.parentNode;
			}
			
			return positions;
		}, 
		
		getCaretPosition : function()
		{
			return new CaretPosition(this, 0);
		}, 
		
		/**
		 * Moves caret to the beginning of the line
		 * @method moveCaretToLineBegin
		 */
		moveCaretToLineBegin : function()
		{
			var c = this.caret.currentState;
			if (c.isSelected())
			{
				//remove the selection and do not move the caret
				var s = c.selectedNodes[0];
				this.caret.setToNodePos(s.getNode(), s.getPos());
				return true;
			}

			var t = this.getLineBegin(c);
			if (t)
			{
				//var n = t.getNode();
				//n.scrollIntoView(t.getSelectionStart());
				this.caret.setState(t);
				return true;
			}
			
			return false;
		},

		/**
		 * Moves caret to the end of the line
		 * @method moveCaretToLineEnd
		 */
		moveCaretToLineEnd : function()
		{
			var c = this.caret.currentState;
			if (c.isSelected())
			{
				//remove the selection and do not move the caret
				var s = c.selectedNodes[0];
				this.caret.setToNodePos(s.getNode(), s.getPos());
				return true;
			}

			var t = this.getLineEnd(c);
			if (t)
			{
				//var n = t.getNode();
				//n.scrollIntoView(t.getSelectionStart());
				this.caret.setState(t);
				return true;
			}
			
			return false;
		},
		
		moveCaretAtPoint : function()
		{
		}, 
		
		moveCaretToNodeBegin : function()
		{
		}, 
		
		moveCaretToNodeEnd : function()
		{
		}, 
		
		/**
		 * Moves the caret to the left symbol or node. Default implementation.
		 * @method moveCaretLeft
		 */
		moveCaretLeft : function()
		{
			var c = this.caret.currentState;
			if (c.isSelected())
			{
				//remove the selection and do not move the caret
				var s = c.selectedNodes[0];
				this.caret.setToNodePos(s.getNode(), s.getPos());
				return true;
			}

			var t = this.getPreviousPosition(c);
			if (t)
			{
				this.caret.setState(t);
				return true;
			}
			return false;
		}, 

		/**
		 * Moves caret to the right symbol or node. Default implementation.
		 * @method moveCaretRight
		 */		
		moveCaretRight : function()
		{
			var c = this.caret.currentState;
			if (c.isSelected())
			{
				//remove the selection and do not move the caret
				var s = c.selectedNodes[c.selectedNodes.length - 1];
				this.caret.setToNodePos(s.getNode(), s.getPos() + s.length);
				return true;
			}
			
			var t = this.getNextPosition(c);
			if (t)
			{
				this.caret.setState(t);
				return true;
			}
			return false;
		}, 
		
		/**
		 * @method moveCaretUp
		 */
		moveCaretUp : function()
		{
			var t = this.getUpperPosition(this.caret.currentState);
			if (t)
			{
				this.caret.setState(t);
				return true;
			}
			
			return false;
		}, 
		
		/**
		 * @method moveCaretDown
		 */
		moveCaretDown : function()
		{
			var t = this.getLowerPosition(this.caret.currentState);
			if (t)
			{
				//t.getNode().scrollIntoView(t.getPos());
				this.caret.setState(t);
				return true;
			}
			
			return false;
		}, 

		moveCaretToPreviousWord : function()
		{
			var pos = this.caret.currentState.pos;
		}, 
		
		/**
		 * Moves the caret to the next text word
		 * @method moveCaretToNextWord
		 */
		moveCaretToNextWord : function()
		{
			var pos = this.caret.currentState.pos;
			var node = this.getTextChildByContinuousPos(pos);
			var p = this.getPosInChildTextPos(pos);
			
			var n = this;
			while (n)
			{
				if (node)
				{
					//search next word
					var t = n.getNextWord(node, p);
					if (t.node)
					{
						if (t.contiuousPos != this.caret.currentState.pos || t.node.id != this.caret.currentState.nodeId)
							break;
					}
					else
					{
						//if a node wants to break the next word's search, it must return {node : null}
						break;
					}
				}
				
				//search in the nearest parent
				var i = n.parentNode.getChildPos(n);
				if (n.parentNode.element.childNodes.length < i + 1)
				{
					p = 0;
					node = n.parentNode.element.childNodes[i + 1];
				}
				else
					node = null;
				n = n.parentNode;
			}
			
			if (t && t.node)
				this.caret.setToNodePos(t.node, t.continousPos);
		},
		
		selectLeft : function()
		{
			var pos = this.caret.currentState.getSelectionStart();
			var n = this.getTextChildByContinuousPos(pos);
			var p = this.getPosInChildTextPos(pos);

			var t = this.getPreviousPosition(n, p);
			if (t)
			{
				this.caret.continueSelection(t.getSelectedNode(), t.getSelectionStart());
				return true;
			}
			return false;
		}, 
		
		selectRight : function()
		{
			var pos = this.caret.currentState.getSelectionEnd();
			var n = this.getTextChildByContinuousPos(pos);
			var p = this.getPosInChildTextPos(pos);

			var t = this.getNextPosition(n, params);
			if (t)
			{
				this.caret.continueSelection(t.getSelectedNode(), t.getSelectionStart());
				return true;
			}
			return false;
		}, 

		getLineBegin : function(caretState)
		{
			//this work must do node that makes the lines
			if (this.parentNode)
				return this.parentNode.getLineBegin(caretState);
			return null;
		},

		getLineEnd : function(caretState)
		{
			//this work must do node that makes the lines
			if (this.parentNode)
				return this.parentNode.getLineEnd(caretState);
			return null;
		},
		
		getPreviousWord : function(node, pos)
		{
		}, 
		
		/**
		 * Finds the next word in the current node and its children. Default implementation.
		 * @method getNextWord
		 * @param {Object} node Start node
		 * @param {int} pos Position in the start node
		 */
		getNextWord : function(node, pos)
		{
			var n = node;
			var p = pos;
			
			while (n)
			{
				switch (n.nodeType)
				{
				case 1:
					var t = n.htmlNode.getNextWord(n.firstSibling, 0);
					if (t && t.node)
					{
						if (t.node != this || t.continuousPos != this.getContinuousPosByTextNode(node, pos))
							return t;
					}
					break;
				case 3:
					for (var i = p; i < n.length; ++i)
					{
						if (n.textContent[i] = ' ')
						{
							//a space found, return the next position
							if (i < n.length - 1)
							{
								return new CaretState(this, this.getContinuousPosByTextNode(n, i - 1));
							}
							if (n.nextSibling)
							{
								switch (n.nextSibling.nodeType)
								{
								case 1:
									n.nextSibling.htmlNode.getFirstPosition();
								case 3:
									return new CaretState(this, this.getContinuousPosByTextNode(n.nextSibling, 0));
								}
							}
							return this.getLastPosition();
						}
					}
					break;
				}
				
				p = 0;
				n = n.nextSibling;
			}
			
			return null;
		}, 
		
		/**
		 * Returns the first caret position of the node. Default implementation.
		 * @method getFirstPosition
		 */
		getFirstPosition : function()
		{
			if (this.childNodes.count() > 0)
				return this.childNodes.getFirst().getFirstPosition();
			return null;
		},
		
		/**
		 * Returns the last caret position of the node. Default implementation.
		 * @method getLastPosition
		 */
		getLastPosition : function()
		{
			if (this.childNodes.count() > 0)
				return this.childNodes.getLast().getLastPosition();
			return null;
		},
		
		setCaretPosition : function(cPos)
		{
			return new CaretState(this, cPos);
		}, 
		
		setCaretToNodeBegin : function()
		{
			if (this.childNodes.count() == 0)
				return null;
			return this.childNodes.getFirst().setCaretToNodeBegin();
		}, 
		
		setCaretToNodeEnd : function()
		{
			if (this.childNodes.count() == 0)
				return null;
			return this.childNodes.getLast().setCaretToNodeEnd();
		}, 

		skipFirstPosition : function()
		{
			return true;
		},
		
		/**
		 * Returns the next caret position. Default implementation.
		 * @method getNextPosition
		 * @param {CaretState} relativeState Relative caret state
		 */
		getNextPosition : function(relativeState, params)
		{
			var res = null;
			
			if (!relativeState)
			{
				res = this.getFirstPosition();
				if (res)
					res = res.getNode().getNextPosition(res, params);
			}
			else
			{
				var node = relativeState.getNode();
				var i = this.getFirstLevelChildPos(node);

				if (i != -1)
				{
					for (var pos = i + 1; pos < this.childNodes.count(); ++pos)
					{
						var n = this.childNodes.get(pos);
						//whether to skip the first position
						if (pos == i + 1 && this.childNodes.get(i).skipFirstPosition())
						{
							res = n.getNextPosition(null, params);
							if (n.getLength() == 1)
							{
								relativeState.getRect(this.tempRect);
								var left = this.tempRect.left;
								var top = this.tempRect.top;
								res.getRect(this.tempRect);
								if (left == this.tempRect.left && top == this.tempRect.top)
								{
									res = n.getNextPosition(res, params);
									res = res.getNode().getFirstPosition();
								}
							}
						}
						else
							res = n.getFirstPosition();
						if (res)
							break;
					}
				}
				
				if (!res && this.parentNode)
					res = this.parentNode.getNextPosition(relativeState, params);
			}
			
			return res;
		}, 

		/**
		 * Returns previous caret position. Default implementation.
		 * @method getPreviousPosition
		 * @param {CaretState} relativeState Relative caret state
		 */
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
				var i = this.getFirstLevelChildPos(node);
				
				//whether the first position was skipped
				if (i > 0 && relativeState.getPos() > 0 && !this.childNodes.get(i - 1).skipFirstPosition())
					res = this.childNodes.get(i).getFirstPosition();
				
				if (!res)
				{
					for (var pos = i - 1; pos >= 0; --pos)
					{
						var n = this.childNodes.get(pos);
						res = n.getPreviousPosition(null, params);
						if (res)
							break;
					}
				}
				
				if (!res && this.parentNode)
					res = this.parentNode.getPreviousPosition(relativeState, params);
				
				if (res)
				{
					res.getRect(this.tempRect);
					var t = this.tempRect.left;
					var r = res.getNode().getPreviousPosition(res, params);
					if (r)
					{
						r.getRect(this.tempRect);
						if (t == this.tempRect.left)
						{
							var pos = relativeState.getPos();
							if (pos == 0)
								res = r;
							else
								res = relativeState.getNode().getFirstPosition();
						}
					}
				}
			}
			
			return res;
		}, 
		
		getUpperPosition : function(relativeState)
		{
			var n = relativeState.getNode();
			
			//get the line to operate with
			if (this.isChild(n))
			{
				//get the previous line
				var c1 = this.getLineBegin(relativeState);
				c1 = c1.getNode().getPreviousPosition(c1, {lower : true});
				if (!c1)
					return null;
				if (!this.isChild(c1.getNode()))
					return this.parentNode.getUpperPosition(relativeState);
			}
			else
			{
				//get the last line
				var c1 = this.getLastPosition();
			}

			var c2 = c1.getNode().getLineBegin(c1);

			var p = c2.getNode().getCommonParent(c1.getNode());
			var r = this.tempRect;
			var c = c1;
			var res = c;

			relativeState.getRect(r);
			var x = r.left;

			n = c.getNode();
			n.getRelativePosBounds(c.getPos(), r);
			
			while (c != null && r.left > x && !c1.isEqual(c2))
			{
				c1 = c;
				res = c;
				n = c.getNode();
				c = n.getPreviousPosition(c, {lower : true});
				
				if (!c || res.isEqual(c))
					return res;
				
				n = c.getNode();
				if (p != n && !p.isChild(n))
					return res;
			
				res = c;
				n.getRelativePosBounds(c.getPos(), r);
			}
			
			var t = x - r.left;
			c1.getRect(r);
			if (Math.abs(x - r.left) < t)
				return c1;
			
			return res;
		},

		getLowerPosition : function(relativeState)
		{
			var n = relativeState.getNode();
			
			//get the line to operate with
			if (this.isChild(n))
			{
				//get the next line
				var c1 = this.getLineEnd(relativeState);
				c1 = c1.getNode().getNextPosition(c1, {upper : true});
				if (!c1)
					return null;
				if (!this.isChild(c1.getNode()))
					return this.parentNode.getLowerPosition(relativeState);
			}
			else
			{
				//get the first line
				var c1 = this.getFirstPosition();
			}

			var c2 = c1.getNode().getLineEnd(c1);

			var p = c2.getNode().getCommonParent(c1.getNode());
			var r = this.tempRect;
			var c = c1;
			var res = c;

			relativeState.getRect(r);
			var x = r.left;

			n = c.getNode();
			n.getRelativePosBounds(c.getPos(), r);
			
			while (c != null && r.left < x)
			{
				if (c1.isEqual(c2))
				{
					res = c2;
					break;
				}
				
				c1 = c;
				res = c;
				n = c.getNode();
				c = n.getNextPosition(c, {upper : true});
				
				if (!c || res.isEqual(c))
					return res;
				
				n = c.getNode();
				if (p != n && !p.isChild(n))
					return res;
			
				res = c;
				n.getRelativePosBounds(c.getPos(), r);
			}
			
			var t = r.left - x;
			c1.getRect(r);
			if (Math.abs(x - r.left) < t)
				return c1;

			return res;
		},
		
		getNearsetPosition : function(x, y)
		{
		},
		
		canExpandSelection : function(selectedNode)
		{
			return true;
		},
		
		hasSingleLine : function()
		{
			return false;
		},

		//tool functions
		
		/**
		 * Returns node bounds relative to the editor
		 * @method getNodeBounds
		 */
		getNodeBounds : function(posRect)
		{
			var rect = this.element.getBoundingClientRect();
			var r = this.nte.editor.getBoundingClientRect();
			
			posRect.setRect(Math.round(rect.left + this.nte.editor.scrollLeft - r.left), 
				Math.round(rect.top + this.nte.editor.scrollTop - r.top), 
				Math.round(rect.width), 
				Math.round(rect.height));
		}, 

		/**
		 * Returns TextRange position bounds by continuous position relative to the editor. Default implementation.
		 * @method getPosBounds
		 * @param {int} cPos continuous position
		 */
		getPosBounds : function(pos, posRect)
		{
			if (this.childNodes.get(pos).element.getBoundingClientRect)
				var r = this.childNodes.get(pos).element.getBoundingClientRect();
			else
			{
				var r = this.tempRect;
				this.childNodes.get(pos).getNodeBounds(r);
			}
			
			posRect.setRect(r.left, r.top, 0, r.height);
		},
		
		getRelativePosBounds : function(pos, rect)
		{
			this.getPosBounds(pos, rect);

			var r = this.nte.editor.getBoundingClientRect();

			rect.setRect(Math.round((pos == this.element.length ? rect.right + this.nte.editor.scrollLeft : rect.left + this.nte.editor.scrollLeft) - r.left), 
				Math.round(rect.top + this.nte.editor.scrollTop - r.top), 
				Math.round(0), 
				Math.round(rect.height));
		},
				
		/**
		 * Returns symbol bounds in the HTML text
		 * @method getSymbolBounds
		 * @param {Object} continuousPos
		 */		
		getSymbolBounds : function(continuousPos)
		{
			var n = this.getTextChildByContinuousPos(continuousPos);
			var p = this.getPosInChildTextPos(continuousPos);
			
			if (this.nte.isIE)
			{
			}
			else
			{
				var textRange = this.document.createRange();
				textRange.setStart(n, p);
				if (p == n.length)
					textRange.setEnd(n, p);
				else
					textRange.setEnd(n, p + 1);
				var rect = textRange.getBoundingClientRect();
				var r = this.nte.editor.getBoundingClientRect();
			}
			
			return new Rectangle(rect.left - r.left, rect.top - r.top, rect.width, rect.height);
		}, 

		//editing
		
		dublicate : function(parent)
		{
			var el = this.element.cloneNode(false);
			if (this.className)
			{
				var resNode = this.nte.createNodeByClassName(this.className, el, parent, 
					this.parentNode == null ? 0 : this.parentNode.getChildPos(this));
			}
			else
			{
				var resNode = this.nte.createNode(this.element.tagName, el, parent, 
					this.parentNode == null ? 0 : this.parentNode.getChildPos(this));
			}
			
			resNode.nextCaretPos = this.nextCaretPos;
			resNode.caretState = this.caretState;
			resNode.childNodes.copyFrom(this.childNodes, resNode);

			return resNode;
		}, 
		
		split : function(pos, command)
		{
			var p = this.parentNode.getChildPos(this);

			if (pos == 0)
			{
				var n = this.nte.createNode(this.element.nodeName, null, this.parentNode, p);
				//return true;
				command.setParam(this, "leftSplit", true);
			}
			else
			{
				var n = this.nte.createNode(this.element.nodeName, null, this.parentNode, p + 1);
	
				var c = this.childNodes.count();
				for (var j = pos; j < c; ++j)
				{
					//n.addChildNode(this.childNodes.get(pos).dublicate());
					//this.removeChildNode(pos);
					n.moveChildNode(this.childNodes.get(pos), n.childNodes.count());
				}
				
				//return false;
				command.setParam(this, "leftSplit", false);
			}
			
			return n;
		}, 
		
		merge : function(command)
		{
			var pos = this.parentNode.getChildPos(this);
			if (pos == -1)
				return null;

			var leftSplit = command.getParam(this, "leftSplit");

			if (leftSplit)
			{
				if (pos > 0)
				{
					var n = this.parentNode.childNodes.get(pos - 1);
					if (this.element.nodeName == n.element.nodeName)
					{
						var i = this.childNodes.count();
						
						//merge the nodes
						var c = n.childNodes.count();
						for (var j = 0; j < c; ++j)
							this.insertChildNode(n.childNodes.get(j).dublicate(), j);
						this.parentNode.removeChildNode(pos - 1);
						
						return this.childNodes.get(c);
					}
				}
			}
			else
			{
				if (pos + 1 < this.parentNode.childNodes.count())
				{
					var n = this.parentNode.childNodes.get(pos + 1);
					if (this.element.nodeName == n.element.nodeName)
					{
						var i = this.childNodes.count();
						
						//merge the nodes
						var c = n.childNodes.count();
						for (var j = 0; j < c; ++j)
							this.insertChildNode(n.childNodes.get(j).dublicate(), i + j);
						this.parentNode.removeChildNode(pos + 1);

						//return this;
						return this.childNodes.get(i - 1);
					}
				}
			}
			
			return null;
		}, 

		//command util functions
		
		doInsert : function(pos, nodeEvent, command)
		{
			var node = nodeEvent.node;
			if (!node)
			{
				//text inserting is allowed in a TextNode object only
				return false;
			}
			
			var caretState = nodeEvent.caretState;

			this.split(pos, command);
			
			var p = this.parentNode.getChildPos(this);
			if (this.parentNode.doInsert(pos == 0 ? p : p + 1, nodeEvent, command))
			{
				nodeEvent.undoActionNodePos = this.getCaretPosition();

				return true;
			}
			
			return false;
		}, 
		
		undoInsert : function(nodeEvent, command)
		{
			this.parentNode.undoInsert(nodeEvent, command);
			this.merge(command);
			
			return true;
		}, 
		
		normilize : function(command)
		{
			if (this.isEmpty())
				return;
			
			var normilizedNodes = 
				{
				};
		
			for (var i = this.childNodes.count() - 1; i >= 0; --i)
			{
				var n = this.childNodes.get(i);
				if (n.isEmpty())
				{
					normilizedNodes[i] = n.dublicate();
					this.removeChildNode(i);
				}
			}
			
			command.setParam(this, "normilize", normilizedNodes);
		}, 

		unnormilize : function(command)
		{
			var normilizedNodes = command.getParam(this, "normilize");
			
			for (var i in normilizedNodes)
			{
				var n = normilizedNodes[i];
				this.insertChildNode(n, i);
			}
		}, 

		//command functions
		
		insertChild : function(nodeEvent, command)
		{
			var pos = nodeEvent.caretState.getSelectionStart();
			
			if (this.doInsert(pos, nodeEvent, command))
			{
				nodeEvent.undo = function(nodeEvent, command)
					{
						this.undoInsert(nodeEvent, command);
						
						return true;
					};
				
				return true;
			}
			
			return false;
		}, 

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			var s = nodeEvent.caretState.selectedNodes[0];
			
			if (node == this)
			{
				if (len == 0)
				{
					if (nodeEvent.right)
					{
						if (pos < this.childNodes.count())
						{
							var n = this.childNodes.get(pos);
							return n.doRemoveChild(n, 0, 0, nodeEvent, command);
						}
						else if (!this.parentNode)
							return false;
						else
							return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this) + 1, 0, nodeEvent, command);
					}
					else
					{
						if (pos > 0)
						{
							var n = this.childNodes.get(pos - 1);
							return n.doRemoveChild(n, n.getLength(), 0, nodeEvent, command);
						}
						else if (this.parentNode == null)
							return false;
						else
							return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 0, nodeEvent, command);
					}
				}
				else if (len == this.childNodes.count())
				{
					return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 1, nodeEvent, command);
				}
				else
				{
					//store dublicates and remove the nodes
					var dublicates = new Array();
					for (var i = pos; i < pos + len; ++i)
					{
						dublicates.push(this.childNodes.get(pos).dublicate());
						this.removeChildNode(pos);
					}
					
					//set the caret
					if (pos == 0)
						nodeEvent.caretState.setToNodeBegin(this.childNodes.get(pos));
					else if (pos < this.childNodes.count())
						nodeEvent.caretState.setToNodeEnd(this.childNodes.get(pos - 1));
					else
						nodeEvent.caretState.setToNodeEnd(this, pos - 1);
					
					nodeEvent.undoActionNodePos = this.getCaretPosition();
		
					nodeEvent.undo = function(nodeEvent, command)
						{
							//restore dublicates
							for (var i = 0; i < dublicates.length; ++i)
								this.insertChildNode(dublicates[i], pos + i, nodeEvent.caretState);
							
							return true;
						};
					
					return true;
				}
			}
			else
			{
				//node is a child node, length equals 0
				if (nodeEvent.right)
				{
					if (pos < this.childNodes.count())
					{
						var n = this.childNodes.get(pos);
						return n.doRemoveChild(n, 0, 0, nodeEvent, command);
					}
					else
						return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 0, nodeEvent, command);
				}
				else
				{
					if (pos > 0)
					{
						var n = this.childNodes.get(pos - 1);
						return n.doRemoveChild(n, n.getLength(), 0, nodeEvent, command);
					}
					else
						return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 0, nodeEvent, command);
				}
			}
			
			//return false;
		},
		
		removeChild : function(nodeEvent, command)
		{
			var s = nodeEvent.caretState.selectedNodes[0];
			var pos = s.getPos();
			var len = s.length;
			var node = s.getNode();
			
			return this.doRemoveChild(node, pos, len, nodeEvent, command);
		},
		
		addType : function(nodeEvent, command)
		{
			var s = nodeEvent.caretState.selectedNodes[0];
			var pos = s.getPos();
			var len = s.length;
			var type = nodeEvent.nodeType;
			if (nodeEvent.nodeStyle)
				var nodeStyle = nodeEvent.nodeStyle;
			if (nodeEvent.nodeClass)
				var nodeClass = nodeEvent.nodeClass;
			
			if (len == 0)
				return false;

			//check the child nodes have not the same type
			for (var i = pos; i < pos + len; ++i)
			{
				var n = this.getChildNode(i);
				if (n.element.nodeName.toLowerCase() != type)
					break;
				if (nodeStyle && !n.checkStyle(nodeStyle))
					break;
			}
			
			if (i == pos + len)
				return false;

			//wrap type node
			var m = this.nte.createNode(type, null, this, pos);
			if (nodeStyle)
				m.addStyle(nodeStyle);

			//add child nodes in the wrap node
			for (var i = pos + 1; i < pos + len + 1; ++i)
			{
				var n = this.getChildNode(pos + 1);
				m.addChildNode(n.dublicate());
				this.removeChildNode(pos + 1);
			}

			if (m.getLength() == 0)
			{
				this.removeChildNode(0);
				return false;
			}
			
			this.updateCaretState();
			
			nodeEvent.caretState.setToNode(this, pos, 1);
			nodeEvent.resNode = this;
			nodeEvent.undoActionNodePos = this.getCaretPosition();
			
			nodeEvent.undo = function(nodeEvent, command)
				{
					var n = this.getChildNode(pos);
					for (var i = 0; i < n.getLength(); ++i)
					{
						var p = n.getChildNode(i);
						this.insertChildNode(p.dublicate(), pos + i + 1);
					}
					
					this.removeChildNode(pos);

					nodeEvent.caretState.setToNode(this, pos, len);
					nodeEvent.resNode = this;

					return true;
				};
			
			return true;
		}, 

		doChangeChildType : function(nodeEvent, command)
		{
			if (!this.parentNode)
				return false;
			return this.parentNode.doChangeChildType(nodeEvent, command);
		}, 
		
		undoChangeChildType : function(nodeEvent, command)
		{
			return this.parentNode.undoChangeChildType(nodeEvent, command);
		}, 

		changeChildType : function(nodeEvent, command)
		{
			if (!this.doChangeChildType(nodeEvent, command))
				return false;
			
			nodeEvent.undo = function(nodeEvent, command)
				{
					return this.undoChangeChildType(nodeEvent, command);
				};
			
			return true;
		}, 
		
		doInsertLine : function(nodeEvent, command)
		{
			if (!this.parentNode)
				return false;
			
			return this.parentNode.doInsertLine(nodeEvent, command);
		}, 
		
		undoInsertLine : function(nodeEvent, command)
		{
			return this.parentNode.undoInsertLine(nodeEvent, command);
		}, 
		
		insertLine : function(nodeEvent, command)
		{
			if (!this.doInsertLine(nodeEvent, command))
				return false;
			
			nodeEvent.undo = function(nodeEvent, command)
				{
					return this.undoInsertLine(nodeEvent, command);
				};
			
			nodeEvent.undoActionNodePos = this.getCaretPosition();
			
			return true;
		}, 

		doNormilizeChildTypes : function(nodeEvent, command)
		{
			var caretState = nodeEvent.caretState.dublicate();
			var changed = new Array();
			var p = this.childNodes.count();
		
			for (var i = 0; i < p; ++i)
			{
				var n = this.childNodes.get(i);
				if (n.element.nodeName.toLowerCase() == this.element.nodeName.toLowerCase())
				{
					//store the changed node parameters for undo
					changed.push(
						{
							"node" : n, 
							"pos" : i, 
							"nodes" : new Array()
						}
						);
					var c = changed[changed.length - 1];
					
					//copy child nodes in this node
					for (var j = 0; j < n.childNodes.count(); ++j)
					{
						var t = n.getChildNode(j);
						this.insertChildNode(t.dublicate(), i + j + 1);
						c["nodes"].push(i + 1);
					}

					if (p == 1)
					{
						command.setParam(this, "cssText", this.element.style.cssText);
						command.setParam(n, "cssText", n.element.style.cssText);
						
						if (this.nte.isWebKit)
						{
							for (var name in n.element.style)
							{
								var p = parseInt(name);
								if (p >= "0" && p <= "9")
								{
									var s = n.element.style[name];
									p = n.element.style[s];
									var m = {};
									m[s] = p;
									this.addStyle(m);
								}
							}
						}
						else
						{
							//copy the style in the new node
							for (var name in n.element.style)
							{
								if (!(name >= "0" && name <= "9") && name != "cssText")
								{
									var s = n.element.style[name];
									if (s && typeof(s) != "function" && s != "")
									{
										var m = {};
										m[name] = s;
										this.addStyle(m);
									}
								}
							}
						}
					}
					
					this.removeChildNode(i--);
				}
			}
			
			nodeEvent.resNode = this;
			nodeEvent.caretState.setCaretState(caretState);
			nodeEvent.undoActionNodePos = this.getCaretPosition();
			
			if (changed.length > 0)
				command.setParam(this, "changed", changed);
			
			return changed.length > 0;
		}, 

		undoNormilizeChildTypes : function(nodeEvent, command)
		{
			var changed = command.getParam(this, "changed");

			//restore the parameters
			for (var i = 0; i < changed.length; ++i)
			{
				var c = changed[i];
				
				var n = this.nte.createNode(this.element.nodeName, null, this, c["pos"]);
				n.id = c["id"];
				
				for (var j = 0; j < c["nodes"].length; ++j)
				{
					var m = this.childNodes.get(c["nodes"][j]);
					n.addChildNode(m.dublicate());
					this.removeChildNode(c["nodes"][j]);
				}
			}

			var t = command.getParam(this, "cssText");
			if (t)
				this.element.style.cssText = t;

			if (n)
			{
				t = command.getParam(n, "cssText");
				if (t)
					n.element.style.cssText = t;
			}

			return true;
		}, 

		normilizeChildTypes : function(nodeEvent, command)
		{
			if (!this.doNormilizeChildTypes(nodeEvent, command))
				return false;
			
			nodeEvent.undo = function(nodeEvent, command)
				{
					return this.undoNormilizeChildTypes(nodeEvent, command);
				};

			return true;
		}, 
		
		changeChildNodeType : function(nodeEvent, command)
		{
			var pos = this.childNodes.getPos(nodeEvent.nodeId);
			var node = this.childNodes.get(pos);
			if (node.getType() == nodeEvent.nodeType.type && this.isEqualStyle(nodeEvent.nodeType.style))
				return false;

			var caretState = nodeEvent.caretState;
			
			var lastType = node.getType();
			var lastStyle = node.getStyle();
			
			var ins = this.nte.createTextNode(nodeEvent.nodeType.type, nodeEvent.nodeType.style, this);
			this.updateNodeId(command, "insId", ins);

			//copy child nodes of the selected node in the created node
			this.copyNode(node, ins);

			var parentPos = node.getParentTextChildPos();
			var t = this.getTextChild(parentPos);

			this.removeChildNode(pos);		
			this.insertChildNode(ins, parentPos, t == null ? 0 : t.length);

			nodeEvent.resNode = this;
			
			nodeEvent.caretState = caretState;

			nodeEvent.undo = function(nodeEvent, command)
				{
					var node = this.childNodes.get(pos);

					var ins = this.nte.createTextNode(lastType, lastStyle, this);
					this.copyNode(node, ins);

					var parentPos = node.getParentTextChildPos();
					var t = this.getTextChild(parentPos);

					this.removeChildNode(pos);		
					this.insertChildNode(ins, parentPos, t == null ? 0 : t.length);
					
					nodeEvent.resNode = this;
					nodeEvent.caretState = caretState;
					nodeEvent.caretState.restore(this.nte);

					return true;
				};
				
			return true;
		}, 
		
		normilizeChildNodes : function(nodeEvent, command)
		{
		}, 
		
		mergeWithNextNode : function(nodeEvent, command)
		{
			if (!this.parentNode)
				return false;
			
			var pos = this.parentNode.getChildPos(this);
			if (pos + 1 < this.parentNode.childNodes.count())
			{
				var n = this.parentNode.childNodes.get(pos + 1);
				//check type and style
				if (this.element.nodeName == n.element.nodeName && 
					this.element.style.cssText.toLowerCase() == n.element.style.cssText.toLowerCase())
				{
					var i = this.childNodes.count();
				
					//merge the nodes
					//nodeEvent.caretState.store();
					this.mergeNode(nodeEvent.caretState);
					//nodeEvent.caretState.restore();
					
					//if (nodeEvent.caretState.getNode() == null || nodeEvent.caretState.getPos() == -1)
					//	nodeEvent.caretState.setCaretState(this.getFirstPosition());
					
					nodeEvent.undoActionNodePos = this.getCaretPosition();

					nodeEvent.undo = function(nodeEvent, command)
						{
							if (this.className)
								var n = this.nte.createNodeByClassName(this.className, null, this.parentNode, 
									this.parentNode.getChildPos(this) + 1);
							else
								var n = this.parentNode.createChildNode(this.nte.getClassName(this.element.nodeName), this.parentNode.getChildPos(this) + 1);
							
							for (var j = i; j < this.childNodes.count();)
							{
								n.addChildNode(this.childNodes.get(j).dublicate());
								this.removeChildNode(i);
							}
							
							nodeEvent.resNode = this.parentNode;
							
							return true;
						};
					
					return true;
				}
			}
			
			return false;
		}, 
		
		mergeChildNodes : function(nodeEvent, command)
		{
			var s = nodeEvent.caretState.selectedNodes[0].dublicate();
			
			for (var i = s.pos; i < s.pos + s.length; ++i)
			{
				if (i + 1 < s.pos + s.length)
				{
					var n1 = this.childNodes.get(i);
					var n2 = this.childNodes.get(i + 1);
					
					if (typeof(n1) == typeof(n2))
					{
						//merge the nodes
						for (var j = 0; j < n2.childNodes.count(); ++j)
							this.insertChildNode(n2.childNodes.get(j).dublicate(), i + j + 1);
						this.removeChildNode(i + 1);
						--i;
					}
				}
			}
		}, 

		splitChildNode : function(nodeEvent, command)
		{
			if (nodeEvent.caretState.selectedNodes.length == 0)
				return false;

			var selectedNode = nodeEvent.caretState.selectedNodes[0];
			var r = selectedNode.dublicate();
			var node = this.nte.findTextNode(selectedNode.id);
			var nodePos = node.getTextChildPos(selectedNode.textNodePos);
			var textPos = selectedNode.pos;
			
			var s = [];
			
			if (!command.nodeParams.lastNodes)
				var lastNodes = [];
			else
				var i = 0;
			
			do
			{
				var pos = node.parentNode.childNodes.getPos(node.id);
				
				var p = [];
				p["id"] = node.id;
				p["pos"] = pos;
				s.splice(0, 0, p);
				
				var j = node.getTextChildPos(nodePos);
				if (j == node.element.childNodes.length - 1 && node.parentNode != this)
				{
					switch (node.element.childNodes[j].nodeType)
					{
					case 1:
						break;
					case 3:
						if (textPos != 0 && textPos != node.element.childNodes[j].length)
						{
							node = node.parentNode.splitNode(command.nodeParams.lastNodes ? command.nodeParams.lastNodes[i++] : null, 
								pos, nodePos, textPos);
							if (!command.nodeParams.lastNodes)
								lastNodes.push(node.id);
							//nodePos = node.parentNode.childNodes.getPos(node.id);
							nodePos = node.parentNode.getChildPos(node) - 1;
						}
						else
						{
							nodePos = node.parentNode.getChildPos(node);
						}
						break;
					}
				}
				else
				{			
					node = node.parentNode.splitNode(command.nodeParams.lastNodes ? command.nodeParams.lastNodes[i++] : null, 
						pos, nodePos, textPos);
					if (!command.nodeParams.lastNodes)
						lastNodes.push(node.id);
					nodePos = node.parentNode.getChildPos(node) - 1;
				}
				
				var n = node;
				textPos = 0;
				node = node.parentNode;
			}
			while (node != this);

			command.nodeParams.lastNodes = lastNodes;
			
			nodeEvent.resNode = n;
			nodeEvent.caretState.setToNodeBegin(n);

			nodeEvent.undo = function(nodeEvent, command)
				{
					for (var item in s)
					{
						var i = s[item];
						var n = this.nte.findTextNode(i["id"]);
						n.parentNode.normalizeChildNodes(i["pos"], i["pos"] + 1);
					}
					
					nodeEvent.caretState.setToNode(n, r.textNodePos, r.pos);
					
					return true;
				};
			
			return true;
		}, 
		
		//utils functions
		
		getFormat : function()
		{
			if (this.parentNode)
				return this.parentNode.getFormat();
			return null;
		},
		
		getFontFamily : function()
		{
			return null;
		},
		
		getFontSize : function()
		{
			return null;
		},

		//test functions
		
		setCaret : function(pos, length)
		{
			var selectedNodes = new Array();
			var p = pos;
			var len = length;
			
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				var s = n.setCaret(p, len);
				
				if (s.length == 0)
				{
					var t = n.getText(0, n.getLength());
					p -= t.length;
					if (p == 0)
						selectedNodes.push(new SelectedNode(null, n, n.getLength(), 0));
				}
				
				for (var j = 0; j < s.length; ++j)
				{
					selectedNodes.push(s[j]);
					
					p = 0;
					len -= s[j].length;
				}
				
				if (p == 0 && len <= 0 && selectedNodes.length > 0)
					break;
			}
			
			return selectedNodes;
		},
		
		getText : function(pos, length)
		{
			var res = "";
			
			for (var i = pos; i < pos + length; ++i)
			{
				var n = this.childNodes.get(i);
				res += n.getText(0, n.getLength());
			}
			
			return res;
		}, 
		
		testText : function()
		{
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n1 = this.childNodes.get(i);
				if (i > 0)
				{
					var n2 = this.childNodes.get(i - 1);
					if (n1.element.nodeName.toLowerCase() == "#text" && n2.element.nodeName.toLowerCase() == "#text")
						return false;
				}
				
				if (!n1.testText())
					return false;
			}
			
			return true;
		}
	} 
);
