function testHtml(html, caretPos)
{
	if (!nte.testText())
		return false;
	
	var caretState = nte.caret.getState();
	var s = nte.getHtml();
	if (s.toLowerCase() != html.toLowerCase())
		return false;
	
	if (caretState.isSelected())
		return false;
	var s = caretState.getSelectionStart();
	if (s != caretPos)
		return false;
	
	return true;
}

function testSelectedHtml(html, caretPos, selectedNodes)
{
	if (!nte.testText())
		return false;
	
	var caretState = nte.caret.getState();
	
	var s = nte.getHtml();
	if (s.toLowerCase() != html.toLowerCase())
		return false;
	var p = nte.caret.getState().getSelectionStart();
	if (p != caretPos)
		return false;
	
	if (!selectedNodes && (caretState.selectedNodes.length > 1 || caretState.getSelectionLength() > 0))
		return false;
			
	if (selectedNodes)
	{
		if (selectedNodes.length != caretState.selectedNodes.length)
			return false;
		
		for (var i = 0; i < caretState.selectedNodes.length; ++i)
		{
			var n = caretState.selectedNodes[i];
			//var node = nte.getNodeById(n.id);
			var node = n.getNode();
			var text = node.getText(n.getPos(), n.length);
			if (selectedNodes[i] != text)
				return false;
		}
	}
	
	return true;
}

function testCaretPosition(caretPos)
{
	var caretState = nte.caret.getState();
	if (caretState.isSelected())
		return false;
	var s = caretState.getSelectionStart();
	if (s != caretPos)
		return false;
	
	return true;
}

function testFormula(formulaPos, tex, caretPos)
{
	var testTex = nte.testFormula(formulaPos);
	if (testTex != tex)
		return false;
	if (typeof(caretPos) != "undefined")
		return testCaretPosition(caretPos);
	return true;
}
