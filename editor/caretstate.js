/**
 * Caret state.
 * @class CaretState
 */
function CaretState(node, pos, length)
{
	if (node)
		this.nte = node.nte;
	this.selectedNodes = new Array();
	this.beginCaretPos = true;
	
	this.setToNode = function(node, pos, length)
	{
		clearSelectedNodes.apply(this);
		this.selectedNodes.push(new SelectedNode(this, node, pos, length));
		this.updateSelectedNodes();
	};

	this.setToNodeBegin = function(node)
	{
		clearSelectedNodes.apply(this);
		var p = node.getFirstPosition();
		this.selectedNodes = p.selectedNodes;
		this.updateSelectedNodes();
	};
	
	this.setToNodeEnd = function(node)
	{
		clearSelectedNodes.apply(this);
		var p = node.getLastPosition();
		this.selectedNodes = p.selectedNodes;
		this.updateSelectedNodes();
	};
	
	this.continueSelection = function(node, pos)
	{
	};

	this.setCaretState = function(caretState)
	{
		this.setSelectedNodes(caretState.selectedNodes);
	};

	this.setNodeSelected = function(node)
	{
		this.nte = node.nte;
		clearSelectedNodes.apply(this);
		this.selectedNodes.push(new SelectedNode(this, node, 0, node.childNodes.count() - 1));
		this.updateSelectedNodes();
	};

	this.setSelectedNode = function(selectedNode)
	{
		this.nte = selectedNode.getNode().nte;
		clearSelectedNodes.apply(this);
		selectedNode.caretState = this;
		this.selectedNodes.push(selectedNode);
		this.updateSelectedNodes();
	};

	this.addSelectedNode = function(selectedNode)
	{
		this.nte = selectedNode.getNode().nte;
		selectedNode.caretState = this;
		this.selectedNodes.push(selectedNode);
		this.updateSelectedNodes();
	};

	this.insertSelectedNode = function(pos, selectedNode)
	{
		this.nte = selectedNode.getNode().nte;
		selectedNode.caretState = this;
		this.selectedNodes.splice(pos, 0, selectedNode);
		this.updateSelectedNodes();
	};

	this.setSelectedNodes = function(selectedNodes)
	{
		this.nte = selectedNodes[0].getNode().nte;
		for (var i = 0; i < selectedNodes.length; ++i)
			selectedNodes[i].caretState = this;
		this.selectedNodes = selectedNodes;
		this.updateSelectedNodes();
	};

	this.replaceSelectedNode = function(lastNode, newNode, pos, length)
	{
		var s = this.findSelectedNode(lastNode);
		if (!s)
		{
			clearSelectedNodes.apply(this);
			this.addSelectedNode(new SelectedNode(this, newNode, pos, length));
		}
		else
		{
			var p = getSelectedNodePos(s);
			removeSelectedNode.apply(this, [p]);
			this.selectedNode.splice(p, 0, new SelectedNode(this, newNode, pos, length));
			this.updateSelectedNodes();
		}
	};
	
	this.removeInnerSelectedNode = function(node)
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
		{
			var s = this.selectedNodes[i];
			if (s.getNode().childNodes.count() == 0)
				continue;
			for (var j = s.getPos(); j < s.getPos() + s.length; ++j)
			{
				if (s.getNode().childNodes.get(j) == node)
				{
					if (s.length == 1)
						s.length = 0;
					else
						--s.length;
					break;
				}
			}
			if (s.length == 0)
				removeSelectedNode.apply(this, [i]);
		}
	};
	
	this.isNodeSelected = function(node)
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
		{
			var s = this.selectedNodes[i];
			var n = s.getNode();
			if (!n || n.childNodes.count() == 0)
				continue;
			for (var j = s.getPos(); j < s.getPos() + s.length; ++j)
			{
				if (s.getNode().childNodes.get(j) == node)
					return true;
			}
		}
		
		return false;
	};
	
	this.findSelectedNode = function(node)
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
		{
			var s = this.selectedNodes[i];
			if (s.getNode() == node)
				return s;
		}
		
		return null;
	};
	
	var getSelectedNodePos = function(s)
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
		{
			if (this.selectedNodes[i] == s)
				return i;
		}
		
		return -1;
	};

	var removeSelectedNode = function(pos)
	{
		this.selectedNodes[pos].getNode().caretState = null;
		this.selectedNodes.splice(pos, 1);
	};
	
	var clearSelectedNodes = function()
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
		{
			var n = this.selectedNodes[i].getNode();
			if (n)
				n.caretState = null;
		}
		this.selectedNodes.length = 0;
	};
	
	this.isSelected = function()
	{
		if (this.selectedNodes.length > 1)
			return true;
		if (this.selectedNodes[0].length > 0)
			return true;
		return false;
	};

	this.getSelectedNodesCount = function()
	{
		return this.selectedNodes.length;
	};
	
	this.getNode = function()
	{
		if (this.selectedNodes.length == 0)
			return null;
		if (this.selectedNodes.length == 1)
			return this.selectedNodes[0].getNode();
		return this.selectedNodes[0].getNode().parentNode;
	};

	this.getPos = function()
	{
		return this.selectedNodes[0].getPos();
	};
	
	this.getSelectionStart = function()
	{
		return this.selectedNodes[0].getPos();
	};

	this.getSelectionLength = function()
	{
		return this.selectedNodes[0].length;
	};

	this.getSelectionEnd = function()
	{
		//return this.selectedNodes.getLast().pos + this.selectedNodes.getLast().length;
	};

	this.getSelectedNode = function(node)
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
		{
			var s = this.selectedNodes[i];
			if (s.getNode() == node)
				return s;
		}
		
		return null;
	};
	
	this.getSelectedNodePos = function(selectedNode)
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
		{
			if (this.selectedNodes[i] == selectedNode)
				return i;
		}
		
		return -1;
	};

	this.store = function()
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
			this.selectedNodes[i].store();
	};
	
	this.restore = function()
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
			this.selectedNodes[i].restore();
	};
	
	/**
	 * Makes a dublicate of this object
	 * @method dublicate
	 */
	this.dublicate = function()
	{
		var caretState = new CaretState();
		caretState.nte = this.nte;
		
		for (var i = 0; i < this.selectedNodes.length; ++i)
			caretState.selectedNodes.push(this.selectedNodes[i].dublicate());
	
		caretState.beginCaretPos = this.beginCaretPos;
	
		return caretState;
	};

	this.isEqual = function(caretState)
	{
		return this.getNode() == caretState.getNode() && this.getPos() == caretState.getPos();
	};
	
	this.updateSelectedNodes = function()
	{
		for (var i = 0; i < this.selectedNodes.length; ++i)
		{
			var s = this.selectedNodes[i];
			
			//check whether the node is present
			var n = s.getNode();
	
			//check the next state does not refer the same node
			if (i < this.selectedNodes.length - 1)
			{
				var t = this.selectedNodes[i + 1];
				if (t.getNode() == n)
				{
					++s.length;
					this.selectedNodes.splice(i + 1, 1);
					//check from the very beginning
					i = -1;
					continue;
				}
			}
			
			//check whether the is fully selected
			if (s.getPos() == 0 && s.length > 0)
			{
				if (s.length == n.getLength() && n.parentNode && n.parentNode.canExpandSelection(s))
				{
					//select parent's child node instead of that
					removeSelectedNode.apply(this, [i]);
					this.selectedNodes.splice(i, 0, new SelectedNode(this, n.parentNode, n.parentNode.getChildPos(n), 1));
					//check from the very beginning
					i = -1;
				}
			}
		}
	};

	this.checkOnNode = function(node)
	{
		var parent = this.getNode();
		var pos = this.getPos();
		
		//return parent.childNodes.get(pos) == node || (pos != 0 && pos == parent.childNodes.count() && parent.childNodes.get(pos - 1) == node);
		return parent.childNodes.get(pos) == node;
	};
	
	this.checkInNode = function(node)
	{
		var n = this.getNode();
		
		return n == node || node.isChild(n);
	};
	
	this.checkAtLast = function()
	{
		var parent = this.getNode();
		var pos = this.getPos();
		
		return pos != 0 && pos == parent.childNodes.count();
	};
	
	this.getRect = function(posRect)
	{
		this.getNode().getRelativePosBounds(this.getPos(), posRect);
	};
	
	if (node)
		this.setToNode(node, pos, length);
};

