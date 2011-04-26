/**
 * @constructor
 */
function EventsHandler(nte)
{
	this.nte = nte;
	var obj = this;
	
	//usual events

	this.addEvent = function(node, type, handler)
	{
		var h = this.eventHandlers[type];
		if (h.refs == 0)
			this.attach(type);
		++h.refs;
		
		node.eventHandlers[type] = handler;
	};
	
	this.removeEvent = function(node, type)
	{
		var h = this.eventHandlers[type];
		if (--h.refs <= 0)
			this.detach(type);

		node.eventHandlers[type] = null;
	};

//	this.eventFunc = function(event)
//	{
//		intermediateHandler(event, obj);
//	};
	
	this.attach = function(type)
	{
		if (this.nte.isIE)
		{
			this.nte.editor.document.body.attachEvent("on" + obj.eventHandlers[type].event, 
				function(event)
				{
					obj.eventHandlers[type].handler.apply(obj, [event]);
				}
				);
		}
		else
		{
			this.nte.window.addEventListener(obj.eventHandlers[type].event,
				function(event)
				{
					obj.eventHandlers[type].handler.apply(obj, [event]);
				},
				true
				);
		}
	};
	
	this.detach = function(type)
	{
		if (this.nte.isIE)
			this.nte.document.body.detachEvent(type, this.eventHandlers[type]);
		else
			this.nte.window.removeEventListener(type, this.eventHandlers[type], false);
	};
	
	//shortcuts
	
	var getKeyCombination = function(keys)
	{
		var k = {};
		if (keys == "+")
			var combination = "+";
		else
			var combination = keys.split("+");
		
		for (var i = 0; i < combination.length; ++i)
		{
			var c = combination[i].toLowerCase();
			switch (c)
			{
			case "ctrl":
				k["ctrl"] = true;
				break;
			case "shift":
				k["shift"] = true;
				break;
			case "alt":
				k["alt"] = true;
				break;
			default:
				k["key"] = c;
				break;
			}
		}
		
		return k;
	};
	
	this.addGlobalShortcut = function(keys, handler)
	{
		var ev;
		var k = getKeyCombination(keys);
		
		for (var i in this.nte.shortcuts)
		{
			var p = this.nte.shortcuts[i];
			if (p.combination.key == k.key && p.combination.ctrl == k.ctrl && p.combination.shift == k.shift && k.alt == k.alt)
			{
				p.handler = handler;
				return;
			}
		}
		
		this.nte.shortcuts.push({});
		var p = this.nte.shortcuts[this.nte.shortcuts.length - 1];
		p.combination = k;
		p.handler = handler;

		var h = this.eventHandlers["onglobalshortcut"];
		if (h.refs == 0)
			this.attach("onglobalshortcut");
		++h.refs;
	};
	
	this.removeGlobalShortcut = function(keys)
	{
		var k = getKeyCombination(keys);
		for (var i = 0; i < this.nte.shortcuts.length;)
		{
			var p = this.nte.shortcuts[i];
			if (p.combination.key == k.key && p.combination.ctrl == k.ctrl && p.combination.shift == k.shift && p.combination.alt == k.alt)
			{
				this.nte.shortcuts.splice(i, 1);
				break;
			}
			else
				++i;
		}
		
		var h = this.eventHandlers["onglobalshortcut"];
		if (h.refs > 0)
		{
			--h.refs;
			this.detach("onglobalshortcut");
		}
	};
	
	this.addShortcut = function(node, keys, handler)
	{
		var ev;
		
		var k = {};
		var combination = keys.split("+");
		for (var i = 0; i < combination.length; ++i)
		{
			var c = combination[i].toLowerCase();
			switch (c)
			{
			case "ctrl":
				k["ctrl"] = true;
				break;
			case "shift":
				k["shift"] = true;
				break;
			case "alt":
				k["alt"] = true;
				break;
			default:
				k["key"] = c;
				break;
			}
		}

		for (var i in node.shortcuts)
		{
			var p = node.shortcuts[i];
			if (p.combination == k)
			{
				p.handler = handler;
				return;
			}
		}
		
		node.shortcuts.push({});
		var p = node.shortcuts[node.shortcuts.length - 1];
		p.combination = k;
		p.handler = handler;

		var h = this.eventHandlers["onshortcut"];
		if (h.refs == 0)
			this.attach("onshortcut");
		++h.refs;
	};
	
	this.removeShortcut = function(node, type)
	{
		for (var i = 0; i < node.shortcuts.length;)
		{
			var s = node.shortcuts[i];
			if (s.combination == type)
			{
				node.shortcuts.splice(i, 1);
				break;
			}
			else
				++i;
		}
		
		var h = this.eventHandlers["onshortcut"];
		if (--h.refs <= 0)
			this.detach("onshortcut");
	};

	//custom events
	
	this.addCustomEvent = function(node, type, handler)
	{
		node.eventHandlers[type] = handler;
	};
	
	this.removeCustomEvent = function(node, type)
	{
		node.eventHandlers[type] = null;
	};
	
	this.sendCustomEvent = function(node, type, nodeEvent, destNode)
	{
		if (destNode && destNode.eventHandlers[type])
			destNode.eventHandlers[type].apply(destNode, [nodeEvent]);
	};
	
	//event handlers

	this.findEventHandler = function(type)
	{
		var curNode = this.nte.caret.currentNode;

		//the event's bubbling		
		while (curNode && curNode.eventHandlers[type] == null)
			curNode = curNode.parentNode;

		if (!curNode)
		{
			if (this.nte.eventHandlers[type])
				return this.nte;
			return null;
		}
		
		return curNode;
	};

	this.preventDefault = function(event)
	{
		if (event.preventDefault)
			event.preventDefault();
		else
			event.returnValue = false;
		if (event.stopPropagation)
			event.stopPropagation();
		else
			event.cancelBubble = true;
	};
		
	this.onkeydown = function(event)
	{
		if (event.cancelBubble)
			return;
		
		var handler = this.findEventHandler("onkeydown");
		if (handler && handler.eventHandlers["onkeydown"].apply(handler, [event.keyCode]))
			this.preventDefault(event);
	};

	this.onkeyup = function(event)
	{
		if (event.cancelBubble)
			return;
		
		var handler = this.findEventHandler("onkeyup");
		if (handler && handler.eventHandlers["onkeyup"].apply(handler, [event.keyCode]))
			this.preventDefault(event);
	};
	
	this.onkeypress = function(event)
	{
		if (event.cancelBubble)
			return;
		
		var handler = this.findEventHandler("onkeypress");
		if (handler && handler.eventHandlers["onkeypress"].apply(handler, [String.fromCharCode(event.keyCode)]))
			this.preventDefault(event);
	};

	this.onchar = function(event)
	{
		if (event.cancelBubble)
			return;
		
		if (event.ctrlKey || event.altKey)
			return;
		
		if (this.nte.isIE)
		{
			if (event.keyCode == 0)
				return;
			var character = String.fromCharCode(event.keyCode);
		}
		else
		{
			if (event.charCode == 0)
				return;
			var character = String.fromCharCode(event.charCode);
		}

		var handler = this.findEventHandler("onchar");
		if (handler && handler.eventHandlers["onchar"].apply(handler, [character]))
			this.preventDefault(event);
	};

	var specialKeys = 
		{
			27 : "esc", 
			13 : "enter", 
			32 : "space", 
			38 : "up", 
			40 : "down", 
			37 : "left", 
			39 : "right", 
			36 : "home", 
			35 : "end", 
			33 : "pageup", 
			34 : "pagedown", 
			46 : "delete", 
			8 : "backspace"
		};
	
	this.onglobalshortcut = function(event)
	{
		if (event.cancelBubble)
			return;
		
		var key;
		
		if (event.keyCode != 0)
		{
			if (specialKeys[event.keyCode])
				key = specialKeys[event.keyCode];
			else
				key = String.fromCharCode(event.keyCode).toLowerCase();

			for (var i in this.nte.shortcuts)
			{
				var s = this.nte.shortcuts[i];

				if (s.combination.key == key)
				{
					if ((s.combination.ctrl && !event.ctrlKey) || (!s.combination.ctrl && event.ctrlKey))
						continue;
					if ((s.combination.shift && !event.shiftKey) || (!s.combination.shift && event.shiftKey))
						continue;
					if ((s.combination.alt && !event.altKey) || (!s.combination.alt && event.altKey))
						continue;
					if (s.handler.apply(this.nte, []))
					{
						this.preventDefault(event);
						return;
					}
				}
			}
		}
		else
		{
			key = String.fromCharCode(event.charCode).toLowerCase();

			for (var i in this.nte.shortcuts)
			{
				var s = this.nte.shortcuts[i];

				if (s.combination.key == key)
				{
					if (s.handler.apply(this.nte, []))
					{
						this.preventDefault(event);
						return;
					}
				}
			}
		}
	};

	this.onshortcut = function(event)
	{
		if (event.cancelBubble)
			return;
		
		var key;
		
		if (specialKeys[event.keyCode])
			key = specialKeys[event.keyCode];
		else
			key = String.fromCharCode(event.keyCode).toLowerCase();

		var node = this.nte.caret.currentNode;
		
		while (node)
		{
			for (var i in node.shortcuts)
			{
				var s = node.shortcuts[i];

				if (s.combination.key == key)
				{
					if ((s.combination.ctrl && !event.ctrlKey) || (!s.combination.ctrl && event.ctrlKey))
						continue;
					if ((s.combination.shift && !event.shiftKey) || (!s.combination.shift && event.shiftKey))
						continue;
					if ((s.combination.alt && !event.altKey) || (!s.combination.alt && event.altKey))
						continue;
					if (s.handler.apply(node, []))
					{
						this.preventDefault(event);
						return;
					}
				}
			}

			node = node.parentNode;
		}
	};

	this.onclick = function(event)
	{
		if (event.cancelBubble)
			return;

		var handler = this.findEventHandler("onclick");
		if (handler && handler.eventHandlers["onclick"].apply(handler, [event.clientX, event.clientY]))
			this.preventDefault(event);
	};

	this.ondoubleclick = function(event)
	{
		if (event.cancelBubble)
			return;

		var handler = this.findEventHandler("ondoubleclick");
		if (handler && handler.eventHandlers["ondoubleclick"].apply(handler, [event.clientX, event.clientY]))
			this.preventDefault(event);
		event.dbl = true;
	};
	
	if (this.nte.isGecko && !this.nte.isWebKit)
	{
		this.eventHandlers = 
			{
				"onkeydown" : {event: "keydown", handler: this.onkeydown, refs: 0}, 
				"onkeyup" : {event: "keyup", handler: this.onkeyup, refs: 0}, 
				"onkeypress" : {event: "keypress", handler: this.onkeypress, refs: 0}, 
				"onglobalshortcut" : {event: "keypress", handler: this.onglobalshortcut, refs: 0}, 
				"onshortcut" : {event: "keypress", handler: this.onshortcut, refs: 0}, 
				"onchar" : {event: "keypress", handler: this.onchar, refs: 0}, 
				"onclick" : {event: "click", handler: this.onclick, refs: 0}, 
				"ondoubleclick" : {event: "dblclick", handler: this.ondoubleclick, refs: 0}
			};
	}
	else
	{
		this.eventHandlers = 
			{
				"onkeydown" : {event: "keydown", handler: this.onkeydown, refs: 0}, 
				"onkeyup" : {event: "keyup", handler: this.onkeyup, refs: 0}, 
				"onkeypress" : {event: "keypress", handler: this.onkeypress, refs: 0}, 
				"onglobalshortcut" : {event: "keydown", handler: this.onglobalshortcut, refs: 0}, 
				"onshortcut" : {event: "keypress", handler: this.onshortcut, refs: 0}, 
				"onchar" : {event: "keypress", handler: this.onchar, refs: 0}, 
				"onclick" : {event: "click", handler: this.onclick, refs: 0}, 
				"ondoubleclick" : {event: "dblclick", handler: this.ondoubleclick, refs: 0}
			};
	}
}
