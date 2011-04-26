/**
 * Text formula node
 * @class TextFormulaNode
 * @constructor
 */
var TextFormulaNode = ForeignObjectFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super(parentNode, pos, nte);
			this.className = "TextFormulaNode";
			
			this.element.setAttribute("width", 1);
			this.element.setAttribute("height", 1);
			
			this.text = this.createChildNode(window["SpanNode"], "", 0);
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		createChildNode : function(nodeClassType, pos)
		{
			if (nodeClassType == window["SpanNode"])
				return new FormulaSpanNode(this, pos, this.nte);
			return new nodeClassType(this, pos, this.nte);
		}, 

		insertChildNode : function(childNode, pos)
		{
			//replace the child span node
			if (this.isEmpty())
				this.childNodes.reset();
			this._super(childNode, pos);
			this.text = this.childNodes.get(0);
			delete this.img;
			
			if (this.groupNode)
				this.groupNode.remake();
		},

		addChildNode : function(childNode)
		{
			//replace the child span node
			if (this.isEmpty())
				this.childNodes.reset();
			this._super(childNode);
			this.text = this.childNodes.get(0);
			delete this.img;
			
			if (this.groupNode)
				this.groupNode.remake();
		}, 

		remake : function()
		{
			this.childNodes.forEach("remake", []);

			if (this.text && !this.img)
			{
				var r = new Rectangle();
				this.text.getNodeBounds(r);
				
				if (this.text.element.textContent.length > 0)
				{
					//insert an image for calculating the baseline of the content text
					this.img = this.document.createElement("img");
					this.img.style.width = 0;
					this.img.style.height = 0;
					this.img.src = "absent.jpg";
					this.text.element.parentNode.insertBefore(this.img, null);
					var w = r.width;
					this.element.setAttribute("width", w);
					this.element.setAttribute("height", r.height);
					
					if (this.groupNode.element.width.baseVal.value < w)
						this.groupNode.size(w, this.groupNode.element.height.baseVal.value);
				}
			}

			this.updateClientRect();
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
			//update the baseline
			if (this.img)
			{
				//this.baseline = this.img.y + this.img.offsetHeight - this.text.element.offsetTop + this.element.y.baseVal.value;
				//this.baseline = this.img.y + this.text.element.offsetHeight / 2;
				//this.baseline = this.text.element.offsetHeight / 2;
				this.baseline = this.img.offsetTop - this.text.element.offsetTop;
				this.text.element.parentNode.removeChild(this.img);
				this.img = null;
			}
			this.updateClientRect();
		}, 

		move : function(x, y)
		{
			this.drawLib.move(x, y, this.element);
			this.updateBoundingRect();
		}, 

		//caret functions
		
		getNextPosition : function(relativeState, params)
		{
			if (this.childNodes.count() > 0 && this.childNodes.get(0).childNodes.get(0).empty)
				return null;
			return this._super(relativeState, params);
		},

		getPreviousPosition : function(relativeState, params)
		{
			if (this.childNodes.count() > 0 && this.childNodes.get(0).childNodes.get(0).empty)
				return null;
			return this._super(relativeState, params);
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

		//tool functions
		
		updateClientRect : function()
		{
			if (this.text)
			{
				var r = new Rectangle();
				this.text.getNodeBounds(r);
				this.clientRect.setRect(0, 0, r.width, r.height);
			}
		},
		
		getNodeBounds : function(posRect)
		{
			var cx = this.boundingRect.left;
			var cy = this.boundingRect.top;
			var p = this;
			
			while (p && p != this.groupNode)
			{
				if (p.boundingRect)
				{
					cx += p.boundingRect.left;
					cy += p.boundingRect.top;
				}
				else
				{
					cx += p.element.offsetLeft;
					cy += p.element.offsetTop;
				}
				p = p.parentNode;
			}
			
			var r = this.nte.editor.getBoundingClientRect();
			var rect = this.element.getBoundingClientRect();
			
			this.groupNode.updateBoundingRect();
			cx += this.groupNode.boundingRect.left;
			cx -= r.left;
			cy += this.groupNode.boundingRect.top;

			posRect.setRect(cx, cy, rect.width, rect.height);
		}
	}
);

