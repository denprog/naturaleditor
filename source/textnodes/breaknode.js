/**
 * @constructor
 */
var BreakNode = HtmlNode.extend(
	{
		init : function(parentNode, nodePos, textPos, nte)
		{
			this._super("br", null, parentNode, nodePos, textPos, nte);
			this.className = "BreakNode";
		}, 
		
		//caret functions

		getFirstPosition : function()
		{
			//return new CaretState(this, 0);
			return new CaretState(this.parentNode, this.parentNode.getChildPos(this));
		}, 

		getLastPosition : function()
		{
			//return new CaretState(this, 0);
			return new CaretState(this.parentNode, this.parentNode.getChildPos(this));
		}
	}
);
