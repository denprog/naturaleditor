/**
 * @constructor
 */
function Theme(nte, parentElement, cx, cy)
{
	this.nte = nte;
	this.name = "classic";
	this.toolbars = new Array();
	
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
			"CommaFormulaNode" : 
				{
					1 : 
						{
							"width" : 6,
							"height" : 10
						}, 
					2 : 
						{
							"width" : 4, 
							"height" : 8
						}, 
					3 : 
						{
							"width" : 3, 
							"height" : 6
						}
				},
			"BracketsFormulaNode" : 
				{
					1 : 
						{
							"offset" : 3
						}, 
					2 : 
						{
							"offset" : 2
						}, 
					3 : 
						{
							"offset" : 1
						}
				},
			"ModulusFormulaNode" : 
				{
					1 : 
						{
							"offset" : 3
						}, 
					2 : 
						{
							"offset" : 2
						}, 
					3 : 
						{
							"offset" : 1
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
				},
			"EquationFormulaNode" : 
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
			"LimitFormulaNode" : 
				{
					1 : 
						{
							"expressionOffset" : 5,
							"limitExpressionOffset" : 0
						}, 
					2 : 
						{
							"expressionOffset" : 4,
							"limitExpressionOffset" : 0
						}, 
					3 : 
						{
							"expressionOffset" : 3,
							"limitExpressionOffset" : 0
						}
				},
			"FactorialFormulaNode" : 
				{
					1 : 
						{
							"shapeOffset" : 3
						}, 
					2 : 
						{
							"shapeOffset" : 2
						}, 
					3 : 
						{
							"shapeOffset" : 1
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
					"<td id='t1'>" + 
					"</td>" + 
				"</tr>" + 
//				"<tr>" + 
//					"<td id='t2'>" + 
//					"</td>" + 
//				"</tr>" + 
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
		{
			var t1 = new Toolbar(this.nte, "basic", this.name, frame.document.getElementById("t1"));
			//var t2 = new Toolbar(this.nte, "math", this.name, frame.document.getElementById("t2"));
		}
		else
		{
			var t1 = new Toolbar(this.nte, "basic", this.name, frame.ownerDocument.getElementById("t1"));
			//var t2 = new Toolbar(this.nte, "math", this.name, frame.ownerDocument.getElementById("t2"));
		}
		
		t1.addButton("bold", "Ctrl+B", this.nte.onBold);
		t1.addButton("italic", "Ctrl+I", this.nte.onItalic);
		t1.addButton("underline", "Ctrl+U", this.nte.onUnderline);
		t1.addButton("undo", "Ctrl+Z", this.nte.onUndo);
		t1.addButton("redo", "Ctrl+Y", this.nte.onRedo);
		
		var c = t1.addComboBox("Format", null, this.nte, this.nte.onFormat);
		for (var i in this.formats)
			c.addOption(i, this.formats[i]);

		c = t1.addComboBox("FontFamily", null, this, this.onFontFamily);
		for (var i in this.fontFamilies)
			c.addOption(i, i);

		c = t1.addComboBox("FontSize", null, this.nte, this.nte.onFontSize);
		for (var i in this.fontSizes)
			c.addOption(i, this.fontSizes[i]);

		this.toolbars.push(t1);

//		t2.addButton("formula", "Ctrl+F", this.nte.onFormula);

//		t2.addMenu("math", 5, 4);

//		t2.addMenuButton("math", "plus", this.nte.onPlus, 0, 0);
//		t2.addMenuButton("math", "minus", this.nte.onMinus, 0, 1);
//		t2.addMenuButton("math", "multiply", this.nte.onMultiply, 0, 2);
//		t2.addMenuButton("math", "division", this.nte.onDivision, 0, 3);
//		t2.addMenuButton("math", "squareroot", this.nte.onSquareRoot, 1, 0);
//		t2.addMenuButton("math", "nthroot", this.nte.onNthRoot, 1, 1);
//		t2.addMenuButton("math", "exponentation", this.nte.onCircumflex, 1, 2);
//		t2.addMenuButton("math", "subscript", this.nte.onSubscript, 1, 3);
//		t2.addMenuButton("math", "sum", this.nte.onSum, 2, 0);
//		t2.addMenuButton("math", "product", this.nte.onProduct, 2, 1);
//		t2.addMenuButton("math", "definiteintegral", this.nte.onDefiniteIntegral, 2, 2);
//		t2.addMenuButton("math", "differential", this.nte.onDifferential, 2, 3);
//		t2.addMenuButton("math", "factorial", this.nte.onFactorial, 3, 0);
//		t2.addMenuButton("math", "brackets", this.nte.onBrackets, 3, 1);
//		t2.addMenuButton("math", "squarebrackets", this.nte.onBrackets, 3, 2);
//		t2.addMenuButton("math", "comma", this.nte.onComma, 3, 3);
//		t2.addMenuButton("math", "equation", this.nte.onEquation, 4, 0);

//		this.toolbars.push(t2);

		this.editor.nte = this.nte;
	};
	
	/**
	 * Updates the toolbar
	 * @method update
	 */
	this.update = function()
	{
		var t = this.getToolbar("basic");
		if (!t)
			return;
		
		t.pressButton("bold", false);
		t.pressButton("italic", false);
		t.pressButton("underline", false);
		
		if (this.nte.caret.currentState)
			var node = this.nte.caret.currentState.getNode();
		if (node)
		{
			t.pressButton("bold", false);
			t.pressButton("italic", false);
			t.pressButton("underline", false);

			var p = node;
			while (p)
			{
				switch (p.element.nodeName.toLowerCase())
				{
				case "b":
					t.pressButton("bold", true);
					break;
				case "i":
					t.pressButton("italic", true);
					break;
				case "u":
					t.pressButton("underline", true);
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
						t.selectComboBox("Format", i);
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
											t.selectComboBox("FontFamily", i);
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
						t.selectComboBox("FontSize", i);
						break;
					}
				}
			}
		}

		var t = this.getToolbar("math");
		if (!t)
			return;
		t.getMenu("math").hide();
	};

	this.getToolbar = function(name)
	{
		for (var i = 0; i < this.toolbars.length; ++i)
		{
			if (this.toolbars[i].name == name)
				return this.toolbars[i];
		}

		return null;
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
