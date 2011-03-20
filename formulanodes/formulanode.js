/**
 * Base class for formula nodes
 * @class FormulaNode
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
			this.clientRect = new Rect();
			this.boundingRect = new Rect();
			
			/**
			 * Node baseline
			 * @public
			 */
			this.baseline = 0;
			
			this._super(nodeType, element, parentNode, pos, nte);
		}, 

		insertChildNode : function(childNode, pos)
		{
			this._super(childNode, pos);
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
				//n.move(n.boundingRect.left, this.baseline);
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
			//caretState.store();
			this._super();
			//caretState.restore();
			
			if (caretState.getNode() == null || caretState.getPos() == -1)
				caretState.setCaretState(this.getFirstPosition());
			
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
			var r = new Rect();
			if (this.caret.currentState.beginCaretPos)
				this.getPosBounds(this.caret.currentState.getSelectionStart(), r);
			else
				this.getPosBounds(this.caret.currentState.getSelectionEnd(), r);
			
			this.caret.paper.clearShapes();
			
			//r.setRect(r.left - 1, r.top + 1, r.width + 1, r.height - 1);
			//r.setRect(r.left, r.top, r.width, r.height);
			r.setRect(r.left - 3, r.top, r.width + 3, r.height + 1);
			this.caret.paper.move(r.left, r.top);
			this.caret.paper.setSize(r.width + 1, r.height + 1);

			if (this.caret.currentState.beginCaretPos)
				this.caret.paper.line(0, 0, 0, r.height, "black");
			else
				this.caret.paper.line(r.right, 0, r.right, r.height, "black");
			var t = this.caret.paper.line(0, r.height + 1, r.width, r.height + 1, "black");
			this.drawLib.animate("visibility", "visible", "hidden", "1", "indefinite", t.parentNode);
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

			nodeEvent.caretState.store();
			this.insertChildNode(node, pos);
			nodeEvent.caretState.restore();
			
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
									nodeEvent.caretState = this.getLastPosition();
								else if (pos < this.childNodes.count())
								{
									//if a node has caret positions inside, move to the last position
									var p = this.childNodes.get(pos).getLastPosition();
									if (p)
										nodeEvent.caretState = p;
									nodeEvent.caretState = this.getNextPosition(nodeEvent.caretState);
								}
								
								nodeEvent.caretState.store();
								this.removeChildNode(pos);
								nodeEvent.caretState.restore();

								if (nodeEvent.caretState.getPos() == -1)
									nodeEvent.caretState = this.getLastPosition();
							}
							else
							{
								//removing the last item
								this.removeChildNode(pos);
								//insert an empty node
								new EmptyFormulaNode(this, pos, this.nte);
								nodeEvent.caretState = new CaretState(this, pos);
							}

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

							nodeEvent.caretState.store();
							this.removeChildNode(pos - 1);
							nodeEvent.caretState.restore();

							if (nodeEvent.caretState.getPos() == -1)
								nodeEvent.caretState = this.getLastPosition();

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
			
			this.clientRect.setRect(0, 0, w, h);
		}, 
		
		updateBoundingRect : function()
		{
			var c = this.element.getBBox();
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
			//n.updateBoundingRect();
			var cx = (pos == this.childNodes.count() ? n.boundingRect.right : n.boundingRect.left);
			//var cx = 0;
			var cy = n.boundingRect.top;
			//var cy = 0;
			
			var p = this;
			
			while (p && p != this.groupNode)
			{
				cx += p.boundingRect.left;
				cy += p.boundingRect.top;
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

			//var r = new Rect();
			//this.groupNode.getNodeBounds(r);
			var r = this.groupNode.boundingRect;

			//cx += r.left - this.groupNode.leftOffset;
			cx += r.left;
			cy += r.top;
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
		
		toTex : function()
		{
			return this.childNodes.toTex();
		}
	}
);
