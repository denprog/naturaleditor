/**
 * The Natural Editor
 * @class
 * @param {Object} parent
 * @param {Object} themePath
 * @param {Object} cx
 * @param {Object} cy
 */
var NaturalEditor = Class.extend(
	{
		init : function(parent, themePath, cx, cy)
		{
			//var base = document.location.href.substr(0, document.location.href.lastIndexOf("/NaturalEditor/")) + "/NaturalEditor/";
			//this.loadCss(document, base + "style/styles.css");
			//this.loadCss(base + "themes/classic/toolbar.css");

			this.isOpera = window.opera && opera.buildNumber;
			this.isWebKit = /WebKit/.test(navigator.userAgent);
			this.isIE = !this.isWebKit && !this.isOpera && (/msie/).test(navigator.userAgent.toLowerCase());
			this.isIE6 = this.isIE && /MSIE [56]/.test(navigator.userAgent);
			this.isGecko = !this.isWebKit && /Gecko/.test(navigator.userAgent);
			this.isMac = navigator.userAgent.indexOf('Mac') != -1;
			this.isAir = /adobeair/i.test(navigator.userAgent);
			
			if (!this.isGecko)
			{
				this.inited = false;
			}
			else
			{
				var i = navigator.userAgent.indexOf("Firefox");
				var version = parseFloat(navigator.userAgent.substring(i + 8));
				if (version < 4)
				{
					i = navigator.userAgent.indexOf("IE");
					this.inited = false;
				}
				else
					this.inited = true;
			}
			
			this.drawLib = new SvgLib(this);
			
			/**
			 * Current theme
			 * @public
			 */
			this.theme = new Theme(this, parent, cx, cy);
			this.editor = this.theme.editor;
			this.document = this.editor.document;
			this.window = window;

			if (!this.inited)
			{
				this.editor.innerHTML = "This version of browser is incompatible!";
				return;
			}
			
			this.focus = true;
			
			/**
			 * Shortcuts
			 * @public
			 */
			this.shortcuts = new Array();
			/**
			 * Event handlers
			 * @public
			 */
			this.eventHandlers = {};
			this.eventsHandler = new EventsHandler(this);

			this.registerEvents();
			
			if (this.isIE)
				this.document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml", "#default#VML");
			
			/**
			 * Command manager
			 */
			this.commandManager = new CommandManager(this);
			
			/**
			 * Editor's caret
			 */
			this.caret = new Caret(this);
			
			/**
			 * Editor's root node
			 */
			this.rootNode = new RootNode(this.editor, null, 0, this);

			/**
			 * Editor's client rect
			 */
			this.clientRect = this.editor.getBoundingClientRect();

			this.caret.setToNodeBegin(this.rootNode);			
		}, 

		registerEvents : function()
		{
			this.eventsHandler.addGlobalShortcut("Left", this.onLeft);
			this.eventsHandler.addGlobalShortcut("Right", this.onRight);
			this.eventsHandler.addGlobalShortcut("Up", this.onUp);
			this.eventsHandler.addGlobalShortcut("Down", this.onDown);
			this.eventsHandler.addGlobalShortcut("Home", this.onHome);
			this.eventsHandler.addGlobalShortcut("End", this.onEnd);
			
//			this.eventsHandler.addGlobalShortcut("Ctrl+Left", this.onCtrlLeft);
//			this.eventsHandler.addGlobalShortcut("Ctrl+Right", this.onCtrlRight);
//			this.eventsHandler.addGlobalShortcut("Shift+Left", this.onShiftLeft);
//			this.eventsHandler.addGlobalShortcut("Shift+Right", this.onShiftRight);

			this.eventsHandler.addShortcut(this, "Ctrl+Z", this.onUndo);
			this.eventsHandler.addShortcut(this, "Ctrl+Y", this.onRedo);

			this.eventsHandler.addEvent(this, "onchar", this.onChar);
			this.eventsHandler.addEvent(this, "onclick", this.onClick);

			this.eventsHandler.addGlobalShortcut("Enter", this.onEnter);

			this.eventsHandler.addGlobalShortcut("+", this.onPlus);
			this.eventsHandler.addGlobalShortcut("-", this.onPlus);
			this.eventsHandler.addGlobalShortcut("*", this.onMultiply);
			this.eventsHandler.addGlobalShortcut("/", this.onDivision);
			this.eventsHandler.addGlobalShortcut("^", this.onCircumflex);
			
			this.eventsHandler.addGlobalShortcut("Backspace", this.onBackspace);
			this.eventsHandler.addGlobalShortcut("Delete", this.onDelete);
		},
		
		unregisterEvents : function()
		{
			this.eventsHandler.removeGlobalShortcut("Left");
			this.eventsHandler.removeGlobalShortcut("Right");
			this.eventsHandler.removeGlobalShortcut("Up");
			this.eventsHandler.removeGlobalShortcut("Down");
			this.eventsHandler.removeGlobalShortcut("Home");
			this.eventsHandler.removeGlobalShortcut("End");
			
//			this.eventsHandler.removeGlobalShortcut("Ctrl+Left");
//			this.eventsHandler.removeGlobalShortcut("Ctrl+Right");
//			this.eventsHandler.removeGlobalShortcut("Shift+Left");
//			this.eventsHandler.removeGlobalShortcut("Shift+Right");

			this.eventsHandler.removeShortcut(this, "Ctrl+Z");
			this.eventsHandler.removeShortcut(this, "Ctrl+Y");

			this.eventsHandler.removeEvent(this, "onchar");

			this.eventsHandler.removeGlobalShortcut("Enter");

			this.eventsHandler.removeGlobalShortcut("+");
			this.eventsHandler.removeGlobalShortcut("-");
			this.eventsHandler.removeGlobalShortcut("*");
			this.eventsHandler.removeGlobalShortcut("/");
			this.eventsHandler.removeGlobalShortcut("^");
			
			this.eventsHandler.removeGlobalShortcut("Backspace");
			this.eventsHandler.removeGlobalShortcut("Delete");
		},
		
		parseElement : function(element, parentNode, pos)
		{
			if (element.nodeName == "#text")
			{
				var el = element.cloneNode(false);
				parentNode.addTextNode(el);
				return parentNode;
			}

			var el = element.cloneNode(false);
			var node = this.createNode(el.tagName.toLowerCase(), el, parentNode, pos, this);

			for (var i = 0; i < element.childNodes.length; ++i)
			{
				el = element.childNodes[i].cloneNode(true);
				if (el.nodeType == 1)
					this.parseElement(el, node, i);
				else if (el.nodeType == 3)
					node.addTextNode(el);
			}
			
			return node;
		}, 

		parse : function(htmlText)
		{
			this.commandManager.reset();
			this.resetContent();
			
			var body = this.editor.document.createElement("body");
			body.innerHTML = htmlText;
			
			if (body.children)
			{
				for (var i = 0; i < body.children.length; ++i)
					this.parseElement(body.children[i], this.rootNode, i);
			}
			else
			{
				for (var i = 0; i < body.childNodes.length; ++i)
					this.parseElement(body.childNodes[i], this.rootNode, i);
			}
			
			this.caret.setToNodeBegin(this.rootNode.childNodes.get(0));
			
			this.rootNode.remake();
		}, 

		parseHtml : function(htmlText)
		{
			var body = this.editor.document.createElement("body");
			var resNode = new HtmlNode("body", body, null, 0, this);
			
			var el = this.editor.document.createElement("body");
			el.innerHTML = htmlText;
			
			for (var i = 0; i < el.childNodes.length; ++i)
				this.parseElement(el.childNodes[i], resNode, i);
			
			return resNode;
		}, 

		getClassName : function(tagName, element)
		{
			var tagNodes = 
			{
				'body' : "BodyNode", 
				'p' : "ParagraphNode", 
				'b' : "BoldNode", 
				'i' : "ItalicNode", 
				'u' : "UnderlineNode", 
				'h1' : "Header1Node", 
				'h2' : "Header2Node", 
				'h3' : "Header3Node",
				'br' : "BreakNode", 
				'span' : 
					{
						'' : 'SpanNode',
						'formula' : 'SvgFormulaNode', 
						'formula_text' : 'TextFormulaNode', 
						'formula_plus' : 'PlusFormulaNode', 
						'formula_minus' : 'MinusFormulaNode', 
						'formula_multiply' : 'MultiplyFormulaNode', 
						'formula_division' : 'DivisionFormulaNode', 
						'formula_exponentiation' : 'ExponentiationFormulaNode', 
						'formula_group' : 'GroupFormulaNode'
					},
				'foreignobject' : 'ForeignObjectFormulaNode', 
				'g' : 'GroupFormulaNode'
			};
			
			var t = tagNodes[tagName.toLowerCase()];
			if (typeof(t) == "object")
			{
				if (element)
				{
					for (var i = 0; i < element.classList.length; ++i)
					{
						for (var j in t)
						{
							if (j == element.classList[i])
								return window[t[j]];
						}
					}
				}
				
				if (typeof(t['']) != "undefined")
					return window[t['']];
			}
			else
				return window[tagNodes[tagName.toLowerCase()]];
			
			return null;
		},
		
		createNode : function(tagName, element, parentNode, pos)
		{
			var t = this.getClassName(tagName, element);

			if (t)
			{
				if (element)
				{
					if (parentNode && parentNode.createChildNode)
						return parentNode.createChildNode(t, pos);
					return new t(parentNode, pos, this);
				}
				
				if (typeof(t) != "undefined")
				{
					if (parentNode && parentNode.createChildNode)
						return parentNode.createChildNode(t, pos);
					return new t(parentNode, pos, this);
				}
			}
			else
			{
				//if (parentNode && parentNode.createChildNode)
				//	return parentNode.createChildNode(window[tagNodes[tagName.toLowerCase()]], pos);
				//return new window[tagNodes[tagName.toLowerCase()]](parentNode, pos, this);
			}
			
			return null;
		}, 

		createNodeByClassName : function(className, element, parentNode, pos)
		{
			var t = window[className];
			
			if (t)
			{
				if (element)
				{
					if (parentNode && parentNode.createChildNode)
						return parentNode.createChildNode(t, pos);
					return new t(parentNode, pos, this);
				}
				
				if (typeof(t) != "undefined")
				{
					if (parentNode && parentNode.createChildNode)
						return parentNode.createChildNode(t, pos);
					return new t(parentNode, pos, this);
				}
			}
			
			return null;
		},
		
		loadCss : function(document, fileName)
		{
			var r = document.createElement("link");
			r.setAttribute("rel", "stylesheet");
		  r.setAttribute("type", "text/css");
		  r.setAttribute("href", fileName);
		  
		  if (typeof(r) != "undefined")
		  	document.getElementsByTagName("head")[0].appendChild(r);
		},
		
		setFocus : function()
		{
			this.registerEvents();
			this.caret.show();
		},
		
		killFocus : function()
		{
			this.unregisterEvents();
			this.caret.hide();
		},
		
		resetContent : function()
		{
			this.rootNode.childNodes.reset();
		}, 
		
		onLeft : function()
		{
			this.caret.moveLeft();
			this.theme.update();
			return true;
		}, 
		
		onRight : function()
		{
			this.caret.moveRight();
			this.theme.update();
			return true;
		}, 
		
		onUp : function()
		{
			this.caret.moveUp();
			this.theme.update();
			return true;
		}, 
		
		onDown : function()
		{
			this.caret.moveDown();
			this.theme.update();
			return true;
		}, 
		
		onHome : function()
		{
			this.caret.moveHome();
			this.theme.update();
			return true;
		}, 

		onEnd : function()
		{
			this.caret.moveEnd();
			this.theme.update();
			return true;
		}, 

//		onCtrlLeft : function()
//		{
//			return this.caret.moveToPreviousWord();
//		}, 
//
//		onCtrlRight : function()
//		{
//			return this.caret.moveToNextWord();
//		},
//		
//		onShiftLeft : function()
//		{
//			return this.caret.selectLeft();
//		}, 
//		
//		onShiftRight : function()
//		{
//			return this.caret.selectRight();
//		}, 
		
		onChar : function(ch)
		{
			var node = this.caret.currentState.getNode();
			var str = ch;

			var bNode = node.hasTag("b");
			var iNode = node.hasTag("i");
			var uNode = node.hasTag("u");

			var b = this.theme.toolbar.getButton("bold");
			var bButton = b.pressed;
			b = this.theme.toolbar.getButton("italic");
			var iButton = b.pressed;
			b = this.theme.toolbar.getButton("underline");
			var uButton = b.pressed;
			
			if (bNode == bButton && iNode == iButton && uNode == uButton)
			{
				this.commandManager.insertText(ch);
			}
			else
			{
				if (uButton)
					str = "<u>" + str + "</u>";
				if (iButton)
					str = "<i>" + str + "</i>";
				if (bButton)
					str = "<b>" + str + "</b>";

				var n = this.parseHtml(str);
				this.commandManager.insert(n);
			}
			
//			var b = this.theme.toolbar.getButton("underline");
//			if (b && b.pressed && !node.hasTag("u"))
//				str = "<u>" + str + "</u>";
//
//			b = this.theme.toolbar.getButton("italic");
//			if (b && b.pressed && !node.hasTag("i"))
//				str = "<i>" + str + "</i>";
//			
//			b = this.theme.toolbar.getButton("bold");
//			if (b && b.pressed && !node.hasTag("b"))
//				str = "<b>" + str + "</b>";
			
//			if (str == ch)
//				this.commandManager.insertText(ch);
//			else
//			{
//				var n = this.parseHtml(str);
//				this.commandManager.insert(n);
//			}
			
			this.caret.currentState.getNode().scrollIntoView(this.caret.currentState.getPos());
			this.theme.update();
			return true;
		}, 
		
		onClick : function(x, y)
		{
			var r = this.editor.getBoundingClientRect();
			if (x > r.left && x < r.right && y > r.top && y < r.bottom)
			{
				var n = this.document.elementFromPoint(x, y);
				if (n)
				{
					var node = n.htmlNode;
					if (!node)
						return true;
					var c = node.getNearsetPosition(x - r.left, y - r.top);
					if (c)
						this.caret.setCaretState(c);
				}

				this.setFocus();
				return true;
			}

			var r = this.theme.toolbar.parentElement.getBoundingClientRect();
			if (x > r.left && x < r.right && y > r.top && y < r.bottom)
			{
				this.setFocus();
				return false;
			}
			
			this.killFocus();
			
			return false;
		},
		
		onEnter : function()
		{
			if (this.commandManager.insertLine())
				this.caret.currentState.getNode().scrollIntoView(this.caret.currentState.getPos());
			this.theme.update();
			return true;
		},
		
		onPlus : function()
		{
			if (this.caret.getFormula())
			{
				this.commandManager.insert(new PlusFormulaNode(null, 0, this));
				return true;
			}
			return false;
		},
		
		onMinus : function()
		{
			if (this.caret.getFormula())
			{
				this.commandManager.insert(new MinusFormulaNode(null, 0, this));
				return true;
			}
			return false;
		},
		
		onMultiply : function()
		{
			if (this.caret.getFormula())
			{
				this.commandManager.insert(new MultiplyFormulaNode(null, 0, this));
				return true;
			}
			return false;
		},
		
		onDivision : function()
		{
			var n = this.caret.getFormula();
			if (n)
			{
				this.commandManager.insert(null, this.caret.currentState.getNode().createDivisionFormulaNode);
				return true;
			}
			return false;
		},
		
		onCircumflex : function()
		{
			var n = this.caret.getFormula();
			if (n)
			{
				this.commandManager.insert(null, this.caret.currentState.getNode().createExponentationFormulaNode);
				return true;
			}
			return false;
		},

		onBackspace : function()
		{
			this.commandManager.remove(false);
			return true;
		}, 
		
		onDelete : function()
		{
			this.commandManager.remove(true);
			return true;
		}, 
		
		onUndo : function()
		{
			var res = this.commandManager.undo();
			this.theme.update();
			return res;
		},
		
		onRedo : function()
		{
			var res = this.commandManager.redo();
			this.theme.update();
			return res;
		},
		
		onBold : function()
		{
			this.theme.toolbar.pressButton("bold", true);
		},

		onItalic : function()
		{
			this.theme.toolbar.pressButton("italic", true);
		},

		onUnderline : function()
		{
			this.theme.toolbar.pressButton("underline", true);
		},
		
		onSave : function()
		{
		},
		
		onLoad : function()
		{
		},

		//tool functions
		
		//test functions

		getNextId : (function()
		{
			var nextNodeId = 1;
			return function()
				{
					return nextNodeId++;
				};
		})(), 

		setCaret : function(pos, length)
		{
			var s = this.rootNode.setCaret(pos, length);
			
			if (s.length > 1)
			{
				for (var i = 0; i < s.length;)
				{
					if (s[i].length == 0)
						s.splice(i, 1);
					else
						++i;
				}
			}
			
			this.caret.currentState.setSelectedNodes(s);
			if (length > 0)
				this.caret.currentState.beginCaretPos = false;
			this.caret.render();
		}, 

		setCaretPos : function(nodePos)
		{
			var node = this.rootNode;
			for (var i = nodePos.length - 1; i > 0; --i)
				node = node.childNodes.get(nodePos[i]);
			this.caret.setToNode(node, nodePos[0], 0);
		},

		moveCaretLeft : function(count)
		{
			for (var i = 0; i < count; ++i)
				this.onLeft();
		},

		moveCaretRight : function(count)
		{
			for (var i = 0; i < count; ++i)
				this.onRight();
		},

		moveCaretUp : function(count)
		{
			for (var i = 0; i < count; ++i)
				this.onUp();
		},
		
		moveCaretDown : function(count)
		{
			for (var i = 0; i < count; ++i)
				this.onDown();
		},
		
		insertHtml : function(htmlText)
		{
			var node = this.parseHtml(htmlText);
			return this.commandManager.insert(node);
		}, 

		insertText : function(text)
		{
			return this.commandManager.insertText(text);
		}, 

		deleteHtml : function(right)
		{
			this.commandManager.remove(right);
		}, 

		addType : function(type)
		{
			this.commandManager.addType(type);
		}, 
		
		changeType : function(type)
		{
			this.commandManager.changeType(type);
		}, 
		
		changeFontName : function(fontName)
		{
			this.commandManager.changeFontName(fontName);
		}, 

		changeFontSize : function(fontSize)
		{
			this.commandManager.changeFontSize(fontSize);
		}, 
		
		insertLine : function()
		{
			this.commandManager.insertLine();
		}, 

		getHtml : function()
		{
			var el = document.createElement(this.rootNode.element.nodeName);
			
			for (var i = 0; i < this.rootNode.childNodes.count(); ++i)
			{
				var n = this.rootNode.childNodes.get(i).element;
	      el.appendChild(n.cloneNode(true));
			}
			
      return el.innerHTML;
		},
		
//		toTex : function()
//		{
//		},
		
		testText : function()
		{
			return this.rootNode.testText();
		},
		
		testFormula : function(caretPos)
		{
			var node = this.rootNode;
			for (var i = caretPos.length - 1; i > 0; --i)
				node = node.childNodes.get(caretPos[i]);

			return node.childNodes.get(caretPos[0]).toTex();
		}
	}
);
