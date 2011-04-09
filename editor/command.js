/**
 * @constructor
 */
function CommandManager(nte)
{
	this.undoCommands = new Array();
	this.redoCommands = new Array();
	
	this.nte = nte;
	
	this.insert = function(node, action, params, commit)
	{
		var caretState = this.nte.caret.getState();
		var lastCaretState = caretState.dublicate();

		if (typeof(commit) == "undefined")
			commit = true;

		if (node && node.element.childNodes.length == 0)
			return false;

		var nodeEvent = new NodeEvent();

		if (caretState.isSelected())
		{
			if (!this.remove(true, false))
				return false;
			nodeEvent.caretState = this.nte.caret.getState();
		}
		else
			nodeEvent.caretState = caretState;
		
		nodeEvent.node = node;
		
		if (params)
			nodeEvent.params = params;
		
		var n = nodeEvent.caretState.getNode();
		
		var command = new Command(nodeEvent.caretState, action ? action : n.insertChild, null, this, "insert");
		if (command.doAction(nodeEvent, n))
		{
			this.undoCommands.splice(0, 0, command);
		}
		else
		{
			this.rollback();
			return false;
		}

		var nodeCaretState = this.undoCommands[0].caretState;

		if (nodeEvent.changedNode)
			var node = nodeEvent.changedNode;
		else
		{
			//merge the nodes if nessecary
			var node = nodeCaretState.getNode();
			if (node.parentNode)
				node = node.parentNode;
		}
		
		//if (mergeChildNodes.apply(this, [node, nodeCaretState]))
		//	resCaretState = this.undoCommands[0].caretState;
		mergeChildNodes.apply(this, [node, nodeCaretState]);

		if (commit)
		{
			this.redoCommands.length = 0;
			//this.undoCommands.splice(0, 0, new CommandsDelimiter(lastCaretState.dublicate(), nodeCaretState.dublicate()));
			this.undoCommands.splice(0, 0, new CommandsDelimiter(lastCaretState, nodeCaretState.dublicate()));
		}

		this.nte.caret.setState(nodeCaretState);
		
		return true;
	};
	
	/**
	 * Inserts a text respecting the current node's formatting.
	 * @method insertText
	 * @param text {object} Text form inserting
	 * @param commit {bool} Commit flag
	 */
	this.insertText = function(text, commit)
	{
		var caretState = this.nte.caret.getState();
		var lastCaretState = caretState.dublicate();

		if (typeof(commit) == "undefined")
			commit = true;

		if (text == "")
			return false;

		var nodeEvent = new NodeEvent();

		if (caretState.isSelected())
		{
			if (!this.remove(true, false))
				return false;
			nodeEvent.caretState = this.nte.caret.getState();
		}
		else
			nodeEvent.caretState = caretState;
		
		nodeEvent.text = text;
		
		var n = nodeEvent.caretState.getNode();
		
		var command = new Command(nodeEvent.caretState, n.insertChild, null, this, "insertText");
		if (command.doAction(nodeEvent, n))
		{
			this.undoCommands.splice(0, 0, command);
			n.eventsHandler.sendCustomEvent(n, "onaftertextinserted", null, n.parentNode);
		}
		else
		{
			this.rollback();
			return false;
		}

		var nodeCaretState = this.undoCommands[0].caretState;

		if (commit)
		{
			this.redoCommands.length = 0;
			this.undoCommands.splice(0, 0, new CommandsDelimiter(lastCaretState.dublicate(), nodeCaretState.dublicate()));
		}

		this.nte.caret.setState(nodeCaretState);
		
		return true;
	};

	this.remove = function(right, commit)
	{
		var caretState = this.nte.caret.getState();
		var lastCaretState = caretState.dublicate();

		if (typeof(commit) == "undefined")
			commit = true;

		if (typeof(right) == "undefined")
			right = true;

		var c = caretState.dublicate();
		
		for (var i = caretState.selectedNodes.length - 1; i >= 0; --i)
		{
			var s = caretState.selectedNodes[i].dublicate();
			var node = s.getNode();
			
			var nodeCaretState = new CaretState();
			nodeCaretState.setSelectedNode(s);

			var nodeEvent = new NodeEvent();
			nodeEvent.caretState = nodeCaretState;
			nodeEvent.right = right;
			
			node = nodeCaretState.getNode();

			var command = new Command(nodeCaretState, node.removeChild, null, this, "remove");
			if (command.doAction(nodeEvent, node))
			{
				this.undoCommands.splice(0, 0, command);
				node.eventsHandler.sendCustomEvent(node, "onafterchilddeleted", null, node.parentNode);
			}
			else
			{
				this.rollback();
				return false;
			}
		}

		nodeEvent.right = right;
		
		nodeCaretState = nodeEvent.caretState;
		
		//merge the nodes if nessecary
		var node = c.getNode();
		if (!node)
		{
			var node = caretState.getNode();
			if (node && node.parentNode)
				node = node.parentNode;
		}
		
		if (node && mergeChildNodes.apply(this, [node, nodeCaretState]))
			nodeCaretState = this.undoCommands[0].caretState;

		if (commit)
		{
			if (nodeCaretState)
			{
				this.redoCommands.length = 0;
				this.undoCommands.splice(0, 0, new CommandsDelimiter(lastCaretState, nodeCaretState.dublicate()));
			}
		}
		
		if (nodeCaretState)
			this.nte.caret.setState(nodeCaretState);
		
		return true;
	};

	/**
	 * Merges child nodes of the parentNode at the pos and pos + 1 positions
	 * @method mergeChildNodes
	 */
	var mergeChildNodes = function(node, caretState)
	{
		var nodeEvent = new NodeEvent();
		nodeEvent.caretState = caretState;

		var command = new Command(caretState, node.mergeWithNextNode, null, this, "merge");
		if (command.doAction(nodeEvent, node))
			this.undoCommands.splice(0, 0, command);
		else
		{
			var res = false;
			for (var i = 0; i < node.childNodes.count();)
			{
				if (!mergeChildNodes.apply(this, [node.childNodes.get(i), caretState]))
					++i;
				else
					res = true;
			}
			return res;
		}
		
		//merge the child nodes
		for (var i = 0; i < node.childNodes.count(); ++i)
		{
			var n = node.childNodes.get(i);
			mergeChildNodes.apply(this, [n, caretState]);
		}

		return true;
	};

	this.addType = function(nodeType, nodeStyle, nodeClass, commit)
	{
		var caretState = this.nte.caret.getState().dublicate();
		var lastCaretState = caretState.dublicate();
		var resCaretState = new CaretState();
		var caretStates = new Array();

		if (typeof(commit) == "undefined")
			commit = true;

		caretState.setNodeCaretState();
		
		for (var i = 0; i < caretState.selectedNodes.length; ++i)
		{
			var s = caretState.selectedNodes[i];
			var nodeCaretState = new CaretState();
			nodeCaretState.setSelectedNode(s.dublicate());

			var node = s.getNode();

			var nodeEvent = new NodeEvent();
			nodeEvent.caretState = nodeCaretState;
			nodeEvent.nodeType = nodeType;
			if (nodeStyle)
				nodeEvent.nodeStyle = nodeStyle;
			if (nodeClass)
				nodeEvent.nodeClass = nodeClass;

			var command = new Command(nodeCaretState, node.addType, null, this, "addType");
			if (command.doAction(nodeEvent, node))
			{
				this.undoCommands.splice(0, 0, command);

				if (node.childNodes.count() > 0)
				{
					for (var j = s.getPos(); j < s.getPos() + s.length; ++j)
					{
						var n = node.childNodes.get(j);
	
						if (n)
						{
							//normilize child types
							command = new Command(nodeCaretState, n.normilizeChildTypes, null, this, "normilize");
							if (command.doAction(nodeEvent, n))
								this.undoCommands.splice(0, 0, command);
						}
					}
				}

				resCaretState.addSelectedNode(nodeEvent.caretState.selectedNodes[0]);
			}
			else
				resCaretState.selectedNodes.splice(0, 0, nodeCaretState.selectedNodes[0]);
		}
		
		caretState.clearNodeCaretState();

		//merge the nodes if nessecary
		var node = resCaretState.getNode();
		if (mergeChildNodes.apply(this, [node, resCaretState]))
			var resCaretState = this.undoCommands[0].caretState;

		if (commit)
		{
			if (nodeCaretState && resCaretState)
			{
				this.redoCommands.length = 0;
				this.undoCommands.splice(0, 0, new CommandsDelimiter(lastCaretState.dublicate(), resCaretState.dublicate()));
			}
		}
		
		if (resCaretState.selectedNodes.length > 0)
			this.nte.caret.setState(resCaretState);

		return true;
	};

	this.changeType = function(nodeType, commit)
	{
		var caretState = this.nte.caret.getState();
		var lastCaretState = caretState.dublicate();
		var resCaretState = new CaretState();

		if (typeof(commit) == "undefined")
			commit = true;
		
		for (var i = 0; i < caretState.selectedNodes.length; ++i)
		{
			var s = caretState.selectedNodes[i];
			var nodeCaretState = new CaretState();
			nodeCaretState.setSelectedNode(s.dublicate());

			var node = s.getNode();

			var nodeEvent = new NodeEvent();
			nodeEvent.caretState = nodeCaretState;
			nodeEvent.nodeType = nodeType;

			var command = new Command(nodeCaretState, node.changeChildType, null, this, "changeType");
			if (command.doAction(nodeEvent, node))
			{
				this.undoCommands.splice(0, 0, command);
			}
		}

		if (commit)
		{
			if (nodeCaretState)
			{
				this.redoCommands.length = 0;
				this.undoCommands.splice(0, 0, new CommandsDelimiter(lastCaretState, nodeCaretState.dublicate()));
			}
		}
		
		if (nodeCaretState)
			this.nte.caret.setState(nodeCaretState);
		
		return true;
	};
	
	this.changeFontName = function(fontName, commit)
	{
		return this.addType("span", {"fontFamily" : fontName}, "", commit);
	};

	this.changeFontSize = function(fontSize, commit)
	{
		return this.addType("span", {"fontSize" : fontSize}, "", commit);
	};
	
	this.insertLine = function(commit)
	{
		var caretState = this.nte.caret.getState();
		var lastCaretState = caretState.dublicate();

		if (typeof(commit) == "undefined")
			commit = true;

		var nodeEvent = new NodeEvent();

		if (caretState.isSelected())
		{
			if (!this.remove(true, false))
				return false;
			nodeEvent.caretState = this.nte.caret.getState();
		}
		else
			nodeEvent.caretState = caretState;
		
		var nodeCaretState = nodeEvent.caretState.dublicate();
		var nodeEvent = new NodeEvent();
		nodeEvent.caretState = nodeCaretState;
		
		var n = nodeCaretState.getNode();
		
		var command = new Command(nodeCaretState, n.insertLine, null, this, "insertLine");

		if (command.doAction(nodeEvent, n))
		{
			this.undoCommands.splice(0, 0, command);
		}
		else
		{
			this.rollback();
			return false;
		}

		if (commit)
		{
			if (nodeCaretState)
			{
				this.redoCommands.length = 0;
				this.undoCommands.splice(0, 0, new CommandsDelimiter(lastCaretState, nodeCaretState.dublicate()));
			}
		}
		
		if (nodeCaretState)
			this.nte.caret.setState(nodeCaretState);

		return true;
	};
	
	/**
	 * @method undo
	 */
	this.undo = function()
	{
		if (this.undoCommands.length == 0)
			return false;
		
		var delimiter = null;
		while (this.undoCommands.length != 0 && this.undoCommands[0] instanceof CommandsDelimiter)
		{
			delimiter = this.undoCommands[0];
			this.undoCommands.splice(0, 1);
		}

		while (this.undoCommands.length != 0 && !(this.undoCommands[0] instanceof CommandsDelimiter))
		{
			var command = this.undoCommands[0];
			
			if (command.undoAction())
			{
				this.redoCommands.splice(0, 0, command);
				this.undoCommands.splice(0, 1);
			}
			else
			{
				this.rollback();
				return false;
			}
		}
		
		if (delimiter)
		{
			this.nte.caret.setState(delimiter.caretState.dublicate());
			this.redoCommands.splice(0, 0, delimiter);
		}
			
		return true;
	};
	
	/**
	 * @method redo
	 */
	this.redo = function()
	{
		if (this.redoCommands.length == 0)
			return false;

		var delimiter = null;
		while (this.redoCommands.length != 0 && this.redoCommands[0] instanceof CommandsDelimiter)
		{
			delimiter = this.redoCommands[0];
			this.redoCommands.splice(0, 1);
		}

		while (this.redoCommands.length != 0 && !(this.redoCommands[0] instanceof CommandsDelimiter))
		{
			var command = this.redoCommands[0];
		
			if (command.doAction(command.nodeEvent))
			{
			}
			
			this.undoCommands.splice(0, 0, command);
			this.redoCommands.splice(0, 1);
		}

		if (delimiter.afterCaretState)
			this.nte.caret.setState(delimiter.afterCaretState);
		
		this.undoCommands.splice(0, 0, delimiter);

		return true;
	};
	
	/**
	 * @method rollback
	 */
	this.rollback = function()
	{
		while (this.undoCommands.length != 0 && this.undoCommands[this.undoCommands.length - 1] != null)
		{
			if (this.undoCommands[0] instanceof CommandsDelimiter)
				break;
			
			this.undo();
		}
	};
	
	/**
	 * @method reset
	 */
	this.reset = function()
	{
		this.undoCommands.length = 0;
		this.redoCommands.length = 0;
	};
}