var FormulaSpanNode = HtmlNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			if (parentNode)
				this.groupNode = parentNode.groupNode;

			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessFormulaNode";
			
			this._super("span", null, parentNode, pos, nte);
			
			this.className = "FormulaSpanNode";

			this.eventsHandler.addCustomEvent(this, "onaftertextinserted", this.onAfterTextInserted);
			this.eventsHandler.addCustomEvent(this, "onafterchilddeleted", this.onAfterChildDeleted);
			
			this.addTextNode(null);
		}, 

		insertChildNode : function(childNode, pos)
		{
			//replace the child text node
			if (this.isEmpty())
				this.childNodes.reset();
			this._super(childNode, pos);
		},

		addChildNode : function(childNode)
		{
			//replace the child text node
			if (this.isEmpty())
				this.childNodes.reset();
			this._super(childNode);
		}, 

		addTextNode : function(textNode)
		{
			if (this.isEmpty())
				this.childNodes.reset();
			new FormulaTextNode(textNode, this, this.childNodes.count(), this.nte);
		},

		createChildNode : function(nodeClassType, pos)
		{
			if (nodeClassType == window["TextNode"])
				return new FormulaTextNode(null, this, pos, this.nte);
			return new nodeClassType(this, pos, this.nte);
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

		dublicate : function(parent)
		{
			var res = this._super(parent);
			res.groupNode = this.groupNode;
			return res;
		},

		remake : function()
		{
			this.childNodes.forEach("remake", []);
		},

		update : function()
		{
			this.childNodes.forEach("update", []);
		},

		//caret functions

		moveCaretToLineBegin : function()
		{
			return this.parentNode.moveCaretToLineBegin();
		},

		moveCaretToLineEnd : function()
		{
			return this.parentNode.moveCaretToLineEnd();
		},

		getNextPosition : function(relativeState, params)
		{
			if (this.childNodes.count() > 0 && this.childNodes.get(0).empty)
				return false;
			return this._super(relativeState, params);
		},

		getPreviousPosition : function(relativeState, params)
		{
			if (this.childNodes.count() > 0 && this.childNodes.get(0).empty)
				return false;
			return this._super(relativeState, params);
		},

		getUpperPosition : function(relativeState)
		{
			return this.parentNode.getUpperPosition(relativeState);
		},
		
		getLowerPosition : function(relativeState)
		{
			return this.parentNode.getLowerPosition(relativeState);
		},

		//command functions

		doInsert : function(pos, nodeEvent, command)
		{
			return this.parentNode.doInsert(pos, nodeEvent, command);
		},

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			if (this.childNodes.count() == 1)
				return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 0, nodeEvent, command);
			
			return this._super(node, pos, len, nodeEvent, command);
		},

		createDivisionFormulaNode : function(nodeEvent, command)
		{
			return this.parentNode.createDivisionFormulaNode(nodeEvent, command);
		},

		createExponentationFormulaNode : function(nodeEvent, command)
		{
			return this.parentNode.createExponentationFormulaNode(nodeEvent, command);
		},

		mergeNode : function(caretState)
		{
			this._super(caretState);
			
			if (caretState.getNode() == null || caretState.getPos() == -1)
				caretState.setCaretState(this.getFirstPosition());
			
			this.groupNode.remake();
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

		//tool functions
		
		getNodeBounds : function(posRect)
		{
			var rect = this.element.getBoundingClientRect();
			
			posRect.setRect(Math.round(this.element.offsetLeft + this.nte.editor.scrollLeft), 
				Math.round(this.element.offsetTop + this.nte.editor.scrollTop), 
				rect.width, 
				rect.height);
		},
		
		//test functions
		
		toTex : function()
		{
			return this.childNodes.toTex();
		}
	}
);

