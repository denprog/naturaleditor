function Toolbar(nte, themeName, parentElement)
{
	this.nte = nte;
	this.parentElement = parentElement;
	this.themeName = themeName;
	this.table;
	
	this.init = function()
	{
		if (this.nte.isIE)
			this.table = this.parentElement.document.createElement("table");
		else
			this.table = this.parentElement.ownerDocument.createElement("table");
		this.parentElement.appendChild(this.table);
	};
	
	this.addButton = function(name, shortcut, handler)
	{
		if (this.table.rows.length == 0)
			var tr = this.table.insertRow(-1);
		else
			var tr = this.table.rows[0];
		var td = tr.insertCell(-1);
		
		td.button = new ToolbarButton(this.nte, td, name, this.themeName, shortcut, handler);
	};
	
	this.getButton = function(name)
	{
		var tr = this.table.rows[0];
		for (var i = 0; i < tr.cells.length; ++i)
		{
			var c = tr.cells[i];
			if (c.button.name == name)
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
	
	this.init();
}

function ToolbarButton(nte, parentElement, name, themeName, shortcut, handler)
{
	this.nte = nte;
	this.parentElement = parentElement;
	this.handler = handler;
	this.name = name;
	this.themeName = themeName;
	this.link;
	this.pressed;
	
	this.init = function()
	{
		this.parentElement.innerHTML = "<a id='nte_" + name + "' class='" + this.themeName + " classic nte_toolbar_button' onclick='return false;'" + 
			"onmousedown='return false;' href='javascript:;'><span class='nte_toolbar_icon nte_" + name + 
			" nte_toolbar_button_enabled'/></a>";
		this.link = this.parentElement.childNodes[0];
		var t = this;
		
		this.link.onclick = function(event)
			{
				t.handler.apply(t.nte, []);
				return false;
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
