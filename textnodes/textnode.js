/**
 * @constructor
 */
var TextNode = HtmlNode.extend(
	{
		init : function(textNode, parentNode, pos, nte)
		{
			var el = nte.document.createTextNode(textNode ? textNode.textContent : "");
			this._super(0, el, parentNode, pos, nte);
		},

		destroy : function()
		{
			if (this.element.parentNode)
				this.element.parentNode.removeChild(this.element);
		},
		
		getLength : function()
		{
			return this.element.length;
		}, 

		getPositionsCount : function()
		{
			if (this.element.length == 0)
				return 0;
			if (this.parentNode.childNodes.count() == 1)
				return this.element.length + 1;
			
			var p = this.parentNode.getChildPos(this);
			if (p == 0)
				return this.element.length + 1;
			
			if (this.parentNode.childNodes.get(p - 1).element.nodeName.toLowerCase() == "#text")
				return this.element.length;
			return this.element.length + 1;
		}, 

		isEmpty : function()
		{
			return this.element.length == 0;
		}, 

		//caret functions
		
		/**
		 * Renders the caret.
		 * @method renderCaret
		 */
		renderCaret : function(selectedNode, range)
		{
			var c = this.caret.currentState;
			var s = c.getSelectedNode(this);
			if (!s)
				return;
			var p = this.tempRect;

			//whether the caret is placed in this node?
			if (c.beginCaretPos && c.getSelectedNodePos(s) == 0)
				this.getRelativePosBounds(s.getPos(), p);
			else if (!c.beginCaretPos && c.getSelectedNodePos(s) == c.getSelectedNodesCount() - 1)
				this.getRelativePosBounds(s.getPos() + s.length, p);

			this.caret.renderTextCaret(p, this, s.getPos(), s.length, range);
		}, 

		setCaretToNodeBegin : function()
		{
			return new CaretState(this, 0);
		}, 

		setCaretToNodeEnd : function()
		{
			return new CaretState(this, this.element.length);
		}, 

		getFirstPosition : function()
		{
			return new CaretState(this, 0);
		}, 

		getLastPosition : function()
		{
			return new CaretState(this, this.element.length);
		}, 

		/**
		 * Returns the next caret position.
		 * @method getNextPosition
		 * @param {CaretState} relativeState Relative caret state
		 */
		getNextPosition : function(relativeState, params)
		{
			if (!relativeState)
				res = new CaretState(this, 1);
			else
			{
				var pos = relativeState.getSelectionStart();
				var res = null;
	
				if (pos == this.element.length - 1)
				{
					res = new CaretState(this, pos + 1);
					
					relativeState.getRect(this.tempRect);
					var t = this.tempRect.left;
					res.getRect(this.tempRect);
					
					if (t == this.tempRect.left)
					{
						//resolving the situation when the caret is before the last symbol in the line, which is a space, and the next node begins from the next line
						var p = this.parentNode;
						while (p)
						{
							var i = p.getFirstLevelChildPos(this);
							if (i < p.childNodes.count() - 1)
								break;
							p = p.parentNode;
						}
						
						for (var pos = i + 1; pos < p.childNodes.count(); ++pos)
						{
							var n = p.childNodes.get(pos);
							//whether to skip the first position
							res = n.getFirstPosition();
							if (res)
								break;
						}
						
						if (!res && this.parentNode)
							res = this.parentNode.getNextPosition(relativeState, params);
					}
				}
				else if (pos < this.element.length)
					res = new CaretState(this, pos + 1);
				else
					res = this.parentNode.getNextPosition(relativeState, params);
			}
			
			return res;
		}, 
		
		/**
		 * Returns previous caret position.
		 * @method getPreviousPosition
		 * @param {CaretState} relativeState Relative caret state
		 */
		getPreviousPosition : function(relativeState, params)
		{
			if (!relativeState)
			{
				res = new CaretState(this, this.element.length);
			}
			else
			{
				var pos = relativeState.getSelectionStart();
				var res = null;
	
				if (pos == 0 || pos == 1)
				{
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
								//resolving the situation when the caret is in the beginning of the node and the node is in the beginning of the line
								if (pos == 0)
									res = r;
								else
									res = this.getFirstPosition();
							}
						}
					}
				}
				else if (pos > 1)
					res = new CaretState(this, pos - 1);
				
				if (!res)
					res = this.parentNode.getPreviousPosition(relativeState, params);
			}
			
			return res;
		},

		getUpperPosition : function(relativeState)
		{
			return this.parentNode.getUpperPosition(relativeState);
		},

		getLowerPosition : function(relativeState)
		{
			return this.parentNode.getLowerPosition(relativeState);
		},
		
		//editing
		
		split : function(pos, command)
		{
			var p = this.parentNode.getChildPos(this);
			if (pos == 0)
			{
				var n = new TextNode(null, this.parentNode, p, this.nte);
				command.setParam(this, "leftSplit", true);
			}
			else
			{
				var t = this.element.splitText(pos);
				var n = new TextNode(t, this.parentNode, p + 1, this.nte);
				this.element.parentNode.removeChild(t);
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
					if (n instanceof TextNode)
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
					if (n instanceof TextNode)
					{
						this.element.data += n.element.data;
						this.parentNode.removeChildNode(pos + 1);
						return this;
					}
				}
			}
			
			return null;
		}, 

		//format functions
		
		getFontFamily : function()
		{
			var s = this.nte.window.getComputedStyle(this.parentNode.element, null);
			var f = s.getPropertyValue("font-family");
			return f;
		},
		
		getFontSize : function()
		{
			var s = this.nte.window.getComputedStyle(this.parentNode.element, null);
			var h = parseInt(s.getPropertyValue("font-size"));
			return h;
		},

		//command functions

		insertChild : function(nodeEvent, command)
		{
			var pos = nodeEvent.caretState.getSelectionStart();
			var p = this.parentNode.getChildPos(this);

			nodeEvent.undoActionNodePos = this.getCaretPosition();

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
		
		doInsert : function(pos, nodeEvent, command)
		{
			var caretState = nodeEvent.caretState;
			
			if (nodeEvent.node)
			{
				//node inserting
				return this._super(pos, nodeEvent, command);
			}
			
			//text inserting
			var t = nodeEvent.text;
			command.setParam(this, "pos", pos);
			
			if (pos == 0)
			{
				this.element.data = t + this.element.data;
			}
			else if (pos == this.element.data.length)
			{
				this.element.data += t;
			}
			else
			{
				var text = this.element.data;
				this.element.data = text.substr(0, pos) + t + text.substr(pos, text.length - pos);
			}

			//correcting the spaces
			var el = this.element.data;
			if (el[0] == ' ')
				this.element.data = "\u00a0" + el.substr(1, el.length - 1);
			
			for (var i = 0; i < el.length; ++i)
			{
				if (i > el.length - 1)
					break;
				var ch1 = el[i];
				var ch2 = el[i + 1];
				if (ch1 == ' ' && ch2 == ' ')
				{
					this.element.data = el.substr(0, i + 1) + "\u00a0" + el.substr(i + 2, el.length - i - 2);
					++i;
				} 
			}

			nodeEvent.caretState.setToNode(this, pos + t.length);

			return true;
		}, 
		
		undoInsert : function(nodeEvent, command)
		{
			if (nodeEvent.node)
			{
				//node inserting undo
				return this._super(nodeEvent, command);
			}
			
			//text inserting undo
			var t = nodeEvent.text;
			var pos = command.getParam(this, "pos");
			var text = this.element.data;
			
			if (pos == 0)
			{
				this.element.data = text.substr(pos + t.length, text.length - pos);
			}
			else if (pos == this.element.data.length + t.length)
			{
				this.element.data = text.substr(0, pos);
			}
			else
			{
				this.element.data = text.substr(0, pos) + text.substr(pos + t.length, text.length - pos - t.length);
			}

			nodeEvent.caretState.setToNode(this, pos);

			return true;
		},

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			var removeText = function(p, length)
			{
				var t = this.element.data;
				var text = t.substr(p, length);
				this.element.data = t.substr(0, p) + t.substr(p + length, t.length - p + length);
				
				nodeEvent.caretState.setToNode(this, p);
				nodeEvent.undoActionNodePos = this.getCaretPosition();
				
				nodeEvent.undo = function()
					{
						var t = this.element.data;
						this.element.data = t.substr(0, p) + text + t.substr(p, t.length - p);
						
						nodeEvent.caretState.setToNode(this, pos, len);
						
						return true;
					};
			};
			
			if (len == 0)
			{
				if (nodeEvent.right)
				{
					if (pos < this.element.data.length)
					{
						if (this.element.data.length == 1)
							return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 1, nodeEvent, command);
						removeText.apply(this, [pos, 1]);
					}
					else
						return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this) + 1, 0, nodeEvent, command);
				}
				else
				{
					if (pos > 0)
					{
						if (this.element.data.length == 1)
							return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 1, nodeEvent, command);
						removeText.apply(this, [pos - 1, 1]);
					}
					else
						return this.parentNode.doRemoveChild(this.parentNode, this.parentNode.getChildPos(this), 0, nodeEvent, command);
				}
			}
			else
			{
				removeText.apply(this, [pos, len]);
			}
			
			return true;
		},

		removeChild : function(nodeEvent, command)
		{
			var s = nodeEvent.caretState.selectedNodes[0];
			var pos = s.getPos();
			var len = s.length;
			var node = s.getNode();
			
			return this.doRemoveChild(node, pos, len, nodeEvent, command);
		},

		mergeNode : function(caretState)
		{
			var pos = this.parentNode.getChildPos(this);
			var node = this.parentNode.childNodes.get(pos + 1);
			var n = caretState.getNode();

			if (n == node)
				var s = caretState.findSelectedNode(node);
			
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

			var len = this.element.data.length;
			var r = node.element.data.length;
			this.element.data += node.element.data;
			this.parentNode.removeChildNode(pos + 1);

			if (s)
				caretState.replaceSelectedNode(node, this, len + s.getPos(), s.length);

			if (b1)
				caretState.addSelectedNode(new SelectedNode(caretState, this, 0, len));
			if (b2)
				caretState.addSelectedNode(new SelectedNode(caretState, this, len, r));
		},
		
