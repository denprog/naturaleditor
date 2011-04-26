/**
 * @constructor
 */
var RootNode = HtmlNode.extend(
	{
		init : function(element, parentNode, pos, nte)
		{
			this._super(null, element, parentNode, pos, nte);
		}, 
		
		getLineBegin : function(childNode, continuousPos, y)
		{
			return new CaretState(null, 0, -1);
		}, 
		
		getLineEnd : function(childNode, continuousPos, y)
		{
			return new CaretState(null, 0, -1);
		}, 

		//caret functions
		
		/**
		 * Returns the next caret position.
		 * @method getNextPosition
		 * @param {CaretState} relativeState Relative caret state
		 */
		getNextPosition : function(relativeState, params)
		{
			var res = null;
			var node = relativeState.getNode();
			var i = this.getFirstLevelChildPos(node);

			//move to the first position of the next child node
			for (var pos = i + 1; pos < this.childNodes.count(); ++pos)
			{
				var n = this.childNodes.get(pos);
				res = n.getFirstPosition();
				if (res)
					break;
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
			var res = null;
			var node = relativeState.getNode();
			var i = this.getFirstLevelChildPos(node);

			if (relativeState.getSelectionStart() == 0)
			{
				//move to the last position of the previous child node
				for (var pos = i - 1; pos >= 0; --pos)
				{
					var n = this.childNodes.get(pos);
					res = n.getLastPosition();
					if (res)
						break;
				}
			}
			else
			{
				//move to the first position
				res = this.childNodes.get(i).getFirstPosition();
			}
			
			return res;
		},

		getUpperPosition : function(relativeState)
		{
			var n = relativeState.getNode();
			var p = this.getFirstLevelChildPos(n);
			
			if (p == 0)
				return null;
			
			return this.childNodes.get(p - 1).getUpperPosition(relativeState);
		},
		
		getLowerPosition : function(relativeState)
		{
			var n = relativeState.getNode();
			var p = this.getFirstLevelChildPos(n);
			
			if (p >= this.childNodes.count() - 1)
				return null;
			
			return this.childNodes.get(p + 1).getLowerPosition(relativeState);
		},

//		getNearsetPosition : function(x, y)
//		{
//			var dy = Number.MAX_VALUE;
//			var node = null;
//			
//			for (var i = 0; i < this.childNodes.count(); ++i)
//			{
//				var n = this.childNodes.get(i);
//				n.getNodeBounds(this.tempRect);
//				
//				if (Max.abs(y - this.tempRect.top) < dy)
//				{
//					dy = Max.abs(y - this.tempRect.top);
//					node = n;
//				}
//				if (Max.abs(y - this.tempRect.bottom) < dy)
//				{
//					dy = Max.abs(y - this.tempRect.bottom);
//					node = n;
//				}
//			}
//			
//			return node.getNearesPosition(x, y);
//		},

		canExpandSelection : function(selectedNode)
		{
			var n = selectedNode.getNode();
			if (n.isEmpty() || selectedNode.caretState.getSelectedNodesCount() > 1)
				return true;
			return false;
		},

		//editing
		
		insertChild : function(nodeEvent, command)
		{
			return false;
		}, 

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			if (node == this)
			{
				if (len == 0)
				{
					if (nodeEvent.right)
					{
						if (pos < this.childNodes.count())
							return this.getChildNode(pos - 1).mergeWithNextNode(nodeEvent, command);
					}
					else
					{
						if (pos > 0)
							return this.getChildNode(pos - 1).mergeWithNextNode(nodeEvent, command);
					}
				}
			}

			return this._super(node, pos, len, nodeEvent, command);
		},

		removeChild : function(nodeEvent, command)
		{
			if (this.childNodes.count() == 1)
			{
				//make a dublicate
				var d = this.childNodes.get(0).dublicate();
				this.removeChildNode(0);

				//insert a paragraph with an empty span
				var p = this.nte.createNode("p", null, this, 0, this.nte);

				nodeEvent.caretState.setToNode(p, 0);
				nodeEvent.resNode = this;
				nodeEvent.undoActionNodePos = this.getCaretPosition();

				nodeEvent.undo = function()
					{
						//remove the paragraph with the span
						this.removeChildNode(0);
						//return the dublicate
						this.insertChildNode(d, 0);
	
						nodeEvent.caretState.setToNode(this, 0, 1);
						nodeEvent.resNode = this;
						
						return true;
					};
				
				return true;
			}
			
			return this._super(nodeEvent, command);
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

			for (var i = pos; i < pos + len; ++i)
			{
				var n = this.getChildNode(pos);
				var m = this.nte.createNode(type, null, n, 0);
				for (var j = 1; j < n.getLength();)
				{
					m.addChildNode(n.getChildNode(1).dublicate());
					if (nodeStyle)
						m.addStyle(nodeStyle);
					n.removeChildNode(1);
				}
			}

			nodeEvent.caretState.setToNode(this, pos, len);
			nodeEvent.resNode = this;
			nodeEvent.undoActionNodePos = this.getCaretPosition();

			nodeEvent.undo = function(nodeEvent, command)
				{
					for (var i = pos; i < pos + len; ++i)
					{
						var n = this.getChildNode(pos);
						var m = n.getChildNode(0);
						
						for (var j = 0; j < m.getLength(); ++j)
							n.addChildNode(m.getChildNode(j).dublicate());
						
						n.removeChildNode(0);
						
						nodeEvent.caretState.setToNode(this, pos, len);
						nodeEvent.resNode = this;
						
						//return true;
					}

					return true;
				};
			
			return true;
		}, 
		
		doChangeChildType : function(nodeEvent, command)
		{
			var caretState = nodeEvent.caretState.dublicate();
			var s = caretState.selectedNodes[0];
			var type = nodeEvent.nodeType;
			
			var p = this.getFirstLevelChildPos(s.getNode());
			var node = this.getChildNode(p);
			var lastType = node.element.nodeName.toLowerCase();
			
			if (lastType == type)
				return false;
			
			//store parameters for undo, redo
			command.setParam(this, "pos", p);
			command.setParam(this, "lastType", lastType);

			//new type node
			var r = this.nte.createNode(type, null, this, p);
			
			//fill new node with the child nodes
			for (var i = 0; i < node.childNodes.count(); ++i)
			{
				var n = node.getChildNode(i).dublicate();
				r.addChildNode(n);
			}
			
			this.removeChildNode(p + 1);
			
			nodeEvent.resNode = this;
			nodeEvent.caretState.setCaretState(caretState);
			
			return true;
		}, 
		
		undoChangeChildType : function(nodeEvent, command)
		{
			//restore parameters
			var p = command.getParam(this, "pos");
			var node = this.getChildNode(p);
			var lastType = command.getParam(this, "lastType");
			
			//restore last type node
			var r = this.nte.createNode(lastType, null, this, p + 1);
			
			//fill with the child nodes
			for (var i = 0; i < node.childNodes.count(); ++i)
			{
				var n = node.getChildNode(i).dublicate();
				r.addChildNode(n);
			}

			this.removeChildNode(p);

			nodeEvent.resNode = this;

			return true;
		}, 
		
		doInsertLine : function(pos, nodeEvent, command)
		{
			nodeEvent.resNode = this;
			nodeEvent.caretState.setToNodeBegin(this.childNodes.get(pos));
			
			return true;
		}, 

		undoInsertLine : function(nodeEvent, command)
		{
			return true;
		}
	}
);

var BodyNode = HtmlNode.extend(
	/**
	 @lends BodyNode
	 */
	{
		/**
		 * Body html node
		 * @constructs
		 * @method init
		 * @param {} parentNode parent node
		 * @param {} nodePos node insert position
		 * @param {} textPos text insert position
		 * @param {} nte reference to nte
		 */
		init : function(parentNode, nodePos, textPos, nte)
		{
			this._super("body", null, parentNode, nodePos, textPos, nte);
		}
	}
);
