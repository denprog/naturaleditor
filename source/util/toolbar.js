/**
 * @constructor
 */
function Toolbar(nte, name, themeName, parentElement)
{
	this.nte = nte;
	this.name = name;
	this.parentElement = parentElement;
	this.themeName = themeName;
	
	this.init = function()
	{
		if (this.nte.isIE)
			this.table = this.parentElement.document.createElement("table");
		else
			this.table = this.parentElement.ownerDocument.createElement("table");
		this.parentElement.appendChild(this.table);
	};
	
	/**
	 * Adds a button to the toolbar
	 * @method addButton
	 * @param name {String} Button's name
	 * @param shortcut {} Keyboard shortcut for the button
	 * @param handler {} Calling function 
	 */
	this.addButton = function(name, shortcut, handler)
	{
		if (this.table.rows.length == 0)
			var tr = this.table.insertRow(-1);
		else
			var tr = this.table.rows[0];
		var td = tr.insertCell(-1);
		td.button = new ToolbarButton(this.nte, td, name, this.themeName, shortcut, handler);
		
		return td.button;
	};
	
	this.getButton = function(name)
	{
		var tr = this.table.rows[0];
		for (var i = 0; i < tr.cells.length; ++i)
		{
			var c = tr.cells[i];
			if (c.button && c.button.name == name)
				return c.button;
		}
		return null;
	};
	
	this.enableButton = function(name, enabled)
	{
		var button = this.getButton(name);
		if (button)
			button.enable(enabled);
	};
	
	this.pressButton = function(name, pressed)
	{
		var button = this.getButton(name);
		if (button)
			button.press(pressed);
	};
	
	/**
	 * Adds a combobox to the toolbar
	 * @method addComboBox
	 * @param name {String} Button's name
	 * @param shortcut {} Keyboard shortcut for the combobox
	 * @param handler {} Calling function 
	 */
	this.addComboBox = function(name, shortcut, obj, handler)
	{
		if (this.table.rows.length == 0)
			var tr = this.table.insertRow(-1);
		else
			var tr = this.table.rows[0];
		var td = tr.insertCell(-1);
		td.combo = new ToolbarComboBox(this.nte, td, name, this.themeName, shortcut, obj, handler);
		
		return td.combo;
	};

	this.getComboBox = function(name)
	{
		var tr = this.table.rows[0];
		for (var i = 0; i < tr.cells.length; ++i)
		{
			var c = tr.cells[i];
			if (c.combo && c.combo.name == name)
				return c.combo;
		}
		return null;
	};
	
	this.selectComboBox = function(name, value)
	{
		var c = this.getComboBox(name);
		if (!c)
			return;
		c.selectOption(value);
	};

	this.addMenu = function(name, rowsCount, columnsCount)
	{
		if (this.table.rows.length == 0)
			var tr = this.table.insertRow(-1);
		else
			var tr = this.table.rows[0];
		var td = tr.insertCell(-1);
		td.menu = new ToolbarMenu(this.nte, td, name, this.themeName, rowsCount, columnsCount);
		
		return td.combo;
	};

	this.getMenu = function(name)
	{
		var tr = this.table.rows[0];
		for (var i = 0; i < tr.cells.length; ++i)
		{
			var c = tr.cells[i];
			if (c.menu && c.menu.name == name)
				return c.menu;
		}
		return null;
	};

	this.addMenuButton = function(name, value, handler, row, column)
	{
		var c = this.getMenu(name);
		if (!c)
			return;
		c.addItem(value, handler, row, column);
	};
		
	this.init();
}

/**
 * @constructor
 */
function ToolbarButton(nte, parentElement, name, themeName, shortcut, handler, obj)
{
	this.nte = nte;
	this.parentElement = parentElement;
	this.handler = handler;
	this.name = name;
	this.themeName = themeName;
	this.obj = obj;
	
	this.init = function()
	{
		this.parentElement.innerHTML = 
			"<a id='nte_" + name + "' class='" + this.themeName + " nte_toolbar_button' onclick='return false;'" + 
			"onmousedown='return false;' href='javascript:;'><span class='classic nte_toolbar_icon nte_" + name + 
			" nte_toolbar_button_enabled'/></a>";
		this.link = this.parentElement.childNodes[0];
		var t = this;
		
		this.link.onclick = function(event)
			{
				t.handler.apply(t.obj ? t.obj : t.nte, []);
				//return false;
				if (event.preventDefault)
					event.preventDefault();
				else
					event.returnValue = false;
				if (event.stopPropagation)
					event.stopPropagation();
				else
					event.cancelBubble = true;
			}; 
	};

	this.enable = function(enabled)
	{
		var s = this.link.childNodes[0];
		if (enabled)
		{
			if (!s.className.match(/\bnte_toolbar_button_enabled\b/))
				s.className += " nte_toolbar_button_enabled";
			if (s.className.match(/\bnte_toolbar_button_disabled\b/))
				s.className = s.className.replace(/\bnte_toolbar_button_disabled\b/, '');
		}
		else
		{
			if (s.className.match(/\bnte_toolbar_button_enabled\b/))
				s.className = s.className.replace(/\bnte_toolbar_button_enabled\b/, '');
			if (!s.className.match(/\bnte_toolbar_button_disabled\b/))
				s.className += " nte_toolbar_button_disabled";
		}
	};
	
	this.press = function(pressed)
	{
		var s = this.link.childNodes[0];
		if (pressed)
		{
			if (!s.className.match(/\bnte_toolbar_button_pressed\b/))
				s.className += " nte_toolbar_button_pressed";
		}
		else
		{
			if (s.className.match(/\bnte_toolbar_button_pressed\b/))
				s.className = s.className.replace(/\bnte_toolbar_button_pressed\b/, '');
		}
		
		this.pressed = pressed;
	};
		
	this.init();
}