//		mergeNode : function(caretState)
//		{
//			var pos = this.parentNode.getChildPos(this);
//			var node = this.parentNode.childNodes.get(pos + 1);
//			
//			var c = node.caretState;
//			if (c)
//				var s = c.findSelectedNode(node);
//			var p = this.parentNode.caretState;
//			if (p)
//			{
//				if (p.isNodeSelected(this))
//				{
//					p.removeInnerSelectedNode(this);
//					var b1 = true;
//				}
//				else if (p.isNodeSelected(node))
//				{
//					p.removeInnerSelectedNode(node);
//					var b2 = true;
//				}
//			}
//
//			var len = this.element.data.length;
//			var r = node.element.data.length;
//			this.element.data += node.element.data;
//			this.parentNode.removeChildNode(pos + 1);
//			
//			if (c && s)
//				c.replaceSelectedNode(node, this, len + s.getPos(), s.length);
//			if (b1)
//			{
//				p.addSelectedNode(new SelectedNode(p, this, 0, len));
//				this.caretState = p;
//			}
//			else if (b2)
//			{
//				p.insertSelectedNode(0, new SelectedNode(p, this, len, r));
//				this.caretState = p;
//			}
//		}, 

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
			
			var p = this.parentNode.getChildPos(this);
			
			if (pos == 0)
			{
				var t = this.element.splitText(len);
				//the right node is this node
				var s = this.element.cloneNode(false);
				this.element.data = t.data;
				this.element.parentNode.removeChild(t);
				
				//get new node
				var m = this.nte.createNode(type, null, this.parentNode, p);
				if (nodeStyle)
					m.addStyle(nodeStyle);
				
				var n = new TextNode(s, m, 0, this.nte);
				
				nodeEvent.caretState.setToNode(this.parentNode, p, 1);
				nodeEvent.resNode = this.parentNode;
				nodeEvent.undoActionNodePos = this.getCaretPosition();
				
				nodeEvent.undo = function(nodeEvent, command)
					{
						var n = this.parentNode.getChildNode(p).getChildNode(0);
						this.element.data = n.element.data + this.element.data;
						this.parentNode.removeChildNode(p);
						
						nodeEvent.caretState.setToNode(this, pos, len);
						nodeEvent.resNode = this;
						
						return true;
					};
			}
			else if (pos + len < this.getLength())
			{
				//the left node
				var t = this.element.splitText(pos);
				var s = this.element.cloneNode(false);
				var r = s.data;
				new TextNode(s, this.parentNode, p, this.nte);

				this.element.data = t.data;
				this.element.parentNode.removeChild(t);

				t = this.element.splitText(len);
				//the right node is this node
				s = this.element.cloneNode(false);
				this.element.data = t.data;
				this.element.parentNode.removeChild(t);

				//get new node
				var m = this.nte.createNode(type, null, this.parentNode, p + 1);
				if (nodeStyle)
					m.addStyle(nodeStyle);
				
				var n = new TextNode(s, m, 0, this.nte);

				nodeEvent.caretState.setToNode(this.parentNode, p + 1, 1);
				nodeEvent.resNode = this.parentNode;
				nodeEvent.undoActionNodePos = this.getCaretPosition();
				
				nodeEvent.undo = function(nodeEvent, command)
					{
						var n = this.parentNode.getChildNode(p + 1).getChildNode(0);
						this.element.data = r + n.element.data + this.element.data;
						this.parentNode.removeChildNode(p + 1);
						this.parentNode.removeChildNode(p);
						
						nodeEvent.caretState.setToNode(this, pos, len);
						nodeEvent.resNode = this;
						
						return true;
					};
			}
			else
			{
				//the left node is this node
				var t = this.element.splitText(pos);
				
				var m = this.nte.createNode(type, null, this.parentNode, p + 1);
				if (nodeStyle)
					m.addStyle(nodeStyle);
				
				var n = new TextNode(t, m, 0, this.nte);
				
				this.element.parentNode.removeChild(t);
				
				nodeEvent.caretState.setToNode(this.parentNode, p + 1, 1);
				nodeEvent.resNode = this.parentNode;
				nodeEvent.undoActionNodePos = this.getCaretPosition();
				
				nodeEvent.undo = function(nodeEvent, command)
					{
						var n = this.parentNode.getChildNode(p + 1).getChildNode(0);
						this.element.data = this.element.data + n.element.data;
						this.parentNode.removeChildNode(p + 1);
						
						nodeEvent.caretState.setToNode(this, pos, len);
						nodeEvent.resNode = this;
						
						return true;
					};
			}
			
			this.parentNode.updateCaretState();
			
			return true;
		}, 

		mergeWithNextNode : function(nodeEvent, command)
		{
			var pos = this.parentNode.getChildPos(this);
			if (pos + 1 < this.parentNode.childNodes.count())
			{
				var n = this.parentNode.childNodes.get(pos + 1);
				if (n instanceof TextNode)
				{
					var i = this.element.data.length;
					this.mergeNode(nodeEvent.caretState);

					nodeEvent.resNode = this.parentNode;
					nodeEvent.undoActionNodePos = this.getCaretPosition();
					
					nodeEvent.undo = function(nodeEvent, command)
						{
							var t = this.element.data.substr(i);
							this.element.data = this.element.data.substr(0, i);
							var n = this.parentNode.createChildNode(window["TextNode"], this.parentNode.getChildPos(this) + 1);
							n.element.data = t;

							if (this.caretState)
								this.caretState.insertSelectedNode(0, new SelectedNode(null, this, 0, this.element.data.length));

							return true;
						};
					
					return true;
				}
			}
			
			return false;
		}, 

		dublicate : function(parent)
		{
			var t = this.nte.document.createTextNode(this.element.textContent);
			var resNode = new TextNode(t, parent, this.parentNode.getChildPos(this), this.nte);
			//var resNode = this.parentNode.createChildNode(window["TextNode"], 0, this.parentNode.getChildPos(this));
			//resNode.element.data = this.element.textContent;
			resNode.caretState = this.caretState;
			
			return resNode;
		}, 

		//tool functions
		
		getNodeBounds : function(posRect)
		{
			var r = this.nte.editor.getBoundingClientRect();
			var pos = 0;
			var textRange = this.document.createRange();
			textRange.setStart(this.element, pos);
			textRange.setEnd(this.element, pos + 1);
			var rect = textRange.getBoundingClientRect();
			
			var left = Math.round(rect.left + this.nte.editor.scrollLeft - r.left);
			var top = Math.round(rect.top + this.nte.editor.scrollTop - r.top);

			pos = this.element.length;
			textRange.setStart(this.element, pos > 0 ? pos - 1 : 0);
			textRange.setEnd(this.element, pos);
			rect = textRange.getBoundingClientRect();
			
			//the result
			posRect.setRect(left, 
				top, 
				rect.left + this.nte.editor.scrollLeft + rect.width - r.left - left, 
				rect.top + this.nte.editor.scrollTop - r.top + rect.height - top);
		}, 

		getPosBounds : function(pos, posRect)
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

			var rect = textRange.getBoundingClientRect();

			posRect.setRect(Math.round(pos == this.element.length ? rect.right : rect.left), 0, 0, rect.height);
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

		//test functions
		
		setCaret : function(pos, length)
		{
			var selectedNodes = new Array();
			
			if (pos <= this.element.textContent.length)
			{
				if (pos + length < this.element.textContent.length)
					selectedNodes.push(new SelectedNode(null, this, pos, length));
				else if (pos != this.element.textContent.length && length != 0)
					selectedNodes.push(new SelectedNode(null, this, pos, this.element.textContent.length - pos));
			}
			
			return selectedNodes;
		}, 
		
		isPosInside : function(pos)
		{
			if (pos < this.element.textContent.length)
				return true;
			return false;
		}, 
		
		getText : function(pos, length)
		{
			if (typeof(pos) == "undefined" || typeof(length) == "undefined")
				return this.element.data;
			return this.element.data.substr(pos, length);
		}
	}
);
