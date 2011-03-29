(function()
{
	var base = this.location.href.substr(0, this.location.href.lastIndexOf("/NaturalEditor/")) + "/NaturalEditor/";

	function include(url)
	{
		document.write('<script type="text/javascript" src="' + base + url + '"></script>');
	}
	
	function loadCss(fileName)
	{
		var r = document.createElement("link");
		r.setAttribute("rel", "stylesheet");
	  r.setAttribute("type", "text/css");
	  r.setAttribute("href", fileName);
	  
	  if (typeof(r) != "undefined")
	  	document.getElementsByTagName("head")[0].appendChild(r);
	}

	loadCss(base + "style/styles.css");
	
	include('lib/class.js');
	include('editor/naturaleditor.js');
	include('util/rect.js');
	include('editor/command.js');
	include('editor/caretstate.js');
	include('textnodes/nodescollection.js');
	include('editor/caret.js');
	include('editor/event.js');
	include('lib/svglib.js');
	include('textnodes/htmlnode.js');
	include('textnodes/textnode.js');
	include('textnodes/bodynode.js');
	include('textnodes/textbasenode.js');
	include('textnodes/paragraphnode.js');
	include('textnodes/unorderedlistnode.js');
	include('textnodes/boldnode.js');
	include('textnodes/italicnode.js');
	include('textnodes/underline.js');
	include('textnodes/breaknode.js');
	include('textnodes/spannode.js');
	include('textnodes/headernode.js');
	include('textnodes/referencenode.js');
	include('formulanodes/formulanode.js');
	include('formulanodes/svgformulanode.js');
	include('formulanodes/groupformulanode.js');
	include('formulanodes/compoundformulanode.js');
	include('formulanodes/shapeformulanode.js');
	include('formulanodes/foreignobjectformulanode.js');
	include('formulanodes/textformulanode.js');
	include('formulanodes/plusformulanode.js');
	include('formulanodes/minusformulanode.js');
	include('formulanodes/multiplyformulanode.js');
	include('formulanodes/divisionformulanode.js');
	include('formulanodes/exponentiationformulanode.js');
	include('formulanodes/squarerootformulanode.js');
	include('formulanodes/nthrootformulanode.js');
	include('formulanodes/emptyformulanode.js');
	include('util/toolbar.js');
	include('themes/classic/theme.js');
}());