function ToolbarComboBox(nte, parent, name, themeName, shortcut, obj, handler)
{
	this.nte = nte;
	this.parent = parent;
	this.obj = obj;
	this.handler = handler;
	this.name = name;
	this.themeName = themeName;
	
	this.init = function()
	{
		this.parent.innerHTML = 
			"<select id='nte_" + name + "' class='" + this.themeName + " classic nte_toolbar_combobox'>" +
			"</select>";
		this.combo = this.parent.childNodes[0];
		var t = this;
		
		this.combo.onchange = function(event)
			{
				t.handler.apply(t.obj, [t.combo[t.combo.selectedIndex].value]);
				return false;
			};
	};

	this.enable = function(enabled)
	{
		var s = this.combo;
		if (enabled)
		{
			if (!s.className.match(/\bnte_toolbar_combo_enabled\b/))
				s.className += " nte_toolbar_combo_enabled";
			if (s.className.match(/\bnte_toolbar_combo_disabled\b/))
				s.className = s.className.replace(/\bnte_toolbar_combo_disabled\b/, '');
		}
		else
		{
			if (s.className.match(/\bnte_toolbar_combo_enabled\b/))
				s.className = s.className.replace(/\bnte_toolbar_combo_enabled\b/, '');
			if (!s.className.match(/\bnte_toolbar_combo_disabled\b/))
				s.className += " nte_toolbar_combo_disabled";
		}
	};
	
	this.addOption = function(value, text)
	{
		this.combo.options.length = this.combo.options.length + 1;
		var i = this.combo.options.length;
		this.combo.options[i - 1].value = value;
		this.combo.options[i - 1].text = text;
	};
	
	this.selectOption = function(value)
	{
		for (var i = 0; i < this.combo.options.length; ++i)
		{
			if (this.combo.options[i].value == value)
			{
				this.combo.options[i].selected = true;
				break;
			}
		}
	};
	
	this.init();
}

function ToolbarMenu(nte, parentElement, name, themeName, rowsCount, columnsCount)
{
	this.nte = nte;
	this.parentElement = parentElement;
	this.name = name;
	this.themeName = themeName;
	this.rowsCount = rowsCount;
	this.columnsCount = columnsCount;
	this.links = new Array();

	this.init = function()
	{
		this.button = new ToolbarButton(this.nte, this.parentElement, this.name, this.themeName, null, this.buttonHandler, this);

		if (this.nte.isIE)
		{
			this.div = this.parentElement.document.createElement("div");
			this.table = this.parentElement.document.createElement("table");
		}
		else
		{
			this.div = this.parentElement.ownerDocument.createElement("div");
			this.table = this.parentElement.ownerDocument.createElement("table");
		}

		var el = this.button.link;
		var x = 0, y = this.button.link.offsetHeight;
		while (el && el != this.nte.editor)
		{
			if (el.offsetLeft)
				x += el.offsetLeft;
			if (el.offsetTop)
				y += el.offsetTop;
			el = el.offsetParent;
		}

		this.div.className += " nte_toolbar_menu";
		this.div.style.left = x + "px";
		this.div.style.top = y + "px";
		this.div.style.display = "none";

		this.div.appendChild(this.table);
		this.parentElement.appendChild(this.div);

		for (var i = 0; i < this.rowsCount; ++i)
		{
			var tr = this.table.insertRow(-1);
			for (var j = 0; j < this.columnsCount; ++j)
				tr.insertCell(-1);
		}
	};

	this.buttonHandler = function()
	{
		if (this.div.style.display == "none")
		{
			this.nte.killFocus();
			this.div.style.display = "inline";

//			var t = this;

//			for (var i = 0; i < this.links.length; ++i)
//			{
//				this.links[i].t = this;
//				this.links[i].onclick = function(event)
//					{
//						var t = this.t;
//						t.buttonHandler();
//						t.links[p].handler.apply(t.nte, []);
//						return false;
//					}; 
//			}
		}
		else
		{
			this.div.style.display = "none";
			this.nte.setFocus();
		}
	};

	//var t = this;

	this.addItem = function(value, handler, row, column)
	{
		this.table.rows[row].cells[column].innerHTML = 
			"<a id='nte_" + this.name + '_' + value + "' class='" + this.themeName + " nte_toolbar_button' onclick='return false;'" + 
			"onmousedown='return false;' href='javascript:;'><span class='classic nte_toolbar_math_icon nte_" + value + 
			" nte_toolbar_button_enabled'/></a>";
		var p = row * this.columnsCount + column;
		this.links[p] = this.table.rows[row].cells[column].childNodes[0];
		this.links[p].handler = handler;
		//this.links[p].t = this;
		var t = this;
		
		this.links[p].onclick = function(event)
			{
				//var t = this;
				t.buttonHandler();
				t.links[p].handler.apply(t.nte, []);
				return false;
			}; 
	};

	this.hide = function()
	{
		this.div.style.display = "none";
	};

	this.init();
}
