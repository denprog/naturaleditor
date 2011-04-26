/**
 * @constructor
 */
var ItalicNode = HtmlNode.extend(
	/**
	 @lends HtmlNode
	 */
	{
		init : function(parentNode, pos, nte)
		{
			this._super("i", null, parentNode, pos, nte);
		}
	}
);
