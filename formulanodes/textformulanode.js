var TextFormulaNode = FormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;

			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessFormulaNode";

			var el = this.drawLib.createElement("text", parentNode ? parentNode.element : null);
			this._super("", el, parentNode, pos, nte);

			this.createChildNode(window["TextNode"], "", 0);
			
			this.eventsHandler.addCustomEvent(this, "onaftertextinserted", this.onAfterTextInserted);
			this.eventsHandler.addCustomEvent(this, "onafterchilddeleted", this.onAfterChildDeleted);

			this.className = "TextFormulaNode";
		},
		
		createChildNode : function(nodeClassType, pos)
		{
			if (nodeClassType == window["TextNode"])
				return new FormulaTextNode(null, this, pos, this.nte);
			return new nodeClassType(this, pos, this.nte);
		},

		insertChildNode : function(childNode, pos)
		{
			//replace the child span node
			if (this.isEmpty())
				this.childNodes.reset();
			this._super(childNode, pos);
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		addChildNode : function(childNode)
		{
			//replace the child span node
			if (this.isEmpty())
				this.childNodes.reset();
			this._super(childNode);
			
			if (this.groupNode)
				this.groupNode.remake();
		}, 

		addTextNode : function(textNode)
		{
			this.childNodes.reset();
			new FormulaTextNode(textNode, this, this.childNodes.count(), this.nte);
		},
		
		remake : function()
		{
		},

		dublicate : function(parent)
		{
			var resNode = new TextFormulaNode(parent, this.parentNode.getChildPos(this), this.nte);
			resNode.groupNode = this.groupNode;
			
			resNode.caretState = this.caretState;
			resNode.childNodes.copyFrom(this.childNodes, resNode);
			
			return resNode;
		}, 

		update : function()
		{
			this.updateClientRect();
			var c = this.nte.window.getComputedStyle(this.element, null);
			var s = parseInt(c["fontSize"]);
			this.baseline = s;
			
			this.element.setAttribute("dy", s - this.clientRect.height);
		},

		updateBoundingRect : function()
		{
			if (this.element.x.baseVal.numberOfItems > 0)
			{
				this.boundingRect.setRect(this.element.x.baseVal.getItem(0).value, this.element.y.baseVal.getItem(0).value - this.clientRect.height, 
					this.clientRect.width, this.clientRect.height);
			}
		},

		updateClientRect : function()
		{
			var b = this.element.getBBox();
			this.clientRect.setRect(0, 0, Math.round(b.width), Math.round(b.height));
		},

		move : function(x, y)
		{
			this.drawLib.move(x, y + this.clientRect.height, this.element);
			this.updateBoundingRect();
		},

		//command functions

		doInsert : function(pos, nodeEvent, command)
		{
			if (pos > 0 && this.parentNode.childNodes.getLast() != this)
			{
				var c = this.getNextPosition(nodeEvent.caretState);
				this.caret.setNextState(c);
			}
			
			if (!this.parentNode.doInsert(pos == 0 ? this.parentNode.getChildPos(this) : this.parentNode.getChildPos(this) + 1, nodeEvent, command))
				return false;
			
			if (pos > 0)
			{
				var p = this.parentNode.getChildPos(this);
				if (p < this.parentNode.childNodes.count() - 2 && c)
				{
					c = this.caret.getNextState();
					nodeEvent.caretState = c;
				}
				else
					nodeEvent.caretState = this.parentNode.getLastPosition();
			}
			
			return true;
		},

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			if (this.childNodes.count() == 1)
				return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 0, nodeEvent, command);
			
			return this._super(node, pos, len, nodeEvent, command);
		},
		
		createDivisionFormulaNode : function(nodeEvent, command)
		{
			//the result division node will have this node in the dividend
			var n = new DivisionFormulaNode(this.parentNode, this.parentNode.getChildPos(this), this.nte);
			var g = new GroupFormulaNode(n, 0, this.nte);
			g.moveChildNode(this, 0);
			g = new GroupFormulaNode(n, 2, this.nte);
			var m = new EmptyFormulaNode(g, 0, this.nte);
			
			n.render();
			this.groupNode.remake();
			
			nodeEvent.caretState = new CaretState(g, 0);
			nodeEvent.undoActionNodePos = this.getCaretPosition();

			nodeEvent.undo = function(nodeEvent, command)
				{
					var p = this.parentNode.parentNode.parentNode;
					var pos = p.getChildPos(this.parentNode.parentNode);
					p.insertChildNode(this.dublicate(), pos);
					p.removeChildNode(pos + 1);
					return true;
				};

			return true;
		},

		createExponentationFormulaNode : function(nodeEvent, command)
		{
			//the result exponentation node will have this node in the base 
			var n = new ExponentiationFormulaNode(this.parentNode, this.parentNode.getChildPos(this), this.nte);
			var g = new GroupFormulaNode(n, 0, this.nte);
			g.moveChildNode(this, 0);
			g = new GroupFormulaNode(n, 2, this.nte);
			var m = new EmptyFormulaNode(g, 0, this.nte);

			n.render();
			this.groupNode.remake();

			nodeEvent.caretState = new CaretState(g, 0);
			nodeEvent.undoActionNodePos = this.getCaretPosition();

			nodeEvent.undo = function(nodeEvent, command)
				{
					var p = this.parentNode.parentNode.parentNode;
					var pos = p.getChildPos(this.parentNode.parentNode);
					p.insertChildNode(this.dublicate(), pos);
					p.removeChildNode(pos + 1);
					this.groupNode.remake();
					return true;
				};

			return true;
		},

		//caret functions
		
		getFirstPosition : function()
		{
			if (this.childNodes.count() > 0)
				return this.childNodes.getFirst().getFirstPosition();
			return null;
		},
		
		getLastPosition : function()
		{
			if (this.childNodes.count() > 0)
				return this.childNodes.getLast().getLastPosition();
			return null;
		},

		getNextPosition : function(relativeState, params)
		{
			if (this.childNodes.count() > 0 && this.childNodes.get(0).isEmpty())
				return null;
			if (relativeState && relativeState.checkInNode(this))
				return this._super(relativeState, params);
			return new CaretState(this.childNodes.get(0), 0);
		},

		getPreviousPosition : function(relativeState, params)
		{
			if (this.childNodes.count() > 0 && this.childNodes.get(0).isEmpty())
				return null;
			if (relativeState && relativeState.checkInNode(this))
			{
				var pos = relativeState.getSelectionStart();
				if (pos > 0)
					return new CaretState(this.childNodes.get(0), pos - 1);
			}
			return this._super(relativeState, params);
		},
		
		setLevel : function(level)
		{
			if (this.level != level)
			{
				if (this.levelClasses[this.level])
					this.removeClass(this.levelClasses[this.level]);
				
				this.level = level;
				
				if (this.levelClasses[this.level])
					this.addClass(this.levelClasses[this.level]);
			}
		},

		//event functions
		
		onAfterTextInserted : function(nodeEvent)
		{
			this.groupNode.remake();
		},
		
		onAfterChildDeleted : function(nodeEvent)
		{
			this.groupNode.remake();
		},

		//test functions
		
		toTex : function()
		{
			return this.childNodes.get(0).toTex();
		}
	}
	);