function CaretPosition(node, pos)
{
	this.positions = new Array();
	
	this.nte = node.nte;

	this.getNode = function()
	{
		var n = this.nte.rootNode;
		
		for (var i = this.positions.length - 1; i > 0; --i)
		{
			var p = this.positions[i];
			if (!n)
				return null;
			n = n.childNodes.get(p);
		}
		
		return n;
	};

	this.getPos = function()
	{
		return this.positions[0];
	};

	this.positions.push(pos);

	var p = node.getNodePos();
	for (var i = 0; i < p.length; ++i)
		this.positions.push(p[i]);
};

function SelectedNode(caretState, node, pos, length)
{
	this.caretPosition = new CaretPosition(node, pos);
	this.caretState = caretState;
	
	if (!length)
		this.length = 0;
	else
		this.length = length;

	if (caretState)
		node.caretState = caretState;

	this.getNode = function()
	{
		if (!this.caretPosition)
			return null;
		return this.caretPosition.getNode();
	};
	
	this.getPos = function()
	{
		return this.caretPosition.getPos();
	};

	var storedParentNode = null;
	var storedPos = -1;
	var storedNode = null;
	
	this.store = function()
	{
		storedParentNode = this.getNode();
		if (storedParentNode instanceof TextNode)
			storedPos = this.getPos();
		else
		{
			//if the caret position is at the end of the collection, storedNode = null
			if (this.getPos() != storedParentNode.childNodes.count())
				storedNode = storedParentNode.childNodes.get(this.getPos());
		}
	};
	
	this.restore = function()
	{
		if (!storedParentNode)
			this.caretPosition = null;
		else
		{
			if (storedPos != -1)
				this.caretPosition = new CaretPosition(storedParentNode, storedPos);
			else
			{
				if (storedNode == null)
				{
					//the caret position is at the end of the collection
					var c = storedParentNode.getLastPosition();
					this.caretPosition = new CaretPosition(c.getNode(), c.getPos());
//					var n = storedParentNode.childNodes.getLast();
//					if (n instanceof TextFormulaNode)
//						this.caretPosition = new CaretPosition(n, n.getLength());
//					else
//						this.caretPosition = new CaretPosition(storedParentNode, storedParentNode.childNodes.count());
				}
				else
					this.caretPosition = new CaretPosition(storedParentNode, storedNode == null ? storedParentNode.childNodes.count() : storedParentNode.getChildPos(storedNode));
			}
		}

		storedParentNode = null;
		storedPos = -1;
		storedNode = null;
	};
	
	this.dublicate = function()
	{
		return new SelectedNode(this.caretState, this.getNode(), this.getPos(), this.length);
	};
};