var FormulaTextNode = TextNode.extend(
	{
		init : function(textNode, parentNode, pos, nte)
		{
			this._super(textNode, parentNode, pos, nte);
			
			this.eventsHandler.addCustomEvent(this, "onupdated", this.onUpdated);
			
			this.className = "FormulaTextNode";
		},
		
		mergeNode : function(caretState)
		{
			this._super(caretState);
			this.parentNode.groupNode.remake();
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

		//caret functions
		
		renderCaret : function(selectedNode, range)
		{
			var r = this.tempRect;
			if (this.caret.currentState.beginCaretPos)
				this.getPosBounds(this.caret.currentState.getSelectionStart(), r);
			else
				this.getPosBounds(this.caret.currentState.getSelectionEnd(), r);

			r.width = 1;
			this.caret.renderFormulaCaret(r, this.parentNode.groupNode);
		},

		moveCaretToLineBegin : function()
		{
			return this.parentNode.moveCaretToLineBegin();
		},

		moveCaretToLineEnd : function()
		{
			return this.parentNode.moveCaretToLineEnd();
		},

		getPreviousPosition : function(relativeState, params)
		{
			if (!relativeState)
				res = new CaretState(this, this.element.length);
			else
			{
				var pos = relativeState.getSelectionStart();
				var res = null;
	
				if (pos > 0)
					res = new CaretState(this, pos - 1);
				else
					res = this.parentNode.getPreviousPosition(relativeState, params);
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
				//this.parentNode.parentNode.update();
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
			else
			{
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

		//tool functions

		getPosBounds : function(pos, posRect)
		{
			if (this.nte.isIE)
			{
				var textRange = this.document.body.createTextRange();
				textRange.moveToElementText(this.element);
				textRange.collapse(true);
				textRange.moveStart("character", pos);
				textRange.moveEnd("character", pos + 1);
			}
			else
			{
				var textRange = this.document.createRange();
				if (pos == this.element.length)
				{
					textRange.setStart(this.element, pos - 1);
					textRange.setEnd(this.element, pos);
				}
				else
				{
					textRange.setStart(this.element, pos);
					textRange.setEnd(this.element, pos + 1);
				}
			}

			var rect = textRange.getBoundingClientRect();
			var p = this.parentNode;

			if (this.nte.isWebKit)
			{
				var cx = 0;
				var cy = 0;
				while (p && p != this.parentNode.groupNode)
				{
					if (p.boundingRect)
					{
						cx += p.boundingRect.left;
						cy += p.boundingRect.top;
					}
					p = p.parentNode;
				}
				
				cy = Math.round(cy);

				textRange.setStart(this.element, 0);
				textRange.setEnd(this.element, 1);
				var r = textRange.getBoundingClientRect();

				posRect.setRect((pos == this.element.length ? rect.right - r.left : rect.left - r.left) + cx, 
					cy, 
					rect.width, 
					rect.height);
			}
			else
			{
				var cx = 0;
				var cy = rect.top;
				while (p && p != this.parentNode.groupNode)
				{
					if (p.boundingRect)
					{
						cx += p.boundingRect.left;
						cy += p.boundingRect.top;
					}
					p = p.parentNode;
				}
				
				cx = Math.round(cx);
				cy = Math.round(cy);
				
				posRect.setRect((pos == this.element.length ? rect.right : rect.left) + cx, 
					rect.top + cy, 
					rect.width, 
					rect.height);
			}
		},
		
		getRelativePosBounds : function(pos, posRect)
		{
			if (this.nte.isIE)
			{
				var textRange = this.document.body.createTextRange();
				textRange.moveToElementText(this.element);
				textRange.collapse(true);
				textRange.moveStart("character", pos);
				textRange.moveEnd("character", pos + 1);
			}
			else
			{
				var textRange = this.document.createRange();
				if (pos == this.element.length)
				{
					textRange.setStart(this.element, pos - 1);
					textRange.setEnd(this.element, pos);
				}
				else
				{
					textRange.setStart(this.element, pos);
					textRange.setEnd(this.element, pos + 1);
				}
			}

			var rect = textRange.getBoundingClientRect();
			var p = this.parentNode;
			
			if (this.nte.isWebKit)
			{
				var cx = 0;
				var cy = 0;
				while (p && p != this.parentNode.groupNode)
				{
					if (p.boundingRect)
					{
						cx += p.boundingRect.left;
						cy += p.boundingRect.top;
					}
					p = p.parentNode;
				}
				
				cy = Math.round(cy);

				textRange.setStart(this.element, 0);
				textRange.setEnd(this.element, 1);
				var r = textRange.getBoundingClientRect();
				
				this.parentNode.groupNode.updateBoundingRect();
				var b = this.parentNode.groupNode.boundingRect;

				posRect.setRect((pos == this.element.length ? rect.right - r.left : rect.left - r.left) + cx + b.left, 
					cy + b.top, 
					rect.width, 
					rect.height);
			}
			else
			{
				var cx = 0;
				var cy = rect.top;
				
				while (p && p != this.parentNode.groupNode)
				{
					if (p.boundingRect)
					{
						cx += p.boundingRect.left;
						cy += p.boundingRect.top;
					}
					p = p.parentNode;
				}
				
				cx = Math.round(cx);
				cy = Math.round(cy);
				
				//var r = this.nte.editor.getBoundingClientRect();
				this.parentNode.groupNode.updateBoundingRect();
				var b = this.parentNode.groupNode.boundingRect;
				
				posRect.setRect((pos == this.element.length ? rect.right : rect.left) + cx + b.left, 
					rect.top + cy + b.top, 
					rect.width, 
					rect.height);
			}
		},

		getNodeBounds : function(posRect)
		{
			this.parentNode.getNodeBounds(posRect);

			var pos = 0;
			var textRange = this.document.createRange();
			textRange.setStart(this.element, pos);
			textRange.setEnd(this.element, pos + 1);
			var rect = textRange.getBoundingClientRect();

			var left = posRect.left + rect.left;
			var top = posRect.top + rect.top;
			
			pos = this.element.length;
			textRange.setStart(this.element, pos > 0 ? pos - 1 : 0);
			textRange.setEnd(this.element, pos);
			rect = textRange.getBoundingClientRect();
			
			posRect.setRect(left, top, rect.left, rect.bottom);
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