var FormulaTextNode = TextNode.extend(
	{
		init : function(textNode, parentNode, pos, nte)
		{
			this._super(textNode, parentNode, pos, nte);
			this.className = "FormulaTextNode";

			this.eventsHandler.addCustomEvent(this, "onupdated", this.onUpdated);
		},
		
		remake : function()
		{
		},

		dublicate : function(parent)
		{
			var t = this.nte.document.createTextNode(this.element.textContent);
			var resNode = new FormulaTextNode(t, parent, this.parentNode.getChildPos(this), this.nte);
			resNode.caretState = this.caretState;
			
			resNode.groupNode = this.groupNode;

			return resNode;
		}, 

		getRelativePosBounds : function(pos, posRect)
		{
			var textRange = this.document.createRange();
			if (pos == this.element.length)
			{
				textRange.setStart(this.element, pos > 0 ? pos - 1 : 0);
				textRange.setEnd(this.element, pos);
			}
			else
			{
				textRange.setStart(this.element, pos);
				textRange.setEnd(this.element, pos + 1);
			}

			var rect;
			if (this.nte.isWebKit)
			{
				rect = textRange.getClientRects()[0];
				if (!rect)
					rect = textRange.getBoundingClientRect();
				
				if ((!rect || (rect.width == 0 && rect.height == 0)) && this.element.previousSibling)
					rect = this.element.previousSibling.getBoundingClientRect();
			}
			else
			{
				rect = textRange.getBoundingClientRect();
			}
			
			var r = this.nte.editor.getBoundingClientRect();

			posRect.setRect(Math.round((pos == this.element.length ? rect.right + this.nte.editor.scrollLeft : rect.left + this.nte.editor.scrollLeft) - r.left), 
				Math.round(rect.top + this.nte.editor.scrollTop - r.top), 
				Math.round(0), 
				Math.round(rect.height));
		},

		//caret functions
		
		getNextPosition : function(relativeState, params)
		{
			if (!relativeState)
				res = new CaretState(this, 1);
			else
			{
				var pos = relativeState.getSelectionStart();
				var res = null;
	
				if (pos == this.element.length - 1)
					res = new CaretState(this, pos + 1);
				else if (pos < this.element.length)
					res = new CaretState(this, pos + 1);
				else
					res = this.parentNode.getNextPosition(relativeState, params);
			}
			
			return res;
		}, 

		getPreviousPosition : function(relativeState, params)
		{
			if (!relativeState)
				res = new CaretState(this, this.element.length);
			else
			{
				var pos = relativeState.getSelectionStart();
				var res = null;
	
				if (pos == 0 || pos == 1)
					res = this.parentNode.getPreviousPosition(relativeState, params);
				else
				{
					res = new CaretState(this, pos - 1);
					if (!res)
						res = this.parentNode.getPreviousPosition(relativeState, params);
				}
			}
			
			return res;
		},

		hasSingleLine : function()
		{
			return true;
		},

		//command functions

		doInsert : function(pos, nodeEvent, command)
		{
			if (nodeEvent.text == " ")
				return false;
			
			if (nodeEvent.node)
				return this.parentNode.doInsert(nodeEvent.caretState.getPos() == 0 ? 0 : 1, nodeEvent, command);
			
			if (this._super(pos, nodeEvent, command))
			{
				this.parentNode.parentNode.remake();
				this.parentNode.groupNode.remake();
				return true;
			}
			
			return false;
		},

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			if ((pos == this.element.length && nodeEvent.right) || (pos == 0 && !nodeEvent.right))
				return false;
			
			if (len == 0)
			{
				if (this.element.length == 1)
				{
					nodeEvent.right = true;
					if (!this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 0, nodeEvent, command))
						return false;
					this.parentNode.groupNode.remake();
					return true;
				}
			}
			
			if (!this._super(node, pos, len, nodeEvent, command))
				return false;
			this.parentNode.groupNode.remake();
			
			return true;
		},

		createDivisionFormulaNode : function(nodeEvent, command)
		{
			return this.parentNode.createDivisionFormulaNode(nodeEvent, command);
		},

		createExponentationFormulaNode : function(nodeEvent, command)
		{
			return this.parentNode.createExponentationFormulaNode(nodeEvent, command);
		},

		//editing
		
		split : function(pos, command)
		{
			var p = this.parentNode.getChildPos(this);
			if (pos == 0)
			{
				var n = new FormulaTextNode(null, this.parentNode, p, this.nte);
				//store the parameter
				command.setParam(this, "leftSplit", true);
			}
			else
			{
				if (pos < this.element.data.length)
					var t = this.element.splitText(pos);
				var n = new FormulaTextNode(t, this.parentNode, p + 1, this.nte);
				if (t)
					this.element.parentNode.removeChild(t);
				//store the parameter
				command.setParam(this, "leftSplit", false);
			}
			
			return n;
		}, 
		
		merge : function(command)
		{
			var pos = this.parentNode.getChildPos(this);
			if (pos == -1)
				return null;

			//restore the parameter
			var leftSplit = command.getParam(this, "leftSplit");
			
			if (leftSplit)
			{
				if (pos > 0)
				{
					var n = this.parentNode.childNodes.get(pos - 1);
					if (n instanceof FormulaTextNode)
					{
						this.element.data = n.element.data + this.element.data;
						this.parentNode.removeChildNode(pos - 1);
						return this;
					}
				}
			}
			else
			{
				if (pos + 1 < this.parentNode.childNodes.count())
				{
					var n = this.parentNode.childNodes.get(pos + 1);
					if (n instanceof FormulaTextNode)
					{
						this.element.data += n.element.data;
						this.parentNode.removeChildNode(pos + 1);
						return this;
					}
				}
			}
			
			return null;
		}, 
		
		mergeWithNextNode : function(nodeEvent, command)
		{
			var pos = this.parentNode.getChildPos(this);
			if (pos + 1 < this.parentNode.childNodes.count())
			{
				var n = this.parentNode.childNodes.get(pos + 1);
				if (n instanceof FormulaTextNode)
				{
					var i = this.element.data.length;
					this.mergeNode(nodeEvent.caretState);

					nodeEvent.resNode = this.parentNode;
					nodeEvent.undoActionNodePos = this.getCaretPosition();
					
					nodeEvent.undo = function(nodeEvent, command)
						{
							//split the text node
							var t = this.element.data.substr(i);
							this.element.data = this.element.data.substr(0, i);
							var n = this.parentNode.createChildNode(window["TextNode"], this.parentNode.getChildPos(this) + 1);
							n.element.textContent = t;

							if (this.caretState)
								this.caretState.insertSelectedNode(0, new SelectedNode(null, this, 0, this.element.data.length));

							return true;
						};
					
					return true;
				}
			}
			
			return false;
		}, 

		//event functions
		
		onUpdated : function(nodeEvent)
		{
			this.parentNode.groupNode.remake();
		},

		//test functions

		toTex : function()
		{
			return this.element.data;
		}
	}
	);
