/**
 * @constructor
 */
function Theme(nte, parentElement, cx, cy)
{
	this.nte = nte;
	//this.editor;
	//this.caretPos;
	//this.toolbar;
	//this.testText;
	this.name = "classic";
	
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

		this.editor.document = this.editor.ownerDocument;

		if (DEBUG_LEVEL)
			var base = this.editor.document.location.href.substr(0, this.editor.document.location.href.lastIndexOf("/NaturalEditor/")) + "/NaturalEditor/";
		else
			var base = this.nte.getCurDirectory();

		this.nte.loadCss(DEBUG_LEVEL ? base + "themes/classic/toolbar.css" : base + "toolbar.css");
		
		if (this.nte.isIE)
			this.toolbar = new Toolbar(this.nte, this.name, frame.document.getElementById("toolbar1"));
		else
			this.toolbar = new Toolbar(this.nte, this.name, frame.ownerDocument.getElementById("toolbar1"));
		this.toolbar.addButton("bold", "Ctrl+B", this.nte.onBold);
		this.toolbar.addButton("italic", "Ctrl+I", this.nte.onItalic);
		this.toolbar.addButton("underline", "Ctrl+U", this.nte.onUnderline);
		this.toolbar.addButton("undo", "Ctrl+Z", this.nte.onUndo);
		this.toolbar.addButton("redo", "Ctrl+Y", this.nte.onRedo);
		
		this.editor.nte = this.nte;
	};
	
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
		}
	};
	
	this.init(parentElement, cx, cy);
}
