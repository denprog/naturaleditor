/**
 * Base class for formula nodes
 * @class FormulaNode
 * @constructor
 */
var FormulaNode = HtmlNode.extend(
	{
		init : function(nodeType, element, parentNode, pos, nte)
		{
			/**
			 * Group node
			 * @public
			 */
			this.groupNode = parentNode ? parentNode.groupNode : null;
			/**
			 * Client rect
			 * @public
			 */
			this.clientRect = new Rectangle();
			this.boundingRect = new Rectangle();
			
			/**
			 * Node baseline
			 * @public
			 */
			this.baseline = 0;
			
			this._super(nodeType, element, parentNode, pos, nte);
		}, 

		insertChildNode : function(childNode, pos, caretState)
		{
			this._super(childNode, pos, caretState);
			if (this.groupNode)
				this.groupNode.remake();
		}, 

		addChildNode : function(childNode)
		{
			this._super(childNode);
			if (this.groupNode)
				this.groupNode.remake();
		}, 

		removeChildNode : function(pos)
		{
			this._super(pos);
			if (this.groupNode)
				this.groupNode.remake();
		}, 

		hasClass : function(name)
		{
			var s = this.element.className.baseVal;
			if (s.indexOf)
				return s.indexOf(name) != -1;
			return s.indexOf(name) != -1;
		},
		
		addClass : function(name)
		{
			if (!this.hasClass(name))
				this.element.className.baseVal += " " + name;
		},
		
		removeClass : function(name)
		{
			var s = this.element.className.baseVal;
			s = s.replace(new RegExp("\\b" + name + "\\b"), "");
			this.element.className.baseVal = s;
		},

		/**
		 * Remakes the child nodes collection. Default implementation for formula node.
		 * @method remake
		 */
		remake : function()
		{
			var x = 0, y = 0;
			
			this.childNodes.forEach("remake", []);
			
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				n.move(x, y);
				x += n.clientRect.width;
			}
			
			this.updateClientRect();
		},

		/**
		 * Updates the baseline
		 * @method update
		 */
		update : function()
		{
			this.baseline = 0;
			this.childNodes.forEach("update", []);

			//get loweset baseline
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				if (n.baseline > this.baseline)
					this.baseline = n.baseline;
			}

			//update the baselines
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				n.move(n.boundingRect.left, this.baseline - n.baseline);
			}
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

			for (var i = 0; i < this.childNodes.count(); ++i)
				this.childNodes.get(i).setLevel(level);
		},
		
		/**
		 * Moves the node within the groupNode. Default implementation.
		 * @method move
		 */
		move : function(x, y)
		{
			this.drawLib.move(x, y, this.element);
			this.updateBoundingRect();
		}, 

		size : function(width, height)
		{
			this.drawLib.setSize(width, height, this.element);
			this.updateBoundingRect();
		}, 

		mergeNode : function(caretState)
		{
			this._super(caretState);
			this.groupNode.remake();
		}, 

		dublicate : function(parent)
		{
			var resNode = this._super(parent);
			resNode.groupNode = this.groupNode;
			return resNode;
		},

		//caret functions
		
		renderCaret : function(selectedNode, range)
		{
			//this.caret.clearShapes();
			
			var r = new Rectangle();
			this.getPosBounds(this.caret.currentState.getSelectionStart(), r);
			if (this.groupNode.boundingRect.height > Math.round(r.bottom) + 3)
				r.setRect(r.left - 2, r.top, r.width == 1 ? 1 : Math.round(r.width) + 2, Math.floor(r.height) + 3);
			else
				r.setRect(r.left - 2, r.top, r.width == 1 ? 1 : Math.round(r.width) + 2, Math.floor(r.height));

			this.caret.renderFormulaCaret(r, this.groupNode);
		},

		setCaretPosition : function(pos)
		{
			return new CaretState(this, pos);
		},
		
		skipFirstPosition : function()
		{
			return false;
		},
		
		getUpperPosition : function(relativeState)
		{
			//by default the formula node has only one row
			return this.parentNode.getUpperPosition(relativeState);
		},
		
		getLowerPosition : function(relativeState)
		{
			//by default the formula node has only one row, get the end of this node and continue
			return this.parentNode.getLowerPosition(relativeState);
		},
		
		hasSingleLine : function()
		{
			return true;
		},

		//command functions
		
		doInsert : function(pos, nodeEvent, command)
		{
			command.setParam(this, "pos", pos);

			var node = nodeEvent.node;
			if (!node)
			{
				if (nodeEvent.text)
				{
					if (this.childNodes.get(pos) instanceof EmptyFormulaNode)
					{
						//replace the empty node with a text node
						this.removeChildNode(pos);
						//var empty = true;
						command.setParam(this, "empty", true);
					}
					
					var n = new TextFormulaNode(this, pos, this.nte);
					nodeEvent.caretState = n.getFirstPosition();
					
					nodeEvent.caretState.getNode().doInsert(0, nodeEvent, command);
					this.groupNode.remake();

					nodeEvent.undoActionNodePos = this.getCaretPosition();
					
					return true;
				}
				
				return false;
			}

			if (nodeEvent.caretState.checkAtLast())
			{
				this.insertChildNode(node, pos, nodeEvent.caretState);
				nodeEvent.caretState.setToNode(this, this.childNodes.count(), 0);
			}
			else
				this.insertChildNode(node, pos, nodeEvent.caretState);
			
			node.render();
			this.groupNode.remake();
			
			nodeEvent.undoActionNodePos = this.getCaretPosition();

			return true;
		},
		
		undoInsert : function(nodeEvent, command)
		{
			var pos = command.getParam(this, "pos");
			var empty = command.getParam(this, "empty");
			
			this.removeChildNode(pos);
			
			if (empty)
				new EmptyFormulaNode(this, pos, this.nte);
			
			return true;
		},

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			var s = nodeEvent.caretState.selectedNodes[0];
			
			if (node == this)
			{
				if (len == 0)
				{
					var c = nodeEvent.caretState.dublicate();

					if (nodeEvent.right)
					{
						if (this.childNodes.count() == 1 && (this.childNodes.get(0) instanceof EmptyFormulaNode))
							return false;
						
						if (pos < this.childNodes.count())
						{
							var dublicates = new Array();
							dublicates.push(this.childNodes.get(pos).dublicate());

							this.caretState = null;

							if (this.childNodes.count() > 1)
							{
								if (pos == this.childNodes.count() - 1)
								{
									this.removeChildNode(pos);
									c = this.getLastPosition();
								}
								else if (pos < this.childNodes.count())
								{
									//if a node has caret positions inside, move to the last position
									var p = this.childNodes.get(pos).getLastPosition();
									if (p)
										c = p.dublicate();
									c = this.getNextPosition(c);
									
									this.caret.setNextState(c);
									this.removeChildNode(pos);
									c = this.caret.getNextState();
								}

								if (c.getPos() == -1)
									c = this.getLastPosition();
							}
							else
							{
								//removing the last item
								this.removeChildNode(pos);
								//insert an empty node
								new EmptyFormulaNode(this, pos, this.nte);
								c = new CaretState(this, pos);
							}

							nodeEvent.caretState = c;
							nodeEvent.undoActionNodePos = this.getCaretPosition();
							
							nodeEvent.undo = function()
								{
									if (this.childNodes.count() == 1 && (this.childNodes.get(0) instanceof EmptyFormulaNode))
										this.childNodes.reset();
									
									//restore the dublicate
									this.insertChildNode(dublicates[0], pos);
									this.groupNode.remake();
									return true;
								};
							
							this.groupNode.remake();
							
							return true;
						}
						
						return false;
					}
					else
					{
						if (pos > 0)
						{
							var dublicates = new Array();
							dublicates.push(this.childNodes.get(pos - 1).dublicate());

							this.caretState = null;

							if (pos == this.childNodes.count())
							{
								this.removeChildNode(pos - 1);
								c = this.getLastPosition();
							}
							else
							{
								c = this.getPreviousPosition(c, params);
								this.caret.setNextState(c);
								this.removeChildNode(pos);
								c = this.caret.getNextState();
							}
							
							if (c.getPos() == -1)
								nodeEvent.caretState = this.getLastPosition();
							else
								nodeEvent.caretState = c;

							nodeEvent.undoActionNodePos = this.getCaretPosition();
							
							nodeEvent.undo = function()
								{
									//restore dublicate
									this.insertChildNode(dublicates[0], pos - 1);
									this.groupNode.remake();
									return true;
								};
							
							return true;
						}
						
						return false;
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
		
					nodeEvent.undo = function()
						{
							//restore dublicates
							for (var i = 0; i < dublicates.length; ++i)
								this.insertChildNode(dublicates[i], pos + i);
							
							return true;
						};
					
					return true;
				}
			}
			
			return this._super(node, pos, len, nodeEvent, command);
		},
		
		doInsertLine : function(nodeEvent, command)
		{
			return false;
		},

		createDivisionFormulaNode : function(nodeEvent, command)
		{
			var pos = nodeEvent.caretState.getPos();
			
			var n = new DivisionFormulaNode(this, pos, this.nte);
			var g = new GroupFormulaNode(n, 0, this.nte);
			var m = new EmptyFormulaNode(g, 0, this.nte);
			
			nodeEvent.caretState = new CaretState(g, 0);

			g = new GroupFormulaNode(n, 2, this.nte);
			m = new EmptyFormulaNode(g, 0, this.nte);
			
			n.render();
			this.groupNode.remake();
			
			nodeEvent.undoActionNodePos = this.getCaretPosition();

			nodeEvent.undo = function(nodeEvent, command)
				{
					this.removeChildNode(pos);
					return true;
				};

			return true;
		},
		
		createExponentationFormulaNode : function(nodeEvent, command)
		{
			var pos = nodeEvent.caretState.getPos();
			
			var n = new ExponentiationFormulaNode(this, pos, this.nte);
			var g = new GroupFormulaNode(n, 0, this.nte);
			var m = new EmptyFormulaNode(g, 0, this.nte);
			
			nodeEvent.caretState = new CaretState(g, 0);

			g = new GroupFormulaNode(n, 2, this.nte);
			m = new EmptyFormulaNode(g, 0, this.nte);
			
			n.render();
			this.groupNode.remake();
			
			nodeEvent.undoActionNodePos = this.getCaretPosition();

			nodeEvent.undo = function(nodeEvent, command)
				{
					this.removeChildNode(pos);
					return true;
				};

			return true;
		},

		createBracketsFormulaNode : function(nodeEvent, command)
		{
			var pos = nodeEvent.caretState.getPos();
			var node = nodeEvent.caretState.getNode();
			var params = nodeEvent.params;
			
			if (node.parentNode instanceof BracketsFormulaNode)
			{
			}
			
			var n = new BracketsFormulaNode(this, pos, this.nte, null, params);
		},
		
		//tool functions
		
		/**
		 * Updates {this.clientRect} field by the {this.childNodes}
		 * @method updateClientRect
		 */
		updateClientRect : function()
		{
			var w = 0, h = 0;
			
			for (var i = 0; i < this.childNodes.count(); ++i)
			{
				var n = this.childNodes.get(i);
				if (n.boundingRect)
				{
					if (n.boundingRect.right > w)
						w = n.boundingRect.right;
					if (n.boundingRect.bottom > h)
						h = n.boundingRect.bottom;
//					if (n.boundingRect.width > w)
//						w = n.boundingRect.width;
//					if (n.boundingRect.height > h)
//						h = n.boundingRect.height;
				}
				else
				{
					if (n.element.clientWidth > w)
						w = n.element.clientWidth;
					if (n.element.clientHeight > h)
						h = n.element.clientHeight;
				}
			}
			
			this.clientRect.setRect(0, 0, Math.round(w), Math.round(h));
		}, 
		
		updateBoundingRect : function()
		{
			//var c = this.element.getBBox();
			var r = this.groupNode.element.getBoundingClientRect();
			this.boundingRect.setRect(r.left - this.element.offsetLeft, r.top - this.element.offsetTop, 
				this.clientRect.width, this.clientRect.height);
		},
		
		/**
		 * Returns the node's position relative to the editor.
		 * @method getPosBounds
		 * @param {int} pos position
		 */
		getPosBounds : function(pos, posRect)
		{
			var n = this.childNodes.get(pos == this.childNodes.count() ? pos - 1 : pos);
			var cx = (pos == this.childNodes.count() ? n.boundingRect.right : n.boundingRect.left);
			var cy = n.boundingRect.top;
			
			var p = this;
			
			while (p && p != this.groupNode)
			{
				if (p.boundingRect)
				{
					cx += p.boundingRect.left;
					cy += p.boundingRect.top;
				}
				p = p.parentNode;
			}
			
			cx = Math.round(cx) + 1;
			cy = Math.round(cy);
			
//			this.groupNode.updateBoundingRect();
//			
//			cx += this.groupNode.boundingRect.left;
//			if (pos == this.childNodes.count())
//				cx += n.clientRect.width;
//			//cx -= r.left;
//			cy += this.groupNode.boundingRect.top;

			//var s = nte.window.getComputedStyle(this.groupNode.parentNode.element, null);
			//var h = parseInt(s.getPropertyValue("outline-width"));

			//s = nte.window.getComputedStyle(this.groupNode.element, null);
			//h = parseInt(s.getPropertyValue("padding-left"));

			//var r = new Rectangle();
			//this.groupNode.getNodeBounds(r);
			
			//this.groupNode.updateBoundingRect();
			//var r = this.groupNode.boundingRect;

			//cx += r.left - this.groupNode.leftOffset;
			//cx += r.left;
			//cy += r.top;
			//cy += h;

			posRect.setRect(cx, cy, pos == this.childNodes.count() ? 1 : n.clientRect.width, n.boundingRect.height);

//			posRect.setRect(cx + this.nte.editor.scrollLeft, 
//				cy + this.nte.editor.scrollTop, 
//				pos == this.childNodes.count() ? 1 : n.clientRect.width, 
//				n.boundingRect.height);

//			posRect.setRect(cx + this.nte.editor.scrollLeft, 
//				cy + this.nte.editor.scrollTop, 
//				pos == this.childNodes.count() ? 1 : n.clientRect.width, 
//				//n.clientRect.height - parseInt(this.groupNode.element.style.verticalAlign));
//				n.boundingRect.height);
//				//n.clientRect.height);
		},

		getRelativePosBounds : function(pos, rect)
		{
			this.getPosBounds(pos, rect);
			
			var r = this.groupNode.boundingRect;

//			rect.setRect(rect.left + this.nte.editor.scrollLeft + r.left, 
//				rect.top + this.nte.editor.scrollTop + r.top, 
//				pos == this.childNodes.count() ? 1 : this.clientRect.width, 
//				this.boundingRect.height);
			rect.setRect(rect.left + r.left, 
				rect.top + r.top, 
				pos == this.childNodes.count() ? 1 : rect.width, 
				rect.height);
				//pos == this.childNodes.count() ? 1 : this.clientRect.width, 
				//this.boundingRect.height);
		},

		setEmpty : function()
		{
			this.childNodes.forEach("setEmpty", []);
		},
		
		//event functions
		
//		onAfterChildInserted : function(nodeEvent)
//		{
//			this.groupNode.remake();
//		}, 
//		
//		onAfterTextInserted : function(nodeEvent)
//		{
//			this.groupNode.remake();
//		}
		
		//test functions
		
		toTex : function(braces)
		{
			return this.childNodes.toTex(braces);
		}
	}
);