/**
 * @constructor
 */
function CommandsDelimiter(beforeCaretState, afterCaretState)
{
	this.caretState = beforeCaretState;
	this.afterCaretState = afterCaretState;
}

/**
 * @constructor
 */
function Command(caretState, doActionFunc, undo, commandManager, name)
{
	this.caretState = caretState;
	this.doActionFunc = doActionFunc;
	this.undo = undo;
	this.commandManager = commandManager;
	//this.nodeEvent;
	var nodeParams = {}; //array where a node stores its parameters
	var doActionNodePos = null;
	var undoActionNodePos = null;
	this.name = name;

	this.doAction = function(nodeEvent, node)
	{
		this.lastCaretState = this.caretState.dublicate();
		
		if (node)
		{
			var actionNode = node;
			doActionNodePos = node.getCaretPosition();
		}
		else
		{
			//var actionNode = this.caretState.getNode();
			var actionNode = doActionNodePos.getNode();
		}

		if (nodeEvent.node)
			var d = nodeEvent.node.dublicate(null);
		nodeEvent.caretState = this.caretState;
		
		var res = this.doActionFunc.apply(actionNode, [nodeEvent, this]);
		if (res)
		{
			this.undo = nodeEvent.undo;
			if (nodeEvent.undoActionNodePos)
				undoActionNodePos = nodeEvent.undoActionNodePos;
		}
		
		if (d)
			nodeEvent.node = d;
		
		this.nodeEvent = nodeEvent;
		this.caretState = this.nodeEvent.caretState;
		
		return res;
	};
	
	this.undoAction = function()
	{
		if (undoActionNodePos)
			var actionNode = undoActionNodePos.getNode();
		else
			var actionNode = this.caretState.getNode();
		
		var res = this.undo.apply(actionNode, [this.nodeEvent, this]);
		if (res)
		{
			this.caretState = this.lastCaretState.dublicate();
			actionNode.eventsHandler.sendCustomEvent(actionNode, "onupdated", null, actionNode);
		}
		
		return res;
	};
	
	this.setParam = function(node, name, value)
	{
		var p = node.getNodePos().toString();
		
		if (!nodeParams[p])
			nodeParams[p] = 
				{
				};
		nodeParams[p][name] = value;
	};
	
	this.getParam = function(node, name)
	{
		var p = node.getNodePos().toString();
		
		if (typeof(nodeParams[p]) == "undefined" || typeof(nodeParams[p][name]) == "undefined")
			return "";
		return nodeParams[p][name];
	};
}
