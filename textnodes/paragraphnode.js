var ParagraphNode = HtmlNode.extend( 
	{
		init : function(parentNode, pos, nte)
		{
			this._super("p", null, parentNode, pos, nte);
			this.nte.createNode("br", null, this, 0);
		}, 
		
		isEmpty : function()
		{
			if (this.childNodes.count() == 0)
				return true;
			
			if (this.childNodes.count() == 1)
			{
				var n = this.childNodes.get(0);
				if (n.isEmpty())
				{
					var el = n.element.nodeName.toLowerCase();
					if (el == "br" || el == "#text")
						return true;
				}
			}
			
			return false;
		}, 

		addChildNode : function(childNode)
		{
			if (childNode.isEmpty())
				return;
			
			if (this.isEmpty())
				this.childNodes.reset();
			
			this._super(childNode);
		}, 

		insertChildNode : function(childNode, pos)
		{
			if (this.isEmpty() && !this.lineInserting)
			{
				if (childNode.element.nodeName.toLowerCase() == "#text" && childNode.isEmpty())
					return;
				
				this.childNodes.reset();
				this._super(childNode, 0);
			}
			else
				this._super(childNode, pos);
		}, 

		addTextNode : function(textNode)
		{
			if (this.isEmpty())
				this.childNodes.reset();
			this._super(textNode);
		}, 
		
		removeChildNode : function(pos)
		{
			if (this.isEmpty())
				return false;
			
			this._super(pos);
			if (this.childNodes.count() == 1)
			{
				var n = this.childNodes.get(0);
				if (n.element.nodeName.toLowerCase() == "br")
					return true;
				if (n.isEmpty())
				{
					this.childNodes.reset();
					this.nte.createNode("br", null, this, 0);
				}
			}
			else if (this.childNodes.count() == 0)
				this.nte.createNode("br", null, this, 0);
			
			return true;
		}, 
		
		removeChildNodeFromCollection : function(pos)
		{
			this._super(pos);

			if (this.childNodes.count() == 1)
			{
				var n = this.childNodes.get(0);
				if (n.element.nodeName.toLowerCase() == "br")
					return true;
				if (n.isEmpty())
				{
					this.childNodes.reset();
					this.nte.createNode("br", null, this, 0);
				}
			}
			else if (this.childNodes.count() == 0)
				this.nte.createNode("br", null, this, 0);
		}, 

		//caret functions
		
		renderCaret : function(selectedNode, range)
		{
			if (!this.isEmpty())
				return this._super(selectedNode, range);
			
			var r = this.tempRect;
			this.getNodeBounds(r);
			
			this.caret.paper.clearShapes();
			
			this.caret.paper.move(r.left, r.top);
			this.caret.paper.setSize(1, r.height);
			var r = this.caret.paper.line(0, 0, 0, r.height, "black");
			this.drawLib.animate("visibility", "visible", "hidden", "1", "indefinite", r);
		},

		/**
		 * Returns the first caret position of the node.
		 * @method getFirstPosition
		 */
		getFirstPosition : function()
		{
			if (this.isEmpty())
				return new CaretState(this, 0);
			return this._super();
		}, 
		
		/**
		 * Returns the last caret position of the node.
		 * @method getLastPosition
		 */
		getLastPosition : function()
		{
			if (this.isEmpty())
				return new CaretState(this, 0);
			return this._super();
		}, 

		getLineBegin : function(caretState)
		{
			var res = caretState;
			var c = res;
			var r = new Rect();
			var n = c.getNode();
			n.getPosBounds(c.getPos(), r);
			var x = r.left;
			
			while (c != null && r.left <= x)
			{
				res = c;
				x = r.left;
				n = c.getNode();
				
				if (n.hasSingleLine())
				{
					//omit the node because of having a single line
					c = n.getFirstPosition();
				}

				c = n.getPreviousPosition(c);
				
				if (!c || res.isEqual(c))
					return res;
				
				n = c.getNode();
				
				//check not going out the paragraph
				if (!this.isChild(n))
					return res;
				n.getPosBounds(c.getPos(), r);
			}
			
			return res;
		},
		
		getLineEnd : function(caretState)
		{
			var res = caretState;
			var c = res;
			var r = new Rect();
			var n = c.getNode();
			n.getPosBounds(c.getPos(), r);
			var x = r.left;
			
			while (c != null && r.left >= x)
			{
				res = c;
				x = r.left;
				n = c.getNode();
				
				if (n.hasSingleLine())
				{
					//omit the node because of having a single line
					c = n.getLastPosition();
				}
				
				c = n.getNextPosition(c);
				
				if (!c || res.isEqual(c))
					return res;
				
				n = c.getNode();
				
				//check not going out the paragraph
				if (!this.isChild(n))
					return res;
				
				n.getPosBounds(c.getPos(), r);
			}
			
			return res;
		},

		//editing

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
						if (this.isEmpty())
							this.childNodes.reset();
						if (n.isEmpty())
							n.childNodes.reset();

						var i = this.childNodes.count();
						
						//merge the nodes
						var c = n.childNodes.count();
						for (var j = 0; j < c; ++j)
							this.insertChildNode(n.childNodes.get(j).dublicate(), j);
						this.parentNode.removeChildNode(pos - 1);
						
						//return this;
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
						if (this.isEmpty())
							this.childNodes.reset();
						if (n.isEmpty())
							n.childNodes.reset();

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
			if (nodeEvent.node)
			{
				var node = nodeEvent.node;
				
				command.setParam(this, "pos", pos);
				var c = node.childNodes.count();
				command.setParam(this, "c", c);
				
				for (var i = 0; i < c; ++i)
					this.insertChildNode(node.childNodes.get(i), pos + i);
				
				nodeEvent.caretState.setToNodeEnd(node.childNodes.getLast());

				nodeEvent.caretState.store();
				this.normilize(command);
				nodeEvent.caretState.restore();

				nodeEvent.changedNode = this;
				//nodeEvent.undoActionNodePos = this.getCaretPosition();
			}
			else
			{
				var node = new TextNode(this.document.createTextNode(nodeEvent.text), this, 0, this.nte);
				nodeEvent.caretState.setToNodeEnd(node);
				nodeEvent.undoActionNodePos = this.getCaretPosition();
			}

			return true;
		}, 
		
		undoInsert : function(nodeEvent, command)
		{
			if (nodeEvent.node)
			{
				nodeEvent.caretState.store();
				this.unnormilize(command);
				nodeEvent.caretState.restore();
				nodeEvent.node = nodeEvent.node.dublicate();

				var c = command.getParam(this, "c");
				var pos = command.getParam(this, "pos");
				
				for (var i = 0; i < c; ++i)
					this.removeChildNode(pos);

				nodeEvent.caretState.setToNode(this, pos);
			}
			else
			{
				this.removeChildNode(0);
				nodeEvent.caretState.setToNode(this, 0);
			}
			
			return true;
		}, 

		doNormilizeChildTypes : function(nodeEvent, command)
		{
			var s = nodeEvent.caretState.selectedNodes[0];
			
			for (var i = s.getPos(); i < s.getPos() + s.length; ++i)
			{
				var n = this.childNodes.get(i);
				if (!n.doNormilizeChildTypes(nodeEvent, command))
					return false;
			}
			
			return true;
		}, 

		undoNormilizeChildTypes : function(nodeEvent, command)
		{
			var s = nodeEvent.caretState.selectedNodes[0];
			
			for (var i = s.getPos(); i < s.getPos() + s.length; ++i)
			{
				var n = this.childNodes.get(i);
				if (!n.undoNormilizeChildTypes(nodeEvent, command))
					return false;
			}
			
			return true;
		}, 
		
		//command functions
		
		doInsertLine : function(nodeEvent, command)
		{
			this.lineInserting = true;
			
			var s = nodeEvent.caretState.selectedNodes[0];
			var n = s.getNode();
			var pos = s.getPos();

			while (n != this)
			{
				var r = n.split(pos, command);
				n.normilize(command);
				if (!r)
					break;
				n = n.parentNode;
				pos = n.getChildPos(r);
			}
			
			n = this.split(pos, command);
			
			n.normilize(command);
			this.normilize(command);

			this.lineInserting = false;

			if (n.isEmpty())
				nodeEvent.caretState.setToNodeBegin(this);
			else
				nodeEvent.caretState.setToNodeBegin(n);
			
			return true;
		}, 
		
		undoInsertLine : function(nodeEvent, command)
		{
			nodeEvent.caretState.store();
			this.unnormilize(command);
			nodeEvent.caretState.restore();

			this.lineInserting = true;
			
			var n = this;
			
			while (n)
				n = n.merge(command);
			
			this.lineInserting = false;

			if (this.childNodes.count() == 0)
				this.nte.createNode("br", null, this, 0);

			return true;
		}, 

		doRemoveChild : function(node, pos, len, nodeEvent, command)
		{
			if (node == this)
			{
				if (pos == 0)
				{
					if (len == this.childNodes.count())
					{
						var dublicates = new Array();
						for (var i = pos; i < pos + len; ++i)
						{
							dublicates.push(this.childNodes.get(pos).dublicate());
							this.removeChildNode(pos);
						}

						//set the caret
						nodeEvent.caretState.setToNodeBegin(this.childNodes.get(pos));
						
						nodeEvent.undoActionNodePos = this.getCaretPosition();
			
						nodeEvent.undo = function()
							{
								//restore dublicates
								for (var i = 0; i < dublicates.length; ++i)
									this.insertChildNode(dublicates[i], i);
								
								return true;
							};
						
						return true;
					}
				}
			}
			
			return this._super(node, pos, len, nodeEvent, command);
		},

		mergeWithNextNode : function(nodeEvent, command)
		{
			if (command.name == "merge")
				return false;
			
			if (nodeEvent.caretState.getNode() != this)
			{
				//nodeEvent.caretState.store();
				var res = this._super(nodeEvent, command);
				//nodeEvent.caretState.restore();
			}
			else
				var res = this._super(nodeEvent, command);
			
			return res;
		}, 

		//util functions
		
		//command functions
		
		//test functions
		
		setCaret : function(pos, length)
		{
			if (this.isEmpty())
			{
				var selectedNodes = new Array();
				selectedNodes.push(new SelectedNode(null, this, 0, 0));
				return selectedNodes;
			}
			
			return this._super(pos, length);
		}
	}
);
