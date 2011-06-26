/**
 * @constructor
 */
function Theme(nte, parentElement, cx, cy)
{
	this.nte = nte;
	this.name = "classic";
	
	this.formats = 
		{
			"p" : "Paragraph", 
			"h1" : "Heading 1", 
			"h2" : "Heading 2", 
			"h3" : "Heading 3"
		};

	this.fontFamilies = 
		{
			"Arial" : 
				[
					"arial",
					"helvetica",
					"sans-serif"
				],  
			"Courier New" : 
				[
					"courier new", 
					"courier", 
					"monospace"
				],
			"Times New Roman" : 
				[
					"times new roman", 
					"times", 
					"serif"
				],
			"Tahoma" :
				[
					"tahoma", 
					"arial", 
					"helvetica", 
					"sans-serif"
				],
			"Verdana" : 
				[
					"verdana", 
					"arial", 
					"helvetica", 
					"sans-serif"
				]
		};
	
	this.fontSizes = 
		{
			8 : "8pt", 
			10 : "10pt", 
			12 : "12pt", 
			14 : "14pt", 
			16 : "16pt", 
			18 : "18pt", 
			20 : "20pt"
		};
	
	this.nodeStyles = 
		{
			"PlusFormulaNode" : 
				{
					1 : 
						{
							"width" : 10,
							"height" : 10
						}, 
					2 : 
						{
							"width" : 8, 
							"height" : 8
						}, 
					3 : 
						{
							"width" : 6, 
							"height" : 6
						}
				},
			"MinusFormulaNode" : 
				{
					1 : 
						{
							"width" : 10,
							"height" : 10
						}, 
					2 : 
						{
							"width" : 8, 
							"height" : 8
						}, 
					3 : 
						{
							"width" : 6, 
							"height" : 6
						}
				},
			"MultiplyFormulaNode" : 
				{
					1 : 
						{
							"width" : 10,
							"height" : 10
						}, 
					2 : 
						{
							"width" : 8, 
							"height" : 8
						}, 
					3 : 
						{
							"width" : 6, 
							"height" : 6
						}
				},
			"DivisionFormulaNode" : 
				{
					1 : 
						{
							"sideOffset" : 3, 
							"shapeOffset" : 3
						},
					2 :
						{
							"sideOffset" : 2, 
							"shapeOffset" : 2
						},
					3 : 
						{
							"sideOffset" : 1, 
							"shapeOffset" : 1
						}
				},
			"SubscriptFormulaNode" : 
				{
					1 : 
						{
							"subscriptOffset" : -10
						},
					2 : 
						{
							"subscriptOffset" : -8
						},
					3 : 
						{
							"subscriptOffset" : -5
						}
				}, 
			"DifferentialFormulaNode" : 
				{
					1 : 
						{
							"expressionOffset" : 6
						},
					2: 
						{
							"expressionOffset" : 3
						},
					3: 
						{
							"expressionOffset" : 2
						}
				}
		};
	
	this.init = function(parentElement, cx, cy)
	{
		if (this.nte.isIE)
			var frame = parentElement.document.createElement("span");
		else
			var frame = parentElement.ownerDocument.createElement("span");
		
		frame.innerHTML = 
			"<table border=1>" + 
				"<tr>" + 
					"<td id='toolbar1'>" + 
					"</td>" + 
				"</tr>" + 
				"<tr>" + 
					"<td id='nte'>" + 
						"<div id='naturaleditor' style='overflow:auto; position:relative; width:" + cx + "px; height:" + cy + "px'></div>" + 
					"</td>" + 
				"</tr>" + 
			"</table>";

		if (this.nte.isIE)
		{
			parentElement.appendChild(frame);
			this.editor = parentElement.document.getElementById("naturaleditor");
			this.caretPos = parentElement.document.getElementById("caret");
			this.testText = parentElement.document.getElementById("testText");
		}
		else
		{
			parentElement.appendChild(frame);
			this.editor = parentElement.ownerDocument.getElementById("naturaleditor");
			this.caretPos = parentElement.ownerDocument.getElementById("caret");
			this.testText = parentElement.ownerDocument.getElementById("testText");
		}

		if (!this.nte.isIE)
			this.editor.document = this.editor.ownerDocument;
		
		if (this.nte.isIE)
			this.toolbar = new Toolbar(this.nte, this.name, frame.document.getElementById("toolbar1"));
		else
			this.toolbar = new Toolbar(this.nte, this.name, frame.ownerDocument.getElementById("toolbar1"));
		
		this.toolbar.addButton("bold", "Ctrl+B", this.nte.onBold);
		this.toolbar.addButton("italic", "Ctrl+I", this.nte.onItalic);
		this.toolbar.addButton("underline", "Ctrl+U", this.nte.onUnderline);
		this.toolbar.addButton("undo", "Ctrl+Z", this.nte.onUndo);
		this.toolbar.addButton("redo", "Ctrl+Y", this.nte.onRedo);
		
		var c = this.toolbar.addComboBox("Format", null, this.nte, this.nte.onFormat);
		for (var i in this.formats)
			c.addOption(i, this.formats[i]);

		c = this.toolbar.addComboBox("FontFamily", null, this, this.onFontFamily);
		for (var i in this.fontFamilies)
			c.addOption(i, i);

		c = this.toolbar.addComboBox("FontSize", null, this.nte, this.nte.onFontSize);
		for (var i in this.fontSizes)
			c.addOption(i, this.fontSizes[i]);

		this.editor.nte = this.nte;
	};
	
	/**
	 * Updates the toolbar
	 * @method update
	 */
	this.update = function()
	{
		if (!this.toolbar)
			return;
		
		this.toolbar.pressButton("bold", false);
		this.toolbar.pressButton("italic", false);
		this.toolbar.pressButton("underline", false);
		
		if (this.nte.caret.currentState)
			var node = this.nte.caret.currentState.getNode();
		if (node)
		{
			this.toolbar.pressButton("bold", false);
			this.toolbar.pressButton("italic", false);
			this.toolbar.pressButton("underline", false);

			var p = node;
			while (p)
			{
				switch (p.element.nodeName.toLowerCase())
				{
				case "b":
					this.toolbar.pressButton("bold", true);
					break;
				case "i":
					this.toolbar.pressButton("italic", true);
					break;
				case "u":
					this.toolbar.pressButton("underline", true);
					break;
				}

				p = p.parentNode;
			}
			
			//update format combobox
			var f = node.getFormat();
			if (f)
			{
				f = f.toLowerCase();
				for (var i in this.formats)
				{
					if (i == f)
					{
						this.toolbar.selectComboBox("Format", i);
						break;
					}
				}
			}
			
			//update font family combobox
			var font = node.getFontFamily();
			if (font)
			{
				(function()
					{
						var ar = font.toLowerCase().split(",");
						for (var k in ar)
						{
							font = ar[k];
							
							var k = 0;
							var b = true;
							while (b)
							{
								b = false;
								for (var i in this.fontFamilies)
								{
									var f = this.fontFamilies[i];
									if (f.length > k)
									{
										b = true;
										if (f[k] == font)
										{
											this.toolbar.selectComboBox("FontFamily", i);
											return;
										}
									}
								}
								++k;
							}
						}
					}).apply(this, []);
			}
			
			//update font size combobox
			var size = node.getFontSize();
			if (size)
			{
				for (var i in this.fontSizes)
				{
					if (i == size)
					{
						this.toolbar.selectComboBox("FontSize", i);
						break;
					}
				}
			}
		}
	};

	this.setSize = function(cx, cy)
	{
		this.editor.style.width = cx;
		this.editor.style.height = cy;
	};
	
	this.onFontFamily = function(value)
	{
		var f = this.fontFamilies[value];
		var s = f[0];
		for (var i = 1; i < f.length; ++i)
			s += "," + f[i];
	};

	this.getNodeProperty = function(nodeName, level, property)
	{
		return this.nodeStyles[nodeName][level][property];
	};
	
	this.init(parentElement, cx, cy);
}
